"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bike } from "lucide-react";
import { LottiePlayer } from "@/components/LottiePlayer";
import LottiAnimation from "@/components/lottie/LottiAnimation.json";

const SUGGESTIONS = [
  "Motos disponibles en stock",
  "Suivre ma commande",
  "Zones de livraison a Kankan",
  "Moyens de paiement",
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour ! Je peux vous renseigner sur nos produits, stocks et commandes. Comment puis-je vous aider ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Identifiant stable pour toute la duree de vie du widget (persiste entre
  // ouverture/fermeture tant que la page n'est pas rechargee), utilise pour
  // regrouper les messages d'une meme conversation en base (analytics).
  const [sessionId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setHasOpened(true);
      inputRef.current?.focus();
    }
  }, [open]);

  async function dispatchMessage(text) {
    if (!text.trim() || loading) return;

    const userMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          sessionId,
        }),
      });
      const data = await res.json();
      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "Une erreur est survenue. Vous pouvez nous contacter directement sur WhatsApp.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function sendMessage(e) {
    e.preventDefault();
    dispatchMessage(input);
  }

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <>
      <div className="fixed bottom-24 right-6 z-50">
        {!hasOpened && (
          <span className="absolute inset-0 animate-ping rounded-full bg-mechanic-500/40" />
        )}
        <motion.button
          onClick={() => setOpen((o) => !o)}
          aria-label="Assistant"
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.04 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy-900 to-navy-800 text-white shadow-lg shadow-navy-900/30 ring-1 ring-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mechanic-500"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "chat"}
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              {open ? (
                <X size={22} />
              ) : (
                <LottiePlayer
                  animationData={LottiAnimation}
                  loop={true}
                  className="h-18 w-18"
                />
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-40 right-6 z-50 flex h-[30rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-navy-900/10 bg-white/95 shadow-2xl shadow-navy-900/20 backdrop-blur-xl sm:w-96"
          >
            <div className="relative overflow-hidden bg-navy-900 px-4 py-3.5">
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-24 rotate-12 bg-mechanic-500/90" />
              <div className="pointer-events-none absolute -right-2 top-8 h-3 w-28 -rotate-[20deg] bg-mechanic-500/40" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                  <Bike size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    Assistant EID-GN
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px] text-white/60">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    En ligne
                  </p>
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto p-3.5 [scrollbar-width:thin] [scrollbar-color:theme(colors.navy.900/15)_transparent]"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {m.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900/5">
                      <Bike size={12} className="text-navy-900/50" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md bg-gradient-to-br from-mechanic-500 to-mechanic-600 text-white shadow-sm shadow-mechanic-500/25"
                        : "rounded-bl-md bg-offwhite-200 text-navy-900"
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-end gap-2"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900/5">
                    <Bike size={12} className="text-navy-900/50" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-offwhite-200 px-3.5 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-navy-900/40"
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-wrap gap-1.5 pl-8 pt-1"
                  >
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={s}
                        onClick={() => dispatchMessage(s)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="rounded-full border border-navy-900/10 bg-white px-3 py-1.5 text-xs font-medium text-navy-900/80 shadow-sm transition-colors hover:border-mechanic-500/40 hover:text-mechanic-600"
                      >
                        {s}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 border-t border-navy-900/10 bg-white p-2.5"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question..."
                className="flex-1 rounded-full border border-navy-900/10 bg-offwhite-200/60 px-4 py-2.5 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-900/40 focus-visible:border-mechanic-500 focus-visible:bg-white"
              />
              <motion.button
                type="submit"
                disabled={loading || !input.trim()}
                whileTap={{ scale: 0.9 }}
                aria-label="Envoyer"
                className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-mechanic-500 to-mechanic-600 text-white shadow-sm shadow-mechanic-500/30 disabled:opacity-40"
              >
                <span className="pointer-events-none absolute -right-3 -top-3 h-8 w-8 rotate-12 bg-white/15" />
                <Send size={15} className="relative" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
