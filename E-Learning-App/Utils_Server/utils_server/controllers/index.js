require("dotenv").config();
const fetch = require("node-fetch");
const API_KEY = process.env.GEMINI_API_KEY;
const AI_MODEl = process.env.AI_MODEL;
const API_CONTEXT_APP = process.env.API_CONTEXT_APP;

class UtilsController {
  aswerQuestion = async (req, res) => {
    try {
      const userMessage = req.body.message;

      const response = await fetch(
        `${AI_MODEl}:generateContent?key=${API_KEY}`,
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

      const translateRes = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
          text
        )}`
      );
      const translateData = await translateRes.json();
      const translated = translateData[0].map((item) => item[0]).join("");

      const getAudioBase64 = async (inputText, lang) => {
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
          inputText
        )}&tl=${lang}&client=gtx`;
        const audioResponse = await fetch(ttsUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        const buffer = await audioResponse.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
      };

      const originalAudio = await getAudioBase64(text, sourceLang);
      const translatedAudio = await getAudioBase64(translated, targetLang);

      res.json({ translated, originalAudio, translatedAudio });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };
}

module.exports = new UtilsController();
