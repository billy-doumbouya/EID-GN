// components/TrustBadge.jsx
"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Clock, CheckCircle } from "lucide-react";

const items = [
  {
    icon: Shield,
    label: "Paiement sécurisé",
    desc: "Orange Money & MTN via LengoPay/Djomy",
  },
  {
    icon: Clock,
    label: "Livraison rapide",
    desc: "24 à 48h sur Kankan",
  },
  {
    icon: CheckCircle,
    label: "Compatibilité vérifiée",
    desc: "Pièces filtrées par modèle exact",
  },
];

export function TrustBadge() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-navy-900 py-12 text-white"
    >
      {/* Fond avec particules */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-mechanic-500/5 to-amber-500/5" />
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/5"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 4,
          }}
        />
      ))}

      <div className="relative mx-auto grid max-w-7xl gap-8 px-6 text-center sm:grid-cols-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="mb-3 rounded-full bg-white/10 p-4 backdrop-blur-sm"
              >
                <Icon className="h-8 w-8 text-mechanic-400" />
              </motion.div>
              <p className="font-display text-lg font-semibold text-mechanic-400">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-white/60">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
