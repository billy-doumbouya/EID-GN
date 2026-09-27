import { ShieldCheck, CheckCircle2, Clock, Store } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Paiement Mobile Money",
    desc: "Orange Money & MTN sécurisés via LengoPay & Djomy.",
  },
  {
    icon: CheckCircle2,
    title: "Compatibilité vérifiée",
    desc: "Pièces certifiées pour TVS, Boxer, CG125 & Haojue.",
  },
  {
    icon: Clock,
    title: "Livraison 24h à 48h",
    desc: "Kankan, Siguiri, Mandiana, Kouroussa et Haute-Guinée.",
  },
  {
    icon: Store,
    title: "Stock réel en magasin",
    desc: "Boutique physique ouverte à Korialen, Kankan.",
  },
];

export function TrustBar() {
  return (
    <section className="bg-navy-900 border-y border-white/5 py-8 md:py-10 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {TRUST_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-mechanic-500/30 transition-colors duration-200"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mechanic-500/10 border border-mechanic-500/20 text-mechanic-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-offwhite-100/70 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
