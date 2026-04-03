import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, MessageCircle } from "lucide-react";
import { messageService } from "../services/messageService.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(searchParams.get("conv") ? Number(searchParams.get("conv")) : null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();

  // Load conversations
  useEffect(() => {
    messageService.getConversations()
      .then(({ conversations }) => {
        setConversations(conversations);
        // Auto-select first if none selected
        if (!activeConvId && conversations.length > 0) {
          setActiveConvId(conversations[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Load messages for active conversation + poll every 5s
  const loadMessages = useCallback(() => {
    if (!activeConvId) return;
    messageService.getMessages(activeConvId)
      .then(({ messages }) => setMessages(messages))
      .catch(() => {});
  }, [activeConvId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConv = (id) => {
    setActiveConvId(id);
    setSearchParams({ conv: id });
    setMessages([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConvId) return;
    setSending(true);
    try {
      const { message } = await messageService.sendMessage(activeConvId, newMsg.trim());
      setMessages((prev) => [...prev, message]);
      setNewMsg("");
      // Update last message preview in sidebar
      setConversations((prev) =>
        prev.map((c) => c.id === activeConvId ? { ...c, last_message: message.content, last_message_at: message.created_at } : c)
      );
    } catch {
      /* silent */
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex" style={{ height: "70vh" }}>

        {/* ── Conversation list ── */}
        <aside className="w-72 shrink-0 border-r border-gray-200 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageCircle className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No conversations yet.</p>
              <p className="text-xs text-gray-400 mt-1">Message a seller from any listing.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConv(conv.id)}
                className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${activeConvId === conv.id ? "bg-primary-50" : ""}`}
              >
                {conv.other_user_avatar ? (
                  <img src={conv.other_user_avatar} alt={conv.other_user_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                    <span className="text-primary-700 font-bold text-sm">{conv.other_user_name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 truncate">{conv.other_user_name}</p>
                    {conv.unread_count > 0 && (
                      <span className="ml-1 shrink-0 w-5 h-5 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center">{conv.unread_count}</span>
                    )}
                  </div>
                  {conv.listing_title && <p className="text-xs text-primary-600 truncate">Re: {conv.listing_title}</p>}
                  <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last_message || "No messages yet"}</p>
                </div>
              </button>
            ))
          )}
        </aside>

        {/* ── Message thread ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeConvId ? (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div>
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-3 border-b border-gray-200 bg-white flex items-center gap-3 shrink-0">
                {activeConv?.other_user_avatar ? (
                  <img src={activeConv.other_user_avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-bold text-xs">{activeConv?.other_user_name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{activeConv?.other_user_name}</p>
                  {activeConv?.listing_title && <p className="text-xs text-gray-500 truncate">Re: {activeConv.listing_title}</p>}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">No messages yet. Say hello! 👋</p>
                )}
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                          <span className="text-primary-700 font-bold text-[10px]">{msg.sender_name?.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-primary-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-primary-200" : "text-gray-400"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-200 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={!newMsg.trim() || sending}
                  className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
