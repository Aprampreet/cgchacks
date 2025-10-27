"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { fetchProfile, logoutUser } from "@/utlis/api";

interface UserProfile {
  avatar_url?: string;
  username: string;
}

interface AuthContextType {
  isAuth: boolean;
  user: UserProfile | null;
  loading: boolean; // ✅ new
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // ✅ new

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await fetchProfile();
        setUser(profile);
        setIsAuth(true);
      } catch {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setIsAuth(false);
        setUser(null);
      } finally {
        setLoading(false); // ✅ stop loading after attempt
      }
    };
    initAuth();
  }, []);

  const login = async (access: string, refresh: string) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    try {
      const profile = await fetchProfile();
      setUser(profile);
      setIsAuth(true);
    } catch {
      setIsAuth(false);
      setUser(null);
    }
  };

  const logout = async () => {
    const refresh = localStorage.getItem("refresh");
    if (refresh) {
      try {
        await logoutUser(refresh);
      } catch (err) {
        console.error("Backend logout failed:", err);
      }
    }

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuth(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuth, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
