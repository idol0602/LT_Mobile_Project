import { API_BASE, UTILS_BASE } from "../constants/api";
import type {
  ChatResponse,
  TranslateResponse,
  PronounResponse,
  Lesson,
  Vocabulary,
  Word,
  ApiResponse,
  ChatRequest,
  TranslateRequest,
  UploadAudioRequest
} from "../types";

class API {
    BASE_URL = API_BASE; // Expose base URL for external use

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
        const formData = new FormData();

        // Use consistent naming with VocabularyStudy component
        formData.append("audio", {
          uri: audioUri,
          name: `pron_${expectedWord.replace(/\s+/g, "_")}.m4a`,
          type: "audio/m4a",
        } as any);
        formData.append("primaryText", expectedWord);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
          const response = await fetch(`${UTILS_BASE}/pronoun`, {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          return result as PronounResponse;
        } catch (error) {
          clearTimeout(timeoutId);
          
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error("Upload timeout. Please check your connection and try again.");
          }
          
          // Improve error handling with Vietnamese messages
          let errorMessage = "Không thể kiểm tra phát âm. Vui lòng thử lại.";
          if (error instanceof TypeError && error.message.includes("Network request failed")) {
            errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.";
          }
          
          throw new Error(errorMessage);
        }
    }

    // ============ DATA SERVER APIs ============

    async getLessons(type?: string): Promise<{ data: Lesson[]; pagination?: any }> {
        try {
          const url = type ? `${API_BASE}/api/lessons/type/${type}` : `${API_BASE}/api/lessons`;
          console.log("Fetching lessons from:", url);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });

          console.log("Response status:", response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("API error response:", errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log("Lessons data received:", data.data?.length || 0, "lessons");
          return data;
        } catch (error) {
          console.error("getLessons error:", error);
          if (error instanceof TypeError && error.message.includes("Network request failed")) {
            throw new Error("Không thể kết nối tới server. Vui lòng kiểm tra:\n1. DataServer có đang chạy?\n2. Kết nối mạng WiFi");
          }
          throw error;
        }
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

    // ============ VOCABULARY STUDY SPECIFIC APIs ============
    
    async fetchVocabulariesForStudy(lessonId: string): Promise<Vocabulary[]> {
        try {
          const response = await fetch(`${API_BASE}/api/lessons/${lessonId}/vocabularies`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const json = await response.json();
          const data = json.data || json;

          const words: Vocabulary[] = (data || []).map((v: any) => ({
            _id: v._id,
            word: v.word,
            definition: v.definition || "",
            pronunciation: v.pronunciation || "",
            partOfSpeech: v.partOfSpeech || "",
            exampleSentence: v.exampleSentence || "",
            audioUrl: v.audioUrl || "",
          }));

          return words.slice(0, 5); // Limit to 5 words for study
        } catch (error) {
          console.error('Error fetching vocabularies:', error);
          throw new Error("Không thể tải từ vựng. Vui lòng thử lại.");
        }
    }



    async getWordAudioUrl(word: string): Promise<string> {
        // Generate Text-to-Speech URL or return stored audio URL
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(word)}`;
        return ttsUrl;
    }

    // ============ PROGRESS APIs ============

    async getUserProgress(userId: string): Promise<any> {
        try {
          const response = await fetch(`${API_BASE}/api/progress/${userId}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error fetching user progress:', error);
          throw error;
        }
    }

    async getProgressStats(userId: string): Promise<any> {
        try {
          const response = await fetch(`${API_BASE}/api/progress/${userId}/stats`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error fetching progress stats:', error);
          throw error;
        }
    }

    async completeLesson(userId: string, lessonId: string, category: string): Promise<any> {
        try {
          const response = await fetch(`${API_BASE}/api/progress/${userId}/complete-lesson`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lessonId, category }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error completing lesson:', error);
          throw error;
        }
    }

    async updateCurrentLesson(userId: string, lessonId: string, category: string, progress: number): Promise<any> {
        try {
          const response = await fetch(`${API_BASE}/api/progress/${userId}/current-lesson`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lessonId, category, progress }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error updating current lesson:', error);
          throw error;
        }
    }
}

export default new API();