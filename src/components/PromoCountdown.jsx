// src/components/PromoCountdown.jsx
"use client";

import { useState, useEffect } from "react";
import { Timer, Zap } from "lucide-react";

export function PromoCountdown({ targetHours = 50 }) {
  // Par défaut 50h (~ 2 jours, 2 heures) pour la démo
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // On définit une date de fin relative basée sur la session du navigateur
    const targetDate = new Date(Date.now() + targetHours * 60 * 60 * 1000);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetHours]);

  if (!mounted) {
    return (
      <div className="h-16 w-full animate-pulse rounded-xl bg-amber-500/10" />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-3.5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs animate-pulse">
            <Zap size={15} className="fill-white" />
          </span>
          <div>
            <p className="text-xs font-bold text-navy-900 uppercase tracking-wide flex items-center gap-1">
              Offre Spéciale Kankan
            </p>
            <p className="text-[11px] font-medium text-navy-800/60">
              Prix promotionnel valable sous réserve de stock
            </p>
          </div>
        </div>

        {/* Chronomètre UI */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="flex flex-col items-center justify-center rounded-lg bg-navy-900 px-2 py-1 text-white min-w-[36px]">
            <span className="font-mono text-xs font-bold leading-none">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
            <span className="text-[9px] text-navy-800/60 uppercase text-slate-300">
              J
            </span>
          </div>
          <span className="font-bold text-navy-900 text-xs">:</span>
          <div className="flex flex-col items-center justify-center rounded-lg bg-navy-900 px-2 py-1 text-white min-w-[36px]">
            <span className="font-mono text-xs font-bold leading-none">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[9px] text-navy-800/60 uppercase text-slate-300">
              H
            </span>
          </div>
          <span className="font-bold text-navy-900 text-xs">:</span>
          <div className="flex flex-col items-center justify-center rounded-lg bg-navy-900 px-2 py-1 text-white min-w-[36px]">
            <span className="font-mono text-xs font-bold leading-none">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[9px] text-navy-800/60 uppercase text-slate-300">
              M
            </span>
          </div>
          <span className="font-bold text-navy-900 text-xs">:</span>
          <div className="flex flex-col items-center justify-center rounded-lg bg-amber-500 px-2 py-1 text-white min-w-[36px]">
            <span className="font-mono text-xs font-bold leading-none">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="text-[9px] text-amber-100 uppercase">S</span>
          </div>
        </div>
      </div>
    </div>
  );
}
