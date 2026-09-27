"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

export function ChatTrigger({ open, hasOpened, onToggle }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-50">
      {/* Pulse "nouveau" si jamais ouvert */}
      {!hasOpened && !open && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-mechanic-500/40 animate-ping"
        />
      )}

      <motion.button
        onClick={onToggle}
        aria-label={open ? "Fermer l'assistant EID-MULTISERVICE" : "Ouvrir l'assistant EID-MULTISERVICE"}
        aria-expanded={open}
        aria-controls="eidgn-chat-window"
        whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-mechanic-500 text-white shadow-glow-mechanic transition-colors hover:bg-mechanic-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mechanic-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
      >
        <AnimateIcon open={open} />
      </motion.button>

      {/* Tooltip "Posez une question" si jamais ouvert */}
      {!hasOpened && !open && (
        <span
          aria-hidden
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg border border-white/10"
        >
          Une question ? 👋
        </span>
      )}
    </div>
  );
}

function AnimateIcon({ open }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />;
  }

  return (
    <motion.span
      key={open ? "close" : "chat"}
      initial={{ opacity: 0, rotate: -45 }}
      animate={{ opacity: 1, rotate: 0 }}
      exit={{ opacity: 0, rotate: 45 }}
      transition={{ duration: 0.15 }}
      className="flex items-center justify-center"
    >
      {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
    </motion.span>
  );
}
