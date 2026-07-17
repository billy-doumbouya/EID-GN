// src/components/homePage/BlueprintEngine.jsx
"use client";
import { motion } from "framer-motion";

// Silhouette de moto stylisee, tracee comme un plan technique.
// currentColor : la couleur se controle via className (text-*) au niveau du <svg>.
const STROKES = [
  "M60 150a34 34 0 1 0 68 0 34 34 0 1 0-68 0Z", // roue arriere
  "M212 150a34 34 0 1 0 68 0 34 34 0 1 0-68 0Z", // roue avant
  "M94 150 L150 90 L205 150", // cadre bas
  "M150 90 L150 60 L190 60", // colonne de direction + guidon
  "M150 90 L120 60 L94 150", // selle / cadre haut
  "M205 150 L246 150", // bras oscillant
  "M120 60 L100 55", // selle
  "M190 60 L200 50 L215 50", // guidon
];

const CALLOUTS = [
  { x: 88, y: 40, label: "CHAÎNE · 428H" },
  { x: 250, y: 95, label: "BATTERIE 12V" },
  { x: 165, y: 20, label: "FILTRE À HUILE" },
];

export function BlueprintEngine({ className = "" }) {
  return (
    <svg viewBox="0 0 340 200" fill="none" className={className} aria-hidden="true">
      <defs>
        <pattern id="blueprint-grid" width="17" height="17" patternUnits="userSpaceOnUse">
          <path d="M 17 0 L 0 0 0 17" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="340" height="200" fill="url(#blueprint-grid)" />

      <motion.g
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="hidden"
        animate="visible"
      >
        {STROKES.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: {
                pathLength: 1,
                opacity: 1,
                transition: { duration: 1, delay: 0.12 * i, ease: "easeInOut" },
              },
            }}
          />
        ))}
      </motion.g>

      {CALLOUTS.map((c, i) => (
        <motion.g
          key={c.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 + i * 0.15, duration: 0.5 }}
        >
          <circle cx={c.x} cy={c.y} r="2.5" fill="currentColor" />
          <line
            x1={c.x}
            y1={c.y}
            x2={c.x + 20}
            y2={c.y - 14}
            stroke="currentColor"
            strokeWidth="0.75"
          />
          <text
            x={c.x + 23}
            y={c.y - 12}
            fontSize="7"
            fontFamily="var(--font-mono)"
            fill="currentColor"
            letterSpacing="0.03em"
          >
            {c.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}