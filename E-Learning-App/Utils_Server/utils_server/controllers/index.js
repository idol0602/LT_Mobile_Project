require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const { AssemblyAI } = require("assemblyai");

const aaiClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

const API_KEY = process.env.GEMINI_API_KEY;
const AI_MODEL = process.env.AI_MODEL;
const API_CONTEXT_APP = process.env.API_CONTEXT_APP;

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
      const userMessage = req.body.message;

      const response = await fetch(
        `${AI_MODEL}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: API_CONTEXT_APP.concat(" ", userMessage) }] },
            ],
          }),
        }
      );

      const data = await response.json();
      const botMessage =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Xin lỗi, tôi chưa hiểu.";
      res.json({ reply: botMessage });
    } catch (error) {
      console.error(error);
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

      // 🌐 Gọi Google Translate (lấy bản dịch + romanized)
      const translateRes = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=rm&q=${encodeURIComponent(
          text
        )}`
      );
      const translateData = await translateRes.json();

      // 📝 Lấy bản dịch
      const translated =
        translateData[0]
          ?.map((item) => item[0])
          .join("")
          ?.trim() || "";

      // 🔤 Lấy phiên âm Google (romanized) cho ngôn ngữ không phải tiếng Anh
      const targetPhonetic =
        targetLang !== "en"
          ? translateData[0]
              ?.map((item) => item[3] || "")
              .join(" ")
              .replace(/\s+/g, " ")
              .trim() || null
          : null;

      // Helper function for API lookup and cleanup
      const getPhoneticFromAPI = async (term) => {
        try {
          const u = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
            term
          )}`;
          const r = await fetch(u);
          if (!r.ok) return null;
          const j = await r.json();

          // Ưu tiên lấy IPA có ký hiệu /.../ hoặc [...]
          let phon = j[0]?.phonetics?.find(
            (p) => p.text && (p.text.includes("/") || p.text.includes("["))
          )?.text;

          if (!phon) {
            // Fallback: Thử lấy phonetic bất kỳ nếu không có ký hiệu bao quanh
            phon = j[0]?.phonetic;
          }

          if (!phon) return null;

          // Loại bỏ các ký hiệu bao quanh (/ [ ]) và ký tự phụ
          phon = phon
            .replace(/^[\[/]/, "")
            .replace(/[\]/]$/, "")
            .trim();
          // Xóa dấu gạch ngang phân tách âm tiết (nếu có)
          phon = phon.replace(/-/g, "").trim();
          // Xóa khoảng trắng thừa
          phon = phon.replace(/\s+/g, " ");

          // Lấy phần đầu tiên nếu có nhiều tùy chọn (ví dụ: bɔːd, bɔːrd)
          const firstOption = phon.split(",")[0].trim();

          return firstOption || phon;
        } catch (e) {
          // console.error(`API lookup failed for ${term}:`, e);
          return null;
        }
      };

      // 🔎 Lấy IPA cho tiếng Anh (Phiên âm chính xác TỪNG TỪ)
      let ipa = null;
      if (targetLang === "en") {
        const tryDictLookup = async (term) => {
          const lowerTerm = term.toLowerCase();

          // 1. XỬ LÝ TRƯỜNG HỢP ĐẶC BIỆT (Contractions, Weak Forms, Numbers/Ordinal)

          // TỪ ĐIỂN TRA CỨU TAY CHO CÁC TỪ CHỨC NĂNG, SỐ VÀ TÊN RIÊNG PHỔ BIẾN
          const manualLookup = {
            // TỪ CHỨC NĂNG VÀ DẠNG YẾU
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

            // VIẾT TẮT
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
            "i'd": "d",
            "you'd": "d",
            "he'd": "d",
            "she'd": "d",
            "it'd": "d",
            "we'd": "d",
            "they'd": "d",
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

            // TỪ THỨ TỰ (Ordinal Numbers), TÊN RIÊNG VÀ DANH TỪ CÓ TRỌNG ÂM ĐẶC BIỆT
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
            essays: "ˈɛseɪz", // Đảm bảo trọng âm đúng
            paragraphs: "ˈpærəɡræfs", // Đảm bảo trọng âm đúng
          };

          if (manualLookup[lowerTerm]) {
            return manualLookup[lowerTerm];
          }

          // 2. Tra cứu bằng API từ điển cho các từ còn lại (Content Words)

          // 2a. Thử tra cứu từ nguyên bản (dạng chia)
          let ipaResult = await getPhoneticFromAPI(lowerTerm);

          // 2b. Xử lý fallback cho các dạng từ có suffix nếu tra cứu dạng chia thất bại
          if (!ipaResult) {
            const potentialBaseTerms = [];

            // 1. Loại bỏ '-s' (Phổ biến nhất cho số nhiều/chia động từ)
            if (lowerTerm.length > 1 && lowerTerm.endsWith("s")) {
              potentialBaseTerms.push(
                lowerTerm.substring(0, lowerTerm.length - 1)
              ); // e.g., synthesizes -> synthesize
            }

            // 2. Loại bỏ '-es' (Dạng đặc biệt của số nhiều/chia động từ)
            if (lowerTerm.length > 2 && lowerTerm.endsWith("es")) {
              potentialBaseTerms.push(
                lowerTerm.substring(0, lowerTerm.length - 2)
              ); // e.g., searches -> search, goes -> go
            }

            // 3. Loại bỏ '-ed' (Quá khứ/Quá khứ phân từ)
            if (lowerTerm.length > 2 && lowerTerm.endsWith("ed")) {
              potentialBaseTerms.push(
                lowerTerm.substring(0, lowerTerm.length - 2)
              ); // e.g., worked -> work
            }

            // 4. Trường hợp 'ies' -> 'y' (studies -> study)
            if (lowerTerm.length > 3 && lowerTerm.endsWith("ies")) {
              potentialBaseTerms.push(
                lowerTerm.substring(0, lowerTerm.length - 3) + "y"
              ); // e.g., studies -> study
            }

            // 5. Loại bỏ '-d' (Quá khứ/Quá khứ phân từ cho từ gốc đã có 'e')
            if (lowerTerm.length > 2 && lowerTerm.endsWith("d")) {
              potentialBaseTerms.push(
                lowerTerm.substring(0, lowerTerm.length - 1)
              ); // e.g., saved -> save
            }

            // 6. Trường hợp 'ing' (V-ing) -> V (running -> run, making -> make)
            if (lowerTerm.length > 3 && lowerTerm.endsWith("ing")) {
              // Thử bỏ 'ing'
              potentialBaseTerms.push(
                lowerTerm.substring(0, lowerTerm.length - 3)
              );
              // Thử bỏ 'ing' và thêm 'e' (cho trường hợp drop 'e' before 'ing')
              potentialBaseTerms.push(
                lowerTerm.substring(0, lowerTerm.length - 3) + "e"
              );
            }

            // Loại bỏ các từ trùng lặp, từ rỗng, và từ giống từ gốc
            const uniqueBaseTerms = [...new Set(potentialBaseTerms)].filter(
              (term) => term !== lowerTerm && term.length > 0
            );

            for (const baseTerm of uniqueBaseTerms) {
              const baseResult = await getPhoneticFromAPI(baseTerm);
              if (baseResult) {
                // Nếu tìm thấy base form, chấp nhận kết quả này.
                ipaResult = baseResult;
                break; // Found it, stop searching
              }
            }
          }

          // 3. Nếu vẫn không tìm thấy, TRẢ VỀ TỪ NGUYÊN BẢN.
          return ipaResult || lowerTerm;
        };

        // BẮT ĐẦU XỬ LÝ CHUỖI DÀI
        const words = translated.split(/\s+/).filter((w) => w.length > 0);

        // Loại bỏ dấu câu khỏi từ, nhưng giữ lại dấu nháy đơn
        const cleanWords = words.map((w) =>
          // Chỉ loại bỏ dấu câu ở đầu hoặc cuối từ, giữ lại dấu nháy đơn cho contraction
          w.replace(/^[.,!?;:]+/, "").replace(/[.,!?;:]+$/, "")
        );

        // Tra cứu IPA cho từng từ
        const ipaWords = await Promise.all(
          cleanWords.map((w) => tryDictLookup(w.toLowerCase()))
        );

        // Ghép tất cả IPA đã tra cứu và bao lại bằng dấu / /
        // Dùng join() để bao gồm cả những từ không tra cứu được (hiện là từ nguyên bản)
        const ipaJoined = ipaWords.join(" ");
        if (ipaJoined.trim()) ipa = `/${ipaJoined.trim()}/`;

        // *Lưu ý: Phiên âm này là sự kết hợp của các từ đơn lẻ và không tính đến nối âm/ngữ điệu câu.
      }

      // 🔊 Hàm lấy audio base64 (GIỮ NGUYÊN)
      const getAudioBase64 = async (inputText, lang) => {
        let safeText = inputText
          .replace(/[^\p{L}\p{N}\s']/gu, "")
          .replace(/\s+/g, " ")
          .trim();

        if (!safeText) safeText = "Hello";

        if (lang === "en")
          safeText =
            safeText.charAt(0).toUpperCase() + safeText.slice(1).toLowerCase();

        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
          safeText
        )}&tl=${lang}&client=tw-ob`;

        try {
          const audioResponse = await fetch(ttsUrl, {
            headers: { "User-Agent": "Mozilla/5.0" },
          });

          if (!audioResponse.ok) throw new Error("TTS failed");

          const buffer = await audioResponse.arrayBuffer();
          // Chú ý: Cần thư viện Buffer của Node.js để chạy dòng này
          return Buffer.from(buffer).toString("base64");
        } catch {
          // fallback
          const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=Hello&tl=${lang}&client=tw-ob`;
          const fallbackRes = await fetch(fallbackUrl, {
            headers: { "User-Agent": "Mozilla/5.0" },
          });
          const buffer = await fallbackRes.arrayBuffer();
          // Chú ý: Cần thư viện Buffer của Node.js để chạy dòng này
          return Buffer.from(buffer).toString("base64");
        }
      };

      // 🗣️ Lấy audio
      const originalAudio = await getAudioBase64(text, sourceLang);
      const translatedAudio = await getAudioBase64(translated, targetLang);

      // ✅ Trả kết quả
      res.json({
        translated,
        ipa,
        targetPhonetic,
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
