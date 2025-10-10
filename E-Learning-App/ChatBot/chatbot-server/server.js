require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
        }),
      }
    );

    const data = await response.json();
    const botMessage =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Xin lỗi, tôi chưa hiểu.";

    res.json({ reply: botMessage });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
