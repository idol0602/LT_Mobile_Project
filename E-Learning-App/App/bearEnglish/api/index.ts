import { API_BASE, UTILS_BASE } from "../constants/api";

interface ChatResponse {
  reply: string;
}

interface TranslateResponse {
  translated: string;
  sourceIpa?: string;
  ipa?: string;
  originalAudio?: string;
  translatedAudio?: string;
}

interface PronounResponse {
  success: boolean;
  transcription: string;
  duration_seconds: number;
  aai_id: string;
  accuracy_percentage: number;
}

interface Lesson {
  _id: string;
  name: string;
  level: string;
  topic: string;
  type: string;
  questions?: any[];
  readingContent?: string;
  vocabularies?: any[];
}

interface Vocabulary {
  _id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
}

class API {
    // ============ UTILS SERVER APIs ============

    async sendMessageToAI(text: string, userId: string): Promise<ChatResponse> {
        const response = await fetch(`${UTILS_BASE}/chat`, {
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

    async translate(text: string, sourceLang: string, targetLang: string): Promise<TranslateResponse> {
        const res = await fetch(`${UTILS_BASE}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, sourceLang, targetLang }),
        });

        if (!res.ok)
          throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        return data;
    }

    async checkPronunciation(audioUri: string, expectedWord: string): Promise<PronounResponse> {
        const form = new FormData();

        const fileName = audioUri.split("/").pop() || `${expectedWord}.m4a`;
        const fileType = "audio/m4a";

        const fileBlob = {
          uri: audioUri,
          name: fileName,
          type: fileType,
        } as any;

        form.append("file", fileBlob);
        form.append("primaryText", expectedWord);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
          const res = await fetch(`${UTILS_BASE}/pronoun`, {
            method: "POST",
            body: form,
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const json = await res.json();
          return json as PronounResponse;
        } catch (error) {
          clearTimeout(timeoutId);
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error("Upload timeout. Please check your connection and try again.");
          }
          throw error;
        }
    }

    // ============ DATA SERVER APIs ============

    async getLessons(type?: string): Promise<{ data: Lesson[]; pagination?: any }> {
        const url = type ? `${API_BASE}/api/lessons?type=${type}` : `${API_BASE}/api/lessons`;
        const response = await fetch(url);

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data;
    }

    async getLessonById(id: string): Promise<{ data: Lesson }> {
        const response = await fetch(`${API_BASE}/api/lessons/${id}`);

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data;
    }

    async getVocabulariesByLessonId(lessonId: string): Promise<{ data: Vocabulary[] }> {
        const response = await fetch(`${API_BASE}/api/lessons/${lessonId}/vocabularies`);

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data;
    }

    async playAudio(word: string): Promise<string> {
        // This would typically return audio URL or base64 data
        const url = `${API_BASE}/api/audio/play?word=${encodeURIComponent(word)}`;
        return url;
    }
}

export default new API();