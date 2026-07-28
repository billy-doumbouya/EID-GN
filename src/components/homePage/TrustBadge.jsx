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
    <section className="relative bg-[#e6eef8] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                className="flex flex-col items-start gap-3.5 rounded-3xl bg-[#e6eef8] p-6 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff] transition-all hover:shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff]"
              >
                {/* BADGE D'ICÔNE EN FONCED (INSET) */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6eef8] shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
                  <Icon
                    className="h-6 w-6 text-mechanic-500"
                    strokeWidth={1.8}
                  />
                </div>

                {/* TEXTES */}
                <div>
                  <h4 className="font-display text-base font-bold text-slate-800">
                    {item.label}
                  </h4>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
