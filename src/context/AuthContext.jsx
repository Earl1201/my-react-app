import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  // Start loading=true only when a token exists so we never call setLoading synchronously in the effect
  const [loading, setLoading] = useState(() => !!localStorage.getItem("nh_token"));

  // On first mount: if a token is in localStorage, verify it with /api/auth/me
  useEffect(() => {
    const token = localStorage.getItem("nh_token");
    if (!token) return; // loading is already false
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
    localStorage.setItem("nh_user", JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  // ── login ────────────────────────────────────────────────────
  const login = useCallback(async (formData) => {
    const { token, user } = await authService.login(formData);
    localStorage.setItem("nh_token", token);
    localStorage.setItem("nh_user", JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  // ── loginWithGoogle ──────────────────────────────────────────
  const loginWithGoogle = useCallback(async (accessToken) => {
    const { token, user } = await authService.googleLogin(accessToken);
    localStorage.setItem("nh_token", token);
    localStorage.setItem("nh_user", JSON.stringify(user));
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
    localStorage.removeItem("nh_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
