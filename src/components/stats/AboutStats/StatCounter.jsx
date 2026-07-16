// src/components/StatCounter.jsx
"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export function StatCounter({ value, suffix = "", label }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1.4, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return (
    <div ref={ref} className="text-center">
      <span className="font-display text-3xl font-bold text-mechanic-400 md:text-5xl">
        {display.toLocaleString("fr-FR")}
        {suffix}
      </span>
      <p className="mt-1 text-xs text-white/60 md:text-sm">{label}</p>
    </div>
  );
}
