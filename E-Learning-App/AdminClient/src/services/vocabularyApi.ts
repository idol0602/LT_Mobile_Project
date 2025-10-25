// src/services/vocabularyApi.ts
import axios, { type AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:5050/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// ======================
// ⚙️ VOCABULARY API
// ======================

// Lấy danh sách từ vựng (có phân trang, tìm kiếm, lọc)
export const getVocabularies = (
  page: number,
  rowsPerPage: number,
  searchTerm: string = "",
  searchLang: string = "en",
  posFilter: string = "all"
): Promise<AxiosResponse<any>> => {
  return apiClient.get("/vocabularies", {
    params: {
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm,
      lang: searchLang,
      pos: posFilter,
    },
  });
};

// Lấy nhiều từ theo danh sách ID
export const getVocabulariesByIds = (ids: string[]): Promise<AxiosResponse<any>> => {
  return apiClient.post("/vocabularies/many", { ids });
};

// Thêm một từ vựng mới (có thể kèm ảnh)
export const addVocabulary = (formData: FormData): Promise<AxiosResponse<any>> => {
  return apiClient.post("/vocabularies", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Cập nhật một từ vựng
export const updateVocabulary = (
  id: string,
  formData: FormData
): Promise<AxiosResponse<any>> => {
  return apiClient.put(`/vocabularies/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Xoá một từ vựng
export const deleteVocabulary = (id: string): Promise<AxiosResponse<any>> => {
  return apiClient.delete(`/vocabularies/${id}`);
};

// Thống kê từ vựng
export const getVocabularyStats = (): Promise<AxiosResponse<any>> => {
  return apiClient.get("/vocabularies/stats");
};

// Import từ vựng từ file Excel
export const importVocabularies = (formData: FormData): Promise<AxiosResponse<any>> => {
  return apiClient.post("/vocabularies/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
