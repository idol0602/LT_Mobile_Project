import axios, { type AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:5050/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// --- Lesson API ---

// Định nghĩa kiểu dữ liệu cho Lesson (nên tách ra file types.ts sau này)
interface LessonData {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | ''; // ✅ đổi sang text
  topic: string;
  type: 'vocab' | 'listen' | 'grammar' | 'reading' | '';
  vocabularies?: string[];
  readingContent?: string;
  questions?: any[];
}

export interface GetLessonsParams {
  page: number;
  limit: number;
  searchTerm: string;
  level: string;
  type: string;
}
export const getLessons = (
  params: GetLessonsParams
): Promise<AxiosResponse<any>> => {
  // const params = { page, limit, topic };
  // return apiClient.get(`/lessons`, { params });
  return apiClient.get(`/lessons`, { params });
};
//lay tu vung dua theo lessonID
export const getVocabulariesByLessonId = (lessonId: string): Promise<AxiosResponse<any>> => {
  return apiClient.get(`/lessons/${lessonId}/vocabularies`);
};

export const addLesson = (lessonData: LessonData): Promise<AxiosResponse<any>> => {
  // Sửa từ: /lessons/add  Thành: /lessons
  return apiClient.post("/lessons", lessonData);
};

export const updateLesson = (id: string, lessonData: Partial<LessonData>): Promise<AxiosResponse<any>> => {
  // Partial<LessonData> cho phép chỉ gửi một phần dữ liệu cần cập nhật
  return apiClient.put(`/lessons/${id}`, lessonData);
};

export const deleteLesson = (id: string): Promise<AxiosResponse<any>> => {
  return apiClient.delete(`/lessons/${id}`);
};

// --- Topic API (Ví dụ nếu bạn cần lấy danh sách topic đã có) ---
// export const getTopics = (): Promise<AxiosResponse<any>> => {
//   // Giả sử backend có API trả về các topic đã dùng trong lessons
//   return apiClient.get('/topics/distinct');
// };