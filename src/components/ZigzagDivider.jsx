// src/components/ZigzagDivider.jsx
"use client";

import { cn } from "@/lib/utiles";
import { cva } from "class-variance-authority";

const wrapper = cva("relative w-full overflow-hidden leading-[0]", {
  variants: {
    flip: {
      true: "rotate-180",
      false: "",
    },
  },
});

// Génère un chemin en dents de scie (zigzag) sur toute la largeur du viewBox
function buildZigzagPath({ width = 1440, height = 40, teeth = 24 }) {
  const step = width / teeth;
  let d = `M0,${height} L0,${height / 2}`;
  for (let i = 0; i <= teeth; i++) {
    const x = i * step;
    const y = i % 2 === 0 ? 0 : height / 2;
    d += ` L${x},${y}`;
  }
  d += ` L${width},${height} Z`;
  return d;
}

export function ZigzagDivider({
  color = "#151E2E",
  flip = false,
  teeth = 24,
  glint = true,
  className,
}) {
  const path = buildZigzagPath({ teeth });

  return (
    <div className={cn(wrapper({ flip }), className)} aria-hidden="true">
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        className="block h-6 w-full sm:h-8 md:h-10"
      >
        <path d={path} fill={color} />
      </svg>

      {glint && (
        <div
          className="pointer-events-none absolute inset-0 animate-zigzag-glint"
          style={{
            background:
              "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.35) 42%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.35) 58%, transparent 80%)",
            backgroundSize: "250% 100%",
            mixBlendMode: "overlay",
          }}
        />
      )}
    </div>
  );
}
