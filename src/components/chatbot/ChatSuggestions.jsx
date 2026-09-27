"use client";

import { motion } from "framer-motion";

const DEFAULT_SUGGESTIONS = [
  "Motos disponibles en stock 🏍️",
  "Suivre ma commande 📦",
  "Délais de livraison en Guinée 🚚",
  "Paiement Orange Money / MoMo 💳",
];

export function ChatSuggestions({ onSelect, suggestions = DEFAULT_SUGGESTIONS, disabled = false }) {
  if (!suggestions?.length) return null;

  return (
    <div className="flex flex-col gap-1.5 pt-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 px-1">
        Questions fréquentes :
      </span>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((text, i) => (
          <motion.button
            key={text}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(text)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            whileHover={disabled ? undefined : { scale: 1.02 }}
            whileTap={disabled ? undefined : { scale: 0.97 }}
            className="rounded-full border border-white/10 bg-navy-900/80 px-3 py-1.5 text-left text-xs font-medium text-slate-200 shadow-sm transition-all hover:border-mechanic-500/40 hover:bg-navy-800 hover:text-white disabled:pointer-events-none disabled:opacity-50"
          >
            {text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
