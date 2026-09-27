import Link from "next/link";
import { Bike, Truck, Wrench, ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  {
    href: "/catalogue?type=MOTO",
    code: "CAT.01",
    label: "Motos & Cylindrées",
    desc: "Motos neuves et occasions certifiées. Marques TVS, Sanya, Haojue & Boxer.",
    icon: Bike,
    countBadge: "Arrivages réguliers",
  },
  {
    href: "/catalogue?type=TRICYCLE",
    code: "CAT.02",
    label: "Tricycles Utilitaires",
    desc: "Spécial transport lourd de marchandises et agricole. Châssis et suspensions renforcés.",
    icon: Truck,
    countBadge: "Haute capacité",
  },
  {
    href: "/catalogue?type=PIECE",
    code: "CAT.03",
    label: "Pièces Détachées",
    desc: "Carburateurs, pistons, kits chaîne, freins et consommables d'origine avec garantie.",
    icon: Wrench,
    countBadge: "Compatible 100%",
  },
];

export function CategoryGrid() {
  return (
    <section className="py-16 md:py-20 bg-offwhite-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* En-tête de section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-mechanic-500">
              Explorer par type de véhicule
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight mt-1">
              Catégories Principales
            </h2>
          </div>
          <Link
            href="/catalogue"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-mechanic-500 transition-colors"
          >
            <span>Voir tout le catalogue</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Grille des 3 cartes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.code}
                href={cat.href}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-7 sm:p-8 border border-navy-900/5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5"
              >
                <div>
                  {/* Top bar avec code et action */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="rounded-lg bg-navy-950/5 px-2.5 py-1 font-mono text-xs font-bold text-navy-800 tracking-wider">
                      {cat.code}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-950/5 text-navy-700 transition-all duration-200 group-hover:bg-mechanic-500 group-hover:text-white">
                      <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  {/* Icône & Titres */}
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-mechanic-500/10 text-mechanic-500 transition-colors group-hover:bg-mechanic-500 group-hover:text-white">
                    <Icon className="h-7 w-7" strokeWidth={1.8} />
                  </div>

                  <h3 className="font-display text-xl font-bold text-navy-900 tracking-tight transition-colors group-hover:text-mechanic-500">
                    {cat.label}
                  </h3>

                  <p className="mt-2 text-sm text-navy-800/70 leading-relaxed font-normal">
                    {cat.desc}
                  </p>
                </div>

                {/* Badge d'indication en bas de carte */}
                <div className="mt-8 pt-4 border-t border-navy-900/5 flex items-center justify-between text-xs font-medium text-navy-800/60">
                  <span>{cat.countBadge}</span>
                  <span className="text-mechanic-500 font-semibold group-hover:underline">
                    Découvrir &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CategoryGridSkeleton() {
  return (
    <section className="py-16 md:py-20 bg-offwhite-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="h-6 w-48 bg-navy-900/10 rounded animate-pulse mb-3" />
        <div className="h-10 w-80 bg-navy-900/10 rounded animate-pulse mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-8 border border-navy-900/5 shadow-card"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="h-6 w-16 bg-navy-900/10 rounded animate-pulse" />
                <div className="h-10 w-10 bg-navy-900/10 rounded-xl animate-pulse" />
              </div>
              <div className="h-14 w-14 rounded-2xl bg-navy-900/10 animate-pulse mb-6" />
              <div className="h-6 w-3/4 bg-navy-900/10 rounded animate-pulse mb-3" />
              <div className="h-12 w-full bg-navy-900/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
