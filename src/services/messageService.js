import api from "./api.js";

export const messageService = {
  async getConversations() {
    const res = await api.get("/messages/conversations");
    return res.data;
  },
  async startConversation(listingId, recipientId) {
    const res = await api.post("/messages/conversations", { listingId, recipientId });
    return res.data; // { conversationId }
  },
  async getMessages(conversationId) {
    const res = await api.get(`/messages/conversations/${conversationId}`);
    return res.data; // { messages }
  },
  async sendMessage(conversationId, content) {
    const res = await api.post(`/messages/conversations/${conversationId}`, { content });
    return res.data; // { message }
  },
};
