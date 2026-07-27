"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearStoredAuth, loadStoredAuth, persistAuth } from "@/lib/auth";
import type { AuthResponse, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Intentionally read localStorage post-mount rather than via a useState lazy
    // initializer: the server-rendered HTML always shows a logged-out state (no
    // access to localStorage), so the client's first render must match that to
    // avoid a hydration mismatch. This effect updates auth state right after.
    const stored = loadStoredAuth();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(stored.user);
      setToken(stored.token);
    }
    setIsLoading(false);
  }, []);

  const applyAuth = useCallback((data: AuthResponse) => {
    persistAuth(data.access_token, data.user);
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.post<AuthResponse>("/auth/login", { email, password });
      applyAuth(data);
    },
    [applyAuth]
  );

  const signup = useCallback(
    async (email: string, password: string, fullName: string) => {
      const data = await api.post<AuthResponse>("/auth/signup", {
        email,
        password,
        full_name: fullName,
      });
      applyAuth(data);
    },
    [applyAuth]
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(
    (updated: User) => {
      setUser(updated);
      if (token) persistAuth(token, updated);
    },
    [token]
  );

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
