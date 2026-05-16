import api from "./api.js";

export const authService = {
  async register(data) {
    const res = await api.post("/auth/register", data);
    return res.data; // { token, user }
  },

  async login(data) {
    const res = await api.post("/auth/login", data);
    return res.data; // { token, user }
  },

  async googleLogin(accessToken) {
    const res = await api.post("/auth/google", { access_token: accessToken });
    return res.data; // { token, user }
  },

  async getMe() {
    const res = await api.get("/auth/me");
    return res.data; // { user }
  },

  async forgotPassword(email) {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  async resetPassword(token, password) {
    const res = await api.post("/auth/reset-password", { token, password });
    return res.data;
  },
};
