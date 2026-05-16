/**
 * components/chat/ChatWidget.jsx
 * Floating AI chatbot widget that appears on every page.
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { sendChatMessage } from "../../services/api";

export default function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! 👋 I'm ShopBot. Ask me anything about our products — I can help you find, compare, and recommend items!" }
  ]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Send full history for context-aware replies
      const data = await sendChatMessage(newMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 sm:w-96 flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-700 to-cyan-600">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">ShopBot</p>
              <p className="text-white/70 text-xs">AI Product Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs ${
                  m.role === "assistant" ? "bg-violet-600 text-white" : "bg-slate-600 text-white"
                }`}>
                  {m.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === "assistant"
                    ? "bg-slate-800 text-slate-100 rounded-tl-none"
                    : "bg-violet-600 text-white rounded-tr-none"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-slate-800 px-3 py-2 rounded-2xl rounded-tl-none">
                  <Loader2 size={16} className="animate-spin text-violet-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about a product…"
              className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 flex items-center justify-center bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl transition"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* FAB toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-gradient-to-br from-violet-600 to-cyan-600 text-white rounded-full shadow-lg shadow-violet-900/40 flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Toggle chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}
