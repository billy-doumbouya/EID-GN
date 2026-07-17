// src/components/homePage/CategoryCard.jsx
"use client";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Bike, Truck, Wrench, ArrowUpRight } from "lucide-react";

const iconMap = { Bike, Truck, Wrench };

export function CategoryCard({ href, label, desc, icon, code, delay = 0 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);
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
      style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
    >
      <Link href={href} className="group block h-full">
        <div className="relative h-full overflow-hidden rounded-xl border border-navy-800/10 bg-white p-6 transition-shadow duration-300 hover:shadow-lg hover:shadow-navy-900/5">
          {/* Coins de reperage, style plan technique */}
          <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-navy-800/15" />
          <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-navy-800/15" />

          <div className="flex items-start justify-between">
            <span className="font-mono text-[11px] tracking-widest text-navy-800/35">
              {code}
            </span>
            <ArrowUpRight className="h-4 w-4 text-navy-800/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-mechanic-500" />
          </div>

          {Icon && (
            <Icon className="mt-6 h-7 w-7 text-mechanic-500" strokeWidth={1.75} />
          )}

          <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">
            {label}
          </h3>
          <p className="mt-1 text-sm text-navy-800/55">{desc}</p>
        </div>
      </Link>
    </motion.div>
  );
}