// components/FloatingCTA.jsx
"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function FloatingCTA() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [0, 0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.6], [50, 50, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link
        href="/pieces"
        className="group flex items-center gap-2 rounded-full bg-mechanic-500 px-6 py-3 font-medium text-white shadow-2xl shadow-mechanic-500/30 transition-all hover:scale-110 hover:bg-mechanic-600"
      >
        <ShoppingCart className="h-5 w-5" />
        <span>Acheter maintenant</span>
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          1
        </span>
      </Link>
    </motion.div>
  );
}