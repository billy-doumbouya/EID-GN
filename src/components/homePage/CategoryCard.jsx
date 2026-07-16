// components/CategoryCard.jsx
"use client";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Bike, Truck, Wrench } from "lucide-react";

const iconMap = { Bike, Truck, Wrench };

export function CategoryCard({ href, label, desc, icon, delay = 0 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);
  const springRotateX = useSpring(rotateX, { damping: 20, stiffness: 300 });
  const springRotateY = useSpring(rotateY, { damping: 20, stiffness: 300 });
  const scale = useSpring(1, { damping: 20, stiffness: 300 });

  const Icon = iconMap[icon];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        scale,
        transformStyle: "preserve-3d",
      }}
      className="relative"
    >
      <Link href={href} className="block h-full">
        <div className="relative h-full rounded-xl border border-navy-800/10 bg-white p-6 transition-shadow hover:shadow-xl hover:shadow-mechanic-500/10">
          {/* Effet de lumière au survol */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-mechanic-500/0 via-mechanic-500/10 to-transparent"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <div className="relative z-10">
            {Icon && <Icon className="h-8 w-8 text-mechanic-500" />}
            <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">
              {label}
            </h3>
            <p className="mt-1 text-sm text-navy-800/60">{desc}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
