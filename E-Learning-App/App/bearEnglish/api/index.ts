const API_URL = "http://192.168.1.210:3000";

interface ChatResponse {
  reply: string;
}

class API {
    async sendMessageToAI (text: string,userId:string) {
        const response = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            userId: userId,
          }),
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data: ChatResponse = await response.json();
        return data;
    }

    async translate (trimmed:string, sourceLang:string, targetLang:string) {
        const res = await fetch(`${API_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, sourceLang, targetLang }),
      });

      const data = await res.json();
      return data;
    }

    async pronoun () {
      
    }
}

export default new API();