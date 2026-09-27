"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

export function PromoCountdown({
  targetDate,
  targetHours = 48,
  label = "Offre Spéciale",
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    setMounted(true);

    const targetTime = targetDate
      ? new Date(targetDate).getTime()
      : Date.now() + targetHours * 60 * 60 * 1000;

    const calculateTime = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return false;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      return true;
    };

    const hasTime = calculateTime();
    if (!hasTime) return;

    const interval = setInterval(() => {
      const active = calculateTime();
      if (!active) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, targetHours]);

  if (!mounted) {
    return (
      <div className="h-16 w-full animate-pulse rounded-2xl bg-mechanic-500/10 border border-mechanic-500/20" />
    );
  }

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-xs text-offwhite-100/50">
        <Zap size={14} className="text-mechanic-400" />
        <span>Offre promotionnelle expirée</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-mechanic-500/30 bg-gradient-to-r from-mechanic-500/10 via-mechanic-500/5 to-transparent p-3.5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mechanic-500 text-white shadow-glow-mechanic shrink-0">
            <Zap size={16} className="fill-white" />
          </span>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              {label}
            </p>
            <p className="text-[11px] font-medium text-offwhite-100/60">
              Prix promotionnel valable sous réserve de stock
            </p>
          </div>
        </div>

        {/* Chronomètre UI */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {timeLeft.days > 0 && (
            <>
              <div className="flex flex-col items-center justify-center rounded-xl bg-navy-950/80 border border-white/10 px-2.5 py-1 text-white min-w-[38px]">
                <span className="font-mono text-xs font-bold leading-none">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase text-offwhite-100/50 mt-0.5">
                  J
                </span>
              </div>
              <span className="font-bold text-mechanic-400 text-xs">:</span>
            </>
          )}

          <div className="flex flex-col items-center justify-center rounded-xl bg-navy-950/80 border border-white/10 px-2.5 py-1 text-white min-w-[38px]">
            <span className="font-mono text-xs font-bold leading-none">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase text-offwhite-100/50 mt-0.5">
              H
            </span>
          </div>

          <span className="font-bold text-mechanic-400 text-xs">:</span>

          <div className="flex flex-col items-center justify-center rounded-xl bg-navy-950/80 border border-white/10 px-2.5 py-1 text-white min-w-[38px]">
            <span className="font-mono text-xs font-bold leading-none">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase text-offwhite-100/50 mt-0.5">
              M
            </span>
          </div>

          <span className="font-bold text-mechanic-400 text-xs">:</span>

          <div className="flex flex-col items-center justify-center rounded-xl bg-mechanic-500 px-2.5 py-1 text-white min-w-[38px] shadow-sm">
            <span className="font-mono text-xs font-bold leading-none">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase text-white/80 mt-0.5 font-bold">
              S
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
