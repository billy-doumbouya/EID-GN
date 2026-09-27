"use client";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";
import { Shield, Clock, CheckCircle, Truck, Headset, Tag } from "lucide-react";

// Items par défaut (peuvent être surchargés via prop)
const DEFAULT_ITEMS = [
  {
    icon: Shield,
    label: "Paiement sécurisé",
    desc: "Orange Money & MTN MoMo via LengoPay/Djomy. Vérification serveur obligatoire.",
    href: "/paiement",
  },
  {
    icon: Truck,
    label: "Livraison rapide",
    desc: "24-48h sur Kankan, 48-72h pour les autres régions de Guinée.",
    href: "/livraison",
  },
  {
    icon: CheckCircle,
    label: "Compatibilité vérifiée",
    desc: "Pièces filtrées par modèle exact. Fini les erreurs de référence.",
    href: "/catalogue",
  },
];

/**
 * Bandeau de réassurance avec 3 trust badges.
 *
 * @param {Array} items - Items personnalisés (override DEFAULT_ITEMS)
 * @param {('default'|'compact')} variant - Densité d'affichage
 * @param {boolean} withCta - Afficher les liens cliquables
 */
export function TrustBadge({
  items = DEFAULT_ITEMS,
  variant = "default",
  withCta = true,
}) {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-navy-950 py-16 text-white md:py-20">
      {/* Halo mechanic subtil */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-75 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mechanic-500/3 blur-[100px]"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-mechanic-400">
              <span className="h-1 w-1 rounded-full bg-mechanic-500" />
              Pourquoi nous faire confiance
            </span>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, i) => {
            const Icon = item.icon;
            const content = (
              <>
                {/* Icon container avec halo glow au hover */}
                <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-mechanic-500/10 border border-mechanic-500/20 text-mechanic-400 transition-all duration-300 group-hover:bg-mechanic-500 group-hover:text-white group-hover:border-mechanic-500">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>

                <div className="mt-5">
                  <h4 className="font-display text-base font-semibold text-white">
                    {item.label}
                  </h4>
                  <p
                    className={cn(
                      "mt-2 leading-relaxed text-offwhite-100/80",
                      variant === "compact" ? "text-xs" : "text-sm"
                    )}
                  >
                    {item.desc}
                  </p>
                </div>

                {/* CTA qui apparaît au hover */}
                {withCta && item.href && (
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-mechanic-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    En savoir plus
                    <svg
                      className="h-3 w-3 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                )}
              </>
            );

            return (
              <Reveal key={item.label} delay={i * 0.1}>
                {withCta && item.href ? (
                  <a
                    href={item.href}
                    className="group relative block h-full rounded-2xl border border-white/15 bg-navy-900/95 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-mechanic-500/40 hover:bg-navy-800"
                    aria-label={`${item.label} — en savoir plus`}
                  >
                    {content}
                  </a>
                ) : (
                  <div className="group relative h-full rounded-2xl border border-white/15 bg-navy-900/95 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-mechanic-500/40 hover:bg-navy-800">
                    {content}
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}