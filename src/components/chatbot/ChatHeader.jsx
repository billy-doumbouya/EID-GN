"use client";

import { Bike, RotateCcw, X } from "lucide-react";

export function ChatHeader({ onClear, onClose }) {
  return (
    <div className="relative isolate shrink-0 overflow-hidden border-b border-white/10 bg-navy-900 px-4 py-3.5 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-faint opacity-40"
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-mechanic-400/30 bg-mechanic-500/15 shadow-inner">
            <Bike size={20} className="text-mechanic-400" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-navy-900 bg-emerald-500" />
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold tracking-wide text-white">
              Assistant EID-MULTISERVICE
            </h2>
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-white/60">
              En ligne • Conseiller virtuel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClear}
            aria-label="Nouvelle conversation"
            title="Effacer et recommencer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mechanic-400"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le chat"
            title="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mechanic-400"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
