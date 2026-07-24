import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// The assistant talks to a same-origin serverless endpoint that holds the API
// key server-side (see api/chat.ts for Vercel, public/api/chat.php for cPanel).
// No key is ever shipped to the browser. Override the path at build time with
// VITE_CHAT_ENDPOINT (e.g. "/api/chat.php" for the PHP deployment).
const CHAT_ENDPOINT =
  (import.meta as any).env?.VITE_CHAT_ENDPOINT || "/api/chat";

// Sectors the assistant can specialise in. "general" is the default.
const SECTORS = [
  "general",
  "agriculture",
  "health",
  "education",
  "finance",
  "legal",
  "transport",
  "energy",
] as const;

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm Solid LLM, the assistant for Solid Solutions. Ask me about our work in African tech — agriculture, health, finance, energy and more — or how to join the SolidAI beta.",
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sector, setSector] = useState<string>("general");
  const [isLoading, setIsLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const history = messages.filter((m) => m !== GREETING).slice(-8);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sector, history }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail: string =
          data?.error ||
          (res.status === 404
            ? "The assistant endpoint isn't deployed yet."
            : `Request failed (${res.status}).`);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              `⚠️ ${detail}\n\nIf you're the site owner, set OPENROUTER_API_KEY on the server ` +
              `(see api/chat.ts). Meanwhile, reach us at info@solidsolutions.africa.`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply as string },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ I couldn't reach the assistant service. Please check your connection, " +
            "or email us at info@solidsolutions.africa.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Solid LLM assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-charcoal text-white shadow-lg flex items-center justify-center"
      >
        <MessageSquare size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[32rem] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-charcoal text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">Solid LLM Assistant</h3>
                <p className="text-xs text-white/70">by Solid Solutions</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
                className="p-1 hover:bg-white/20 rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sector Selector */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                aria-label="Advisor focus"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-charcoal"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-charcoal text-white rounded-br-none"
                        : "bg-slate-100 text-slate-700 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-700 rounded-lg rounded-bl-none p-3 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about Solid Solutions…"
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-charcoal disabled:bg-slate-100"
                />
                <button
                  onClick={send}
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className="px-3 rounded-lg bg-charcoal text-white disabled:opacity-40 flex items-center justify-center"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
