import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while we validate a stored token

  // On first mount: if a token is in localStorage, verify it with /api/auth/me
  useEffect(() => {
    const token = localStorage.getItem("nh_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        // Token invalid/expired — clear it
        localStorage.removeItem("nh_token");
        localStorage.removeItem("nh_user");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── register ────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const { token, user } = await authService.register(formData);
    localStorage.setItem("nh_token", token);
    setUser(user);
    return user;
  }, []);

  // ── login ────────────────────────────────────────────────────
  const login = useCallback(async (formData) => {
    const { token, user } = await authService.login(formData);
    localStorage.setItem("nh_token", token);
    setUser(user);
    return user;
  }, []);

  // ── updateUser ───────────────────────────────────────────────
  // Call this after a successful profile update so the navbar/context stays fresh
  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  // ── logout ───────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("nh_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
