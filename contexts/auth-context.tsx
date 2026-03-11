"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User, Session, AuthState, LoginCredentials, SignUpData } from "@/lib/auth-types";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedSession = localStorage.getItem("auth_session");
        const storedUser = localStorage.getItem("auth_user");

        if (storedSession && storedUser) {
          const session = JSON.parse(storedSession) as Session;
          const user = JSON.parse(storedUser) as User;

          // Check if session is still valid
          if (new Date(session.expiresAt) > new Date()) {
            setAuthState({
              session,
              user,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            // Session expired
            localStorage.removeItem("auth_session");
            localStorage.removeItem("auth_user");
            setAuthState({
              session: null,
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: undefined }));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock user based on email for demo purposes
      const mockUser: User = {
        id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        email: credentials.email,
        name: credentials.email.split("@")[0],
        role: credentials.email.includes("admin") ? "admin" : "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subscription: {
          status: "active",
          planId: "plan_pro",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        profile: {},
      };

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const session: Session = {
        userId: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: new Date().toISOString(),
        expiresAt,
      };

      localStorage.setItem("auth_session", JSON.stringify(session));
      localStorage.setItem("auth_user", JSON.stringify(mockUser));

      setAuthState({
        session,
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
      });

      router.push("/dashboard");
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Login failed. Please try again.",
      }));
      throw error;
    }
  };

  const signup = async (data: SignUpData) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: undefined }));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        email: data.email,
        name: data.name,
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subscription: {
          status: "trialing",
          planId: "plan_starter",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        profile: {},
      };

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const session: Session = {
        userId: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: new Date().toISOString(),
        expiresAt,
      };

      localStorage.setItem("auth_session", JSON.stringify(session));
      localStorage.setItem("auth_user", JSON.stringify(mockUser));

      setAuthState({
        session,
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
      });

      router.push("/dashboard");
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Signup failed. Please try again.",
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("auth_session");
      localStorage.removeItem("auth_user");

      setAuthState({
        session: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Password reset failed.",
      }));
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!authState.user) throw new Error("No user logged in");

      setAuthState((prev) => ({ ...prev, isLoading: true }));
      await new Promise((resolve) => setTimeout(resolve, 600));

      const updatedUser = { ...authState.user, ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));

      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Profile update failed.",
      }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
