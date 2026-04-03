import api from "./api.js";

export const listingService = {
  async getAll(params = {}) {
    const res = await api.get("/listings", { params });
    return res.data; // { listings, total, page, limit }
  },
  async getById(id) {
    const res = await api.get(`/listings/${id}`);
    return res.data; // { listing }
  },
  async getMy() {
    const res = await api.get("/listings/my");
    return res.data; // { listings }
  },
  async create(formData) {
    const res = await api.post("/listings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // { message, listingId }
  },
  async update(id, data) {
    const res = await api.put(`/listings/${id}`, data);
    return res.data;
  },
  async delete(id) {
    const res = await api.delete(`/listings/${id}`);
    return res.data;
  },
  async updateStatus(id, status) {
    const res = await api.put(`/listings/${id}/status`, { status });
    return res.data;
  },
};
