import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  _id?: string;
  id?: string; // Some APIs return 'id' instead of '_id'
  fullName?: string; // Trường từ DB
  name?: string; // Trường backup
  email: string;
  phoneNumber?: string;
  isVerified?: boolean;
  avatar?: string | null;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, authToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from AsyncStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          // Normalize: ensure _id exists
          const normalizedUser = {
            ...parsedUser,
            _id: parsedUser._id || parsedUser.id,
          };
          console.log("Loaded user from AsyncStorage:", normalizedUser);
          setUser(normalizedUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading user from AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (userData: User, authToken: string) => {
    console.log("Saving user to context:", userData);

    // Normalize: ensure _id exists (some APIs return 'id' instead)
    const normalizedUser = {
      ...userData,
      _id: userData._id || userData.id,
    };

    setUser(normalizedUser);
    setToken(authToken);

    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem("user", JSON.stringify(normalizedUser));
      await AsyncStorage.setItem("token", authToken);
      console.log("User and token saved to AsyncStorage");
    } catch (error) {
      console.error("Error saving to AsyncStorage:", error);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);

    // Clear AsyncStorage
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      console.log("User and token cleared from AsyncStorage");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  const updateUser = async (userData: User) => {
    // Normalize: ensure _id exists
    const normalizedUser = {
      ...userData,
      _id: userData._id || userData.id,
    };

    setUser(normalizedUser);

    // Update AsyncStorage
    try {
      await AsyncStorage.setItem("user", JSON.stringify(normalizedUser));
      console.log("User updated in AsyncStorage");
    } catch (error) {
      console.error("Error updating user in AsyncStorage:", error);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
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
