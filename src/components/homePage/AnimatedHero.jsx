// src/components/homePage/AnimatedHero.jsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { BlueprintEngine } from "./BlueprintEngine";

const HEADLINE_LINES = [
  "La pièce exacte",
  "pour votre moto.",
];

export function AnimatedHero() {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <div className="absolute inset-0 bg-grid-faint" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-900/95 to-navy-950" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 py-20 md:flex-row md:py-28">
        {/* Texte */}
        <div className="flex-1 text-center md:text-left">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-mechanic-400"
          >
            Catalogue vérifié · Kankan, Guinée
          </motion.p>

          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            {HEADLINE_LINES.map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.12, duration: 0.55, ease: "easeOut" }}
                className="block"
              >
                {line}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.55, ease: "easeOut" }}
              className="block text-mechanic-400"
            >
              Vérifiée avant de partir.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mx-auto mt-5 max-w-md text-white/60 md:mx-0"
          >
            Motos, tricycles et pièces détachées, filtrés par modèle
            compatible. Livraison en 24 à 48h sur Kankan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start"
          >
            <Link
              href="/pieces"
              className="group relative overflow-hidden rounded-lg bg-mechanic-500 px-6 py-3 font-medium text-white transition-colors hover:bg-mechanic-600"
            >
              <span className="relative z-10">Trouver une pièce</span>
              <motion.div
                className="absolute inset-0 bg-white/15"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
            </Link>
            <Link
              href="/motos"
              className="rounded-lg border border-white/15 px-6 py-3 font-medium text-white/90 transition-colors hover:bg-white/5"
            >
              Voir les motos
            </Link>
          </motion.div>
        </div>

        {/* Signature visuelle : schema technique anime */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
          className="w-full flex-1 max-w-lg"
        >
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <BlueprintEngine className="h-auto w-full text-white/70" />
            <p className="mt-2 text-right font-mono text-[10px] tracking-widest text-white/30">
              FIG. 01 — RÉF. COMPATIBILITÉ
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}