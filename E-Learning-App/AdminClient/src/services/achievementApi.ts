import axios, { type AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:5050/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// --- Achievement Types ---

export interface Achievement {
  _id?: string;
  name: string;
  code: string;
  description: string;
  type: "progress" | "vocab" | "streak" | "global" | "first";
  condition: {
    minLessonsCompleted?: number;
    minWordsLearned?: number;
    minStreak?: number;
    category?: string;
  };
  difficulty: "easy" | "normal" | "hard";
  icon: string;
  hidden: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAchievementsParams {
  includeHidden?: boolean;
}

// --- Achievement API Functions ---

/**
 * GET /api/achievements
 * Lấy tất cả achievements
 */
export const getAllAchievements = (
  params?: GetAchievementsParams
): Promise<AxiosResponse<any>> => {
  return apiClient.get("/achievements", { params });
};

/**
 * GET /api/achievements/:id
 * Lấy chi tiết một achievement
 */
export const getAchievementById = (
  id: string
): Promise<AxiosResponse<any>> => {
  return apiClient.get(`/achievements/${id}`);
};

/**
 * POST /api/achievements
 * Tạo achievement mới
 */
export const createAchievement = (
  data: Partial<Achievement>
): Promise<AxiosResponse<any>> => {
  return apiClient.post("/achievements", data);
};

/**
 * PUT /api/achievements/:id
 * Cập nhật achievement
 */
export const updateAchievement = (
  id: string,
  data: Partial<Achievement>
): Promise<AxiosResponse<any>> => {
  return apiClient.put(`/achievements/${id}`, data);
};

/**
 * DELETE /api/achievements/:id
 * Xóa achievement
 */
export const deleteAchievement = (id: string): Promise<AxiosResponse<any>> => {
  return apiClient.delete(`/achievements/${id}`);
};

/**
 * GET /api/achievements/user/:userId
 * Lấy achievements của user
 */
export const getUserAchievements = (
  userId: string
): Promise<AxiosResponse<any>> => {
  return apiClient.get(`/achievements/user/${userId}`);
};

/**
 * GET /api/achievements/user/:userId/stats
 * Lấy thống kê achievements của user
 */
export const getUserAchievementStats = (
  userId: string
): Promise<AxiosResponse<any>> => {
  return apiClient.get(`/achievements/user/${userId}/stats`);
};
