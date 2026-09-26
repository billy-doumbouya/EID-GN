"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bike } from "lucide-react";
import { LottiePlayer } from "@/components/LottiePlayer";
import LottiAnimation from "@/components/lottie/LottiAnimation.json";

const SUGGESTIONS = [
  "Motos disponibles en stock",
  "Suivre ma commande",
  "Zones de livraison à Kankan",
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
      {/* BOUTON FLOTTANT SOFT UI */}
      <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-6 z-50 sm:bottom-24">
        {!hasOpened && (
          <span className="absolute inset-0 animate-ping rounded-full bg-mechanic-500/30" />
        )}
        <motion.button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
          aria-expanded={open}
          aria-controls="eidgn-chat-window"
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.04 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#e6eef8] text-slate-800 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff] transition-all hover:shadow-[3px_3px_6px_#c3cad3,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "chat"}
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center text-mechanic-500"
            >
              {open ? (
                <X size={24} className="text-slate-700" />
              ) : (
                <LottiePlayer
                  animationData={LottiAnimation}
                  loop={true}
                  className="h-16 w-16"
                />
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* FENÊTRE DE CHAT SOFT UI */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            id="eidgn-chat-window"
            role="dialog"
            aria-label="Assistant EID-GN"
            className="fixed inset-x-3 bottom-[calc(10rem+env(safe-area-inset-bottom))] z-50 flex h-[min(30rem,calc(100dvh-11rem-env(safe-area-inset-bottom)))] min-h-0 flex-col overflow-hidden rounded-2xl border border-navy-800/10 bg-[#e6eef8] shadow-[0_16px_48px_rgba(21,30,46,0.24)] sm:inset-x-auto sm:bottom-40 sm:right-6 sm:h-120 sm:w-96 sm:rounded-3xl"
          >
            {/* EN-TÊTE CHATBOT */}
            <div className="relative isolate shrink-0 overflow-hidden bg-navy-900 px-4 py-3.5 text-white">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid-faint opacity-70" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-mechanic-400/20 bg-mechanic-500/15">
                  <Bike size={20} className="text-mechanic-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    Assistant EID-GN
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-white/60">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    En ligne
                  </p>
                </div>
              </div>
            </div>

            {/* ZONE DE MESSAGES */}
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain p-3 scrollbar-thin [scrollbar-color:#c3cad3_transparent] sm:p-4"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${
                    m.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#e6eef8] shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff]">
                      <Bike size={14} className="text-mechanic-500" />
                    </div>
                  )}
                  <div
                    className={`max-w-[86%] wrap-anywhere rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed whitespace-pre-line ${
                      m.role === "user"
                        ? "rounded-br-md bg-navy-900 text-white shadow-sm"
                        : "rounded-bl-md border border-navy-800/5 bg-white text-navy-800 shadow-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {/* EN COURS DE CHARGEMENT */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-end gap-2"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#e6eef8] shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff]">
                    <Bike size={14} className="text-mechanic-500" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-none bg-[#e6eef8] px-4 py-3 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-slate-400"
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

              {/* SUGGESTIONS RAPIDES */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-wrap gap-2 pt-2"
                  >
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={s}
                        onClick={() => dispatchMessage(s)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="max-w-full whitespace-normal wrap-break-word rounded-lg border border-navy-800/10 bg-white px-3 py-2 text-left text-[11px] font-medium leading-snug text-navy-800 shadow-sm transition-colors hover:border-mechanic-500/40 hover:text-mechanic-600"
                      >
                        {s}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FORMULAIRE D'ENVOI */}
            <form
              onSubmit={sendMessage}
              className="flex shrink-0 items-center gap-2 border-t border-navy-800/10 bg-white p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question..."
                className="min-w-0 flex-1 rounded-xl border border-navy-800/10 bg-offwhite-100 px-3.5 py-3 text-sm font-medium text-navy-900 outline-none transition-colors placeholder:text-navy-800/40 focus-visible:border-mechanic-500"
              />
              <motion.button
                type="submit"
                disabled={loading || !input.trim()}
                whileTap={{ scale: 0.92 }}
                aria-label="Envoyer"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mechanic-500 text-white shadow-sm transition-colors hover:bg-mechanic-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={15} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
