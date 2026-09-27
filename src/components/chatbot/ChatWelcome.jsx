"use client";

import { Sparkles, Bike, PackageCheck, ShieldCheck } from "lucide-react";

export function ChatWelcome() {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-3.5 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-mechanic-500/20 text-mechanic-400">
          <Sparkles size={14} />
        </span>
        <h3 className="text-xs font-semibold text-white">
          Bienvenue chez EID-MULTISERVICE Kankan 👋
        </h3>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-300">
        Je suis votre assistant direct. Posez-moi vos questions sur nos stocks réels, prix en GNF et délais de livraison.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5 text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <Bike size={11} className="text-mechanic-400 shrink-0" />
          <span className="truncate">Stocks réels</span>
        </div>
        <div className="flex items-center gap-1">
          <PackageCheck size={11} className="text-emerald-400 shrink-0" />
          <span className="truncate">Suivi colis</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck size={11} className="text-amber-400 shrink-0" />
          <span className="truncate">100% officiel</span>
        </div>
      </div>
    </div>
  );
}
