// src/components/homePage/TrustBadge.jsx
"use client";
import { motion } from "framer-motion";
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
  return (
    <section className="relative bg-navy-900 py-14 text-white">
      <div className="absolute inset-0 bg-grid-faint opacity-60" />
      <div className="relative mx-auto grid max-w-7xl gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 px-6 sm:grid-cols-3 sm:gap-px sm:px-0">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="flex flex-col items-start gap-3 bg-navy-900 px-6 py-8"
            >
              <Icon className="h-6 w-6 text-mechanic-400" strokeWidth={1.75} />
              <p className="font-display text-base font-semibold text-white">
                {item.label}
              </p>
              <p className="font-mono text-xs text-white/45">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}