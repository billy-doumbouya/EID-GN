// src/components/homePage/FloatingCTA.jsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function FloatingCTA() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [0, 0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.6], [40, 40, 0]);

  return (
    <motion.div style={{ opacity, y }} className="fixed bottom-6 right-6 z-50">
      <Link
        href="/pieces"
        className="group relative flex items-center gap-2.5 rounded-full bg-[#e6eef8] px-6 py-3.5 font-bold text-slate-800 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff] transition-all duration-300 hover:shadow-[3px_3px_6px_#c3cad3,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6eef8] text-mechanic-500 shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff] transition-colors group-hover:text-mechanic-600">
          <ShoppingCart className="h-4 w-4" />
        </div>
        <span className="text-xs tracking-wide">Acheter maintenant</span>

        {/* BADGE NOTIFICATION SOFT UI */}
        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#e6eef8] font-mono text-[11px] font-bold text-rose-500 shadow-[2px_2px_5px_#c3cad3,-2px_-2px_5px_#ffffff]">
          1
        </span>
      </Link>
    </motion.div>
  );
}
