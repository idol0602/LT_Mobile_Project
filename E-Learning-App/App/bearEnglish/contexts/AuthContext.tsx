import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  _id: string;
  fullName?: string; // Trường từ DB
  name?: string; // Trường backup
  email: string;
  phoneNumber?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (userData: User, authToken: string) => {
    console.log("Saving user to context:", userData);
    setUser(userData);
    setToken(authToken);
    // Có thể lưu vào AsyncStorage ở đây nếu cần persist
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Xóa khỏi AsyncStorage nếu đã lưu
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
