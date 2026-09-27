"use client";

import { useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";
import { motion } from "framer-motion";

export function ChatInput({
  input,
  onInputChange,
  onSend,
  isStreaming,
  onAbort,
}) {
  const inputRef = useRef(null);

  // Focus automatique
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isStreaming) {
      onAbort?.();
      return;
    }
    if (!input.trim()) return;
    onSend(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="shrink-0 border-t border-white/10 bg-navy-950/80 p-3 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isStreaming
              ? "Génération en cours..."
              : "Posez votre question..."
          }
          disabled={isStreaming}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-navy-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition-colors focus:border-mechanic-500 focus:ring-1 focus:ring-mechanic-500 disabled:opacity-60"
        />

        {isStreaming ? (
          <motion.button
            type="button"
            onClick={onAbort}
            whileTap={{ scale: 0.92 }}
            aria-label="Arrêter la réponse"
            title="Arrêter la réponse"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors hover:bg-amber-500/30"
          >
            <Square size={14} className="fill-current" />
          </motion.button>
        ) : (
          <motion.button
            type="submit"
            disabled={!input.trim()}
            whileTap={{ scale: 0.92 }}
            aria-label="Envoyer"
            title="Envoyer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mechanic-500 text-white shadow-sm transition-all hover:bg-mechanic-400 disabled:pointer-events-none disabled:opacity-40"
          >
            <Send size={15} />
          </motion.button>
        )}
      </form>
      <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-slate-400">
        <span>TVS • KTM • Haojue • Pièces</span>
        <span>Kankan, Guinée 🇬🇳</span>
      </div>
    </div>
  );
}
