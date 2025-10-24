import axios, { type AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:5050/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// --- Vocabulary API ---
export const getVocabularies = (
  page: number,
  rowsPerPage: number,
  searchTerm: string,
  searchLang: string,
  posFilter: string
): Promise<AxiosResponse<any>> => {
  return apiClient.get(`/vocabularies`, {
    params: {
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm,
      lang: searchLang,
      pos: posFilter,
    }
  });
};
export const getVocabulariesByIds = (ids: string[]): Promise<AxiosResponse<any>> => {
  return apiClient.post("/vocabularies/many", { ids });
};


export const addVocabulary = (formData: FormData): Promise<AxiosResponse<any>> => {
  return apiClient.post("/vocabularies/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateVocabulary = (id: string, formData: FormData): Promise<AxiosResponse<any>> => {
  return apiClient.put(`/vocabularies/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteVocabulary = (id: string): Promise<AxiosResponse<any>> => {
  return apiClient.delete(`/vocabularies/delete/${id}`);
};

export const getVocabularyStats = (): Promise<AxiosResponse<any>> => {
  return apiClient.get("/vocabularies/stats");
};

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


export const getLessons = (
  // Thêm các tham số phân trang/lọc nếu cần
  // page: number = 1,
  // limit: number = 10,
  // topic?: string
): Promise<AxiosResponse<any>> => {
  // const params = { page, limit, topic };
  // return apiClient.get(`/lessons`, { params });
  return apiClient.get(`/lessons`); // Lấy tất cả trước
};

export const addLesson = (lessonData: LessonData): Promise<AxiosResponse<any>> => {
  // Gửi dữ liệu dạng JSON vì không có file
  return apiClient.post("/lessons/add", lessonData);
};

export const updateLesson = (id: string, lessonData: Partial<LessonData>): Promise<AxiosResponse<any>> => {
  // Partial<LessonData> cho phép chỉ gửi một phần dữ liệu cần cập nhật
  return apiClient.put(`/lessons/update/${id}`, lessonData);
};

export const deleteLesson = (id: string): Promise<AxiosResponse<any>> => {
  return apiClient.delete(`/lessons/delete/${id}`);
};

// --- Topic API (Ví dụ nếu bạn cần lấy danh sách topic đã có) ---
// export const getTopics = (): Promise<AxiosResponse<any>> => {
//   // Giả sử backend có API trả về các topic đã dùng trong lessons
//   return apiClient.get('/topics/distinct');
// };