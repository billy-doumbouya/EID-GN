// src/components/homePage/CategoryCard.jsx
"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Bike, Truck, Wrench, ArrowUpRight } from "lucide-react";

const iconMap = { Bike, Truck, Wrench };

export function CategoryCard({ href, label, desc, icon, code, delay = 0 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [6, -6]);
  const rotateY = useTransform(x, [-100, 100], [-6, 6]);
  const springRotateX = useSpring(rotateX, { damping: 20, stiffness: 300 });
  const springRotateY = useSpring(rotateY, { damping: 20, stiffness: 300 });

  const Icon = iconMap[icon];

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - (rect.left + rect.width / 2));
    y.set(e.clientY - (rect.top + rect.height / 2));
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ delay, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
      }}
    >
      <Link href={href} className="group block h-full">
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-[#e6eef8] p-6 shadow-[10px_10px_20px_#c3cad3,-10px_-10px_20px_#ffffff] transition-all duration-300 hover:shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
          {/* EN-TÊTE : CODE & FLÈCHE D'ACTION */}
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-[#e6eef8] px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider text-slate-500 shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
              {code}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e6eef8] text-slate-400 shadow-[3px_3px_6px_#c3cad3,-3px_-3px_6px_#ffffff] transition-all duration-300 group-hover:text-mechanic-500 group-hover:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* CONTENU : ICÔNE, TITRE ET DESCRIPTION */}
          <div className="mt-6">
            {Icon && (
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6eef8] shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
                <Icon className="h-6 w-6 text-mechanic-500" strokeWidth={1.8} />
              </div>
            )}

            <h3 className="font-display text-lg font-bold text-slate-800 transition-colors duration-200 group-hover:text-mechanic-500">
              {label}
            </h3>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-500">
              {desc}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
