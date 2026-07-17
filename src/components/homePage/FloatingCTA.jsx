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
      {/* `relative` ajoute ici : le badge en absolute plus bas se positionnait
          sinon par rapport a l'ancetre positionne le plus proche (souvent
          <body>), pas par rapport au bouton. */}
      <Link
        href="/pieces"
        className="relative flex items-center gap-2 rounded-full bg-mechanic-500 px-6 py-3 font-medium text-white shadow-xl shadow-mechanic-500/25 transition-colors hover:bg-mechanic-600"
      >
        <ShoppingCart className="h-5 w-5" />
        <span>Acheter maintenant</span>
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-bold text-white">
          1
        </span>
      </Link>
    </motion.div>
  );
}