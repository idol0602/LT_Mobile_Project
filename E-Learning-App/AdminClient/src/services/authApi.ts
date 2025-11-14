// src/services/authApi.ts
import axios, { type AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:5050/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================
// 🔐 AUTH API
// ======================

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
      role: string;
      isVerified: boolean;
      avatar?: string;
    };
    token: string;
  };
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

// Đăng ký tài khoản mới
export const register = (data: RegisterData): Promise<AxiosResponse<UserResponse>> => {
  return apiClient.post("/users/register", data);
};

// Đăng nhập
export const login = (data: LoginData): Promise<AxiosResponse<UserResponse>> => {
  return apiClient.post("/users/login", data);
};

// Lấy thông tin user hiện tại
export const getMe = (): Promise<AxiosResponse<any>> => {
  return apiClient.get("/users/me");
};

// Cập nhật profile
export const updateProfile = (data: {
  fullName?: string;
  phoneNumber?: string;
  avatar?: string;
}): Promise<AxiosResponse<any>> => {
  return apiClient.put("/users/me", data);
};

// Đổi mật khẩu
export const changePassword = (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<AxiosResponse<any>> => {
  return apiClient.put("/users/change-password", data);
};

// Xác nhận email
export const verifyEmail = (token: string): Promise<AxiosResponse<VerifyEmailResponse>> => {
  return apiClient.get(`/users/verify-email/${token}`);
};

// Gửi lại email xác nhận
export const resendVerification = (email: string): Promise<AxiosResponse<any>> => {
  return apiClient.post("/users/resend-verification", { email });
};

export default apiClient;
