require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const { AssemblyAI } = require("assemblyai");
const { createClient } = require("redis");

const aaiClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

const API_KEY = process.env.GEMINI_API_KEY;
const AI_MODEL = process.env.AI_MODEL;
const API_CONTEXT_APP = process.env.API_CONTEXT_APP;

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected!");
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
}

connectRedis();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}

function calculateStringSimilarityPercentage(string1, string2) {
  const a = string1.toLowerCase();
  const b = string2.toLowerCase();

  const distance = levenshteinDistance(a, b);

  const maxLength = Math.max(a.length, b.length);

  if (maxLength === 0) {
    return 100.0;
  }

  const similarityScore = (maxLength - distance) / maxLength;

  return parseFloat((similarityScore * 100).toFixed(2));
}

class UtilsController {
  aswerQuestion = async (req, res) => {
    try {
      const MAX_MESSAGES = 15;
      const EXPIRE_TIME = 3600;
      const userMessage = req.body.message;
      const userId = req.body.userId || "guest";

      // 1️⃣ Lưu tin nhắn người dùng vào Redis
      await redisClient.rPush(
        `chat:${userId}`,
        JSON.stringify({ role: "user", text: userMessage })
      );
      await redisClient.lTrim(`chat:${userId}`, -MAX_MESSAGES, -1);
      await redisClient.expire(`chat:${userId}`, EXPIRE_TIME);

      // 2️⃣ Lấy context gần nhất (ví dụ 10 tin)
      const history = await redisClient.lRange(`chat:${userId}`, -10, -1);
      const parsedHistory = history
        .map((msg) => {
          const { role, text } = JSON.parse(msg);
          return `${role === "user" ? "Người dùng" : "Bot"}: ${text}`;
        })
        .join("\n");

      // 3️⃣ Chuẩn bị prompt gửi lên Gemini
      const fullPrompt = `
${API_CONTEXT_APP}
Cuộc trò chuyện trước đó:
${parsedHistory}

Người dùng: ${userMessage}
Bot:
`;

      // 4️⃣ Gọi Gemini API
      const response = await fetch(
        `${AI_MODEL}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
          }),
        }
      );

      const data = await response.json();
      const botMessage =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Xin lỗi, tôi chưa hiểu.";

      // 5️⃣ Lưu phản hồi của bot vào Redis
      await redisClient.rPush(
        `chat:${userId}`,
        JSON.stringify({ role: "bot", text: botMessage })
      );
      await redisClient.lTrim(`chat:${userId}`, -MAX_MESSAGES, -1);
      await redisClient.expire(`chat:${userId}`, EXPIRE_TIME);

      // 6️⃣ Trả phản hồi về client
      res.json({ reply: botMessage });
    } catch (error) {
      console.error("❌ Lỗi xử lý chatbot:", error);
      res.status(500).json({ error: "Server error" });
    }
  };

  translate = async (req, res) => {
    try {
      const { text, sourceLang, targetLang } = req.body;
      if (!text || !sourceLang || !targetLang)
        return res
          .status(400)
          .json({ error: "Thiếu text hoặc sourceLang hoặc targetLang" });

      // ==========================================================
      // Helper: Tách văn bản dài thành các phần nhỏ để tránh lỗi URL quá dài
      // ==========================================================
      const chunkText = (input, maxLength = 800) => {
        const parts = [];

        // Nếu văn bản ngắn hơn maxLength, trả về nguyên văn
        if (input.length <= maxLength) {
          return [input];
        }

        let current = "";
        // Tách theo câu với các dấu kết thúc câu
        const sentences = input.split(/(?<=[.!?])\s+/);

        for (const sentence of sentences) {
          // Nếu câu hiện tại quá dài, tách theo từ
          if (sentence.length > maxLength) {
            if (current.trim()) {
              parts.push(current.trim());
              current = "";
            }

            // Tách câu dài theo từ
            const words = sentence.split(/\s+/);
            let wordChunk = "";

            for (const word of words) {
              if ((wordChunk + " " + word).length > maxLength) {
                if (wordChunk.trim()) {
                  parts.push(wordChunk.trim());
                }
                wordChunk = word;
              } else {
                wordChunk += (wordChunk ? " " : "") + word;
              }
            }

            if (wordChunk.trim()) {
              current = wordChunk;
            }
          } else if ((current + " " + sentence).length > maxLength) {
            // Nếu thêm câu này sẽ vượt quá maxLength
            if (current.trim()) {
              parts.push(current.trim());
            }
            current = sentence;
          } else {
            // Thêm câu vào chunk hiện tại
            current += (current ? " " : "") + sentence;
          }
        }

        // Thêm phần cuối cùng
        if (current.trim()) {
          parts.push(current.trim());
        }

        // Đảm bảo không có chunk rỗng
        return parts.filter((part) => part.trim().length > 0);
      };

      // ==========================================================
      // Helper API tra IPA cho từ tiếng Anh
      // ==========================================================
      const getPhoneticFromAPI = async (term) => {
        try {
          const u = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
            term
          )}`;
          const r = await fetch(u);
          if (!r.ok) return null;
          const j = await r.json();

          let phon = j[0]?.phonetics?.find(
            (p) => p.text && (p.text.includes("/") || p.text.includes("["))
          )?.text;

          if (!phon) phon = j[0]?.phonetic;
          if (!phon) return null;

          phon = phon
            .replace(/^[\[/]/, "")
            .replace(/[\]/]$/, "")
            .replace(/-/g, "")
            .replace(/\s+/g, " ")
            .trim();
          const firstOption = phon.split(",")[0].trim();

          return firstOption || phon;
        } catch (e) {
          return null;
        }
      };

      // ==========================================================
      // Manual dictionary tra cứu nhanh
      // ==========================================================
      const manualLookup = {
        a: "ə",
        the: "ðə",
        an: "ən",
        to: "tə",
        for: "fər",
        and: "ən(d)",
        i: "aɪ",
        of: "əv",
        is: "ɪz",
        was: "wɒz",
        are: "ɑː(r)",
        but: "bət",
        or: "ɔː(r)",
        at: "ət",
        from: "frəm",
        with: "wɪð",
        as: "əz",
        than: "ðən",
        can: "kæn",
        must: "mʌst",
        will: "wɪl",
        would: "wʊd",
        should: "ʃʊd",
        may: "meɪ",
        might: "maɪt",
        could: "kʊd",
        do: "duː",
        does: "dʌz",
        has: "hæz",
        had: "hæd",
        have: "hæv",
        go: "ɡəʊ",
        get: "ɡet",
        take: "teɪk",
        in: "ɪn",
        on: "ɒn",
        under: "ˈʌndər",
        by: "baɪ",
        "i'm": "aɪm",
        "you're": "jʊə(r)",
        "he's": "hiːz",
        "she's": "ʃiːz",
        "it's": "ɪts",
        "we're": "wɪə(r)",
        "they're": "ðeə(r)",
        "i'll": "aɪl",
        "you'll": "juːl",
        "he'll": "hiːl",
        "she'll": "ʃiːl",
        "it'll": "ɪtəl",
        "we'll": "wiːl",
        "they'll": "ðeɪl",
        "i've": "aɪv",
        "we've": "wiːv",
        "they've": "ðeɪv",
        "you've": "juːv",
        "don't": "dəʊnt",
        "can't": "kɑːnt",
        "won't": "wəʊnt",
        "isn't": "ɪznt",
        "aren't": "ɑːnt",
        "wasn't": "wɒznt",
        "weren't": "wəːnt",
        "haven't": "hævnt",
        "hasn't": "hæznt",
        "didn't": "dɪdnt",
        "couldn't": "kʊdnt",
        "wouldn't": "wʊdnt",
        "shouldn't": "ʃʊdnt",
        "mustn't": "mʌsnt",
        "mightn't": "maɪtnt",
        "needn't": "niːdnt",
        "what's": "wɒts",
        "where's": "weəz",
        "that's": "ðæts",
        "who's": "huːz",
        "how's": "haʊz",
        "here's": "hɪəz",
        "there's": "ðeəz",
        "let's": "lets",
        "1st": "fɜːrst",
        "2nd": "sɛkənd",
        "3rd": "θɜːrd",
        "4th": "fɔːrθ",
        "5th": "fɪfθ",
        "6th": "sɪksθ",
        "7th": "sɛvənθ",
        "8th": "eɪtθ",
        "9th": "naɪnθ",
        "10th": "tɛnθ",
        vietjack: "viːet dʒæk",
        kite: "kaɪt",
        creative: "kriːˈeɪtɪv",
        horizon: "həˈraɪzn",
        literature: "ˈlɪtərətʃər",
        essays: "ˈɛseɪz",
        paragraphs: "ˈpærəɡræfs",
      };

      // ==========================================================
      // Helper: Lấy IPA cho tiếng Anh
      // ==========================================================
      const getIpaForEnglishText = async (inputText) => {
        const tryDictLookup = async (term) => {
          const lowerTerm = term.toLowerCase();
          if (manualLookup[lowerTerm]) return manualLookup[lowerTerm];
          let ipaResult = await getPhoneticFromAPI(lowerTerm);

          if (!ipaResult) {
            const potentialBaseTerms = [];
            if (lowerTerm.endsWith("s"))
              potentialBaseTerms.push(lowerTerm.slice(0, -1));
            if (lowerTerm.endsWith("es"))
              potentialBaseTerms.push(lowerTerm.slice(0, -2));
            if (lowerTerm.endsWith("ed"))
              potentialBaseTerms.push(lowerTerm.slice(0, -2));
            if (lowerTerm.endsWith("ies"))
              potentialBaseTerms.push(lowerTerm.slice(0, -3) + "y");
            if (lowerTerm.endsWith("d"))
              potentialBaseTerms.push(lowerTerm.slice(0, -1));
            if (lowerTerm.endsWith("ing")) {
              potentialBaseTerms.push(lowerTerm.slice(0, -3));
              potentialBaseTerms.push(lowerTerm.slice(0, -3) + "e");
            }

            for (const baseTerm of potentialBaseTerms) {
              const baseResult = await getPhoneticFromAPI(baseTerm);
              if (baseResult) {
                ipaResult = baseResult;
                break;
              }
            }
          }
          return ipaResult || lowerTerm;
        };

        const words = inputText.split(/\s+/).filter((w) => w.length > 0);
        const cleanWords = words.map((w) =>
          w.replace(/^[.,!?;:]+/, "").replace(/[.,!?;:]+$/, "")
        );
        const ipaWords = await Promise.all(
          cleanWords.map((w) => tryDictLookup(w.toLowerCase()))
        );

        const ipaJoined = ipaWords.join(" ");
        return ipaJoined.trim() ? `/${ipaJoined.trim()}/` : null;
      };

      // ==========================================================
      // Helper: Dịch một đoạn nhỏ với retry logic
      // ==========================================================
      const translateChunk = async (chunk, retryCount = 0) => {
        const maxRetries = 3;

        try {
          const encodedText = encodeURIComponent(chunk);
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=rm&q=${encodedText}`;

          // Kiểm tra độ dài URL
          if (url.length > 8000) {
            throw new Error(`URL quá dài: ${url.length} ký tự`);
          }

          const translateRes = await fetch(url, {
            method: "GET",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              Accept: "application/json, text/plain, */*",
              "Accept-Language": "en-US,en;q=0.9",
            },
          });

          if (!translateRes.ok) {
            throw new Error(
              `HTTP ${translateRes.status}: ${translateRes.statusText}`
            );
          }

          const translateData = await translateRes.json();

          if (!translateData || !translateData[0]) {
            throw new Error("Phản hồi API không hợp lệ");
          }

          const result = translateData[0]
            ?.map((item) => item[0])
            .filter((item) => item) // Lọc bỏ null/undefined
            .join("")
            .trim();

          return result || chunk; // Trả về text gốc nếu không dịch được
        } catch (error) {
          console.error(
            `[TRANSLATE ERROR] Chunk: "${chunk.substring(0, 50)}...":`,
            error.message
          );

          if (retryCount < maxRetries) {
            console.log(`[RETRY] Thử lại lần ${retryCount + 1}/${maxRetries}`);
            await sleep(1000 * (retryCount + 1)); // Tăng delay theo số lần retry
            return translateChunk(chunk, retryCount + 1);
          }

          // Nếu retry hết, trả về text gốc
          console.error(`[FALLBACK] Không thể dịch chunk, giữ nguyên text gốc`);
          return chunk;
        }
      };

      // ==========================================================
      // Dịch đoạn văn dài bằng cách chia nhỏ
      // ==========================================================
      const chunks = chunkText(text);
      console.log(`[TRANSLATE] Chia văn bản thành ${chunks.length} phần:`);
      chunks.forEach((chunk, index) => {
        console.log(`[CHUNK ${index + 1}] ${chunk.substring(0, 50)}...`);
      });

      let translatedParts = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`[TRANSLATING] Đang dịch chunk ${i + 1}/${chunks.length}`);

        try {
          const translatedChunk = await translateChunk(chunk);
          if (translatedChunk && translatedChunk.trim()) {
            translatedParts.push(translatedChunk.trim());
          }

          // Thêm delay nhỏ để tránh rate limit
          if (i < chunks.length - 1) {
            await sleep(200);
          }
        } catch (error) {
          console.error(`[ERROR] Lỗi dịch chunk ${i + 1}:`, error.message);
          // Nếu lỗi, vẫn thêm text gốc để không mất nội dung
          translatedParts.push(chunk);
        }
      }

      const translated = translatedParts.join(" ").trim();
      console.log(
        `[RESULT] Dịch hoàn tất. Độ dài gốc: ${text.length}, Độ dài dịch: ${translated.length}`
      );

      // ==========================================================
      // Lấy IPA cho source và target nếu cần
      // ==========================================================
      let sourceIpa = null;
      if (sourceLang === "en") sourceIpa = await getIpaForEnglishText(text);

      let ipa = null;
      if (targetLang === "en") ipa = await getIpaForEnglishText(translated);

      // ==========================================================
      // Lấy audio cho văn bản dài bằng cách chia nhỏ và ghép lại
      // ==========================================================
      const getAudioBase64 = async (inputText, lang) => {
        const cleanText = inputText
          .replace(/[^\p{L}\p{N}\s'.,!?]/gu, "")
          .replace(/\s+/g, " ")
          .trim();

        if (!cleanText) return Buffer.from("").toString("base64");

        // Nếu text ngắn, xử lý trực tiếp
        if (cleanText.length <= 200) {
          try {
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
              cleanText
            )}&tl=${lang}&client=tw-ob`;

            const audioResponse = await fetch(ttsUrl, {
              headers: { "User-Agent": "Mozilla/5.0" },
            });
            const buffer = await audioResponse.arrayBuffer();
            return Buffer.from(buffer).toString("base64");
          } catch (error) {
            console.error("[AUDIO ERROR] Lỗi tạo audio:", error.message);
            return Buffer.from("").toString("base64");
          }
        }

        // Với text dài, chia nhỏ và tạo audio từng phần
        console.log(
          `[AUDIO] Xử lý audio cho text dài: ${cleanText.length} ký tự`
        );

        const audioChunks = [];
        const textChunks = chunkText(cleanText, 150); // Chunk nhỏ hơn cho audio

        console.log(`[AUDIO] Chia thành ${textChunks.length} phần audio`);

        for (let i = 0; i < textChunks.length && i < 10; i++) {
          // Giới hạn tối đa 10 chunks để tránh quá dài
          const chunk = textChunks[i];
          console.log(
            `[AUDIO] Tạo audio chunk ${i + 1}/${Math.min(
              textChunks.length,
              10
            )}: "${chunk.substring(0, 30)}..."`
          );

          try {
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
              chunk
            )}&tl=${lang}&client=tw-ob`;

            const audioResponse = await fetch(ttsUrl, {
              headers: { "User-Agent": "Mozilla/5.0" },
            });

            if (audioResponse.ok) {
              const buffer = await audioResponse.arrayBuffer();
              audioChunks.push(Buffer.from(buffer));
            }

            // Delay để tránh rate limit
            if (i < Math.min(textChunks.length, 10) - 1) {
              await sleep(300);
            }
          } catch (error) {
            console.error(
              `[AUDIO ERROR] Lỗi tạo audio chunk ${i + 1}:`,
              error.message
            );
          }
        }

        if (audioChunks.length === 0) {
          console.log("[AUDIO] Không tạo được audio, trả về rỗng");
          return Buffer.from("").toString("base64");
        }

        // Ghép các audio chunks lại (đơn giản bằng cách nối buffer)
        const combinedBuffer = Buffer.concat(audioChunks);
        console.log(
          `[AUDIO] Hoàn tất ghép ${audioChunks.length} phần audio, kích thước: ${combinedBuffer.length} bytes`
        );

        return combinedBuffer.toString("base64");
      };

      const originalAudio = await getAudioBase64(text, sourceLang);
      const translatedAudio = await getAudioBase64(translated, targetLang);

      // ==========================================================
      // Trả kết quả
      // ==========================================================
      res.json({
        translated,
        sourceIpa,
        ipa,
        originalAudio,
        translatedAudio,
      });
    } catch (error) {
      console.error("Translate error:", error);
      res.status(500).json({ error: "Server error" });
    }
  };

  pronoun = async (req, res) => {
    const { primaryText } = req.body;
    if (
      !primaryText ||
      typeof primaryText !== "string" ||
      primaryText.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Thiếu 'primaryText' (văn bản gốc) để so khớp.",
      });
    }

    if (!req.file) {
      console.error("[DEBUG-ERROR] Thiếu file.");
      return res.status(400).json({
        success: false,
        message: 'Không có tệp âm thanh nào được tải lên (cần key "audio").',
      });
    }

    const audioFilePath = req.file.path;

    try {
      console.log(`[START] Bắt đầu xử lý tệp tạm: ${req.file.originalname}`);

      const uploadedFile = await aaiClient.files.upload(audioFilePath);
      let uploadUrl;

      if (
        typeof uploadedFile === "string" &&
        uploadedFile.startsWith("https://")
      ) {
        uploadUrl = uploadedFile;
      } else if (uploadedFile && uploadedFile.uploadUrl) {
        uploadUrl = uploadedFile.uploadUrl;
      } else if (uploadedFile && uploadedFile.upload_url) {
        uploadUrl = uploadedFile.upload_url;
      } else {
        uploadUrl = undefined;
      }

      if (!uploadUrl) {
        const uploadError =
          "Tải tệp lên AssemblyAI thất bại. Vui lòng kiểm tra API Key và giới hạn sử dụng.";
        console.error(`[DEBUG-ERROR] ${uploadError}`);
        throw new Error(uploadError);
      }

      let transcript = await aaiClient.transcripts.submit({
        audio_url: uploadUrl,
        language_code: "en_us",
      });

      const transcriptId = transcript.id;
      while (
        transcript.status !== "completed" &&
        transcript.status !== "error" &&
        transcript.status !== "failed"
      ) {
        await sleep(3000);
        transcript = await aaiClient.transcripts.get(transcriptId);
      }

      if (transcript.status === "completed") {
        console.log("[SUCCESS] Phiên âm hoàn tất.");
        transcript.text = transcript.text.endsWith(".")
          ? transcript.text.slice(0, -1)
          : transcript.text;
        const accuracyPercentage = calculateStringSimilarityPercentage(
          primaryText,
          transcript.text
        );

        console.log(`[ACCURACY] Văn bản gốc: "${primaryText}"`);
        console.log(`[ACCURACY] Văn bản phiên âm: "${transcript.text}"`);
        console.log(`[ACCURACY] Độ chính xác phát âm: ${accuracyPercentage}%`);

        res.json({
          success: true,
          transcription: transcript.text,
          duration_seconds: transcript.audio_duration,
          aai_id: transcriptId,
          accuracy_percentage: accuracyPercentage,
        });
      } else {
        throw new Error(
          `Phiên âm thất bại. Trạng thái: ${transcript.status}. Chi tiết lỗi AssemblyAI: ${transcript.error}`
        );
      }
    } catch (error) {
      console.error("LỖI SERVER KHỐI CATCH:", error.message);
      res.status(500).json({
        success: false,
        message: "Quá trình chuyển đổi thất bại.",
        error: error.message,
      });
    } finally {
      // 5. Dọn dẹp
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
      console.log("[CLEANUP] Đã xóa tệp tạm.");
      console.log("======================================\n");
    }
  };
}

module.exports = new UtilsController();
