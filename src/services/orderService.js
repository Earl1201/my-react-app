import api from "./api.js";

export const orderService = {
  async create(listingId, quantity = 1, notes = "") {
    const res = await api.post("/orders", { listingId, quantity, notes });
    return res.data;
  },
  async getMyOrders() {
    const res = await api.get("/orders");
    return res.data;
  },
  async getSellingOrders() {
    const res = await api.get("/orders/selling");
    return res.data;
  },
  async updateStatus(orderId, status) {
    const res = await api.put(`/orders/${orderId}/status`, { status });
    return res.data;
  },
};
