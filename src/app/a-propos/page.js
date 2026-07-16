// src/app/(marketing)/about/page.js

import { Reveal } from "@/components/motion/Reveal";
import { GearPattern } from "@/components/stats/AboutStats/GearPattern";
import { StatCounter } from "@/components/stats/AboutStats/StatCounter";
import { ZigzagDivider } from "@/components/ZigzagDivider";
import { cn } from "@/lib/utiles";


export const metadata = { title: "A propos" };

const VALEURS = [
  {
    titre: "Compatibilite garantie",
    desc: "Chaque piece est verifiee et filtree par modele exact avant expedition. Fini les erreurs de reference.",
  },
  {
    titre: "Reactivite Kankan",
    desc: "Stock local, livraison rapide sur l'ensemble des quartiers couverts et les environs.",
  },
  {
    titre: "Paiement mobile money",
    desc: "Orange Money et MTN acceptes directement, sans intermediaire ni frais caches.",
  },
  {
    titre: "Service apres-vente",
    desc: "Une equipe technique disponible pour vous accompagner sur le choix des pieces.",
  },
];

const TIMELINE = [
  {
    annee: "2016",
    texte: "Ouverture du premier atelier de pieces detachees a Kankan.",
  },
  {
    annee: "2019",
    texte:
      "Extension de l'activite aux tricycles utilitaires pour les commercants locaux.",
  },
  {
    annee: "2022",
    texte: "Lancement de la vente de motos neuves et d'occasions verifiees.",
  },
  {
    annee: "2025",
    texte:
      "Digitalisation complete : catalogue en ligne, paiement mobile money, livraison trackee.",
  },
];

const ZONES = [
  "Kankan Centre",
  "Timbo",
  "Missira",
  "Sabalibougou",
  "Dougouba",
  "Bordeaux",
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 py-16 text-white md:py-24">
        <GearPattern className="absolute inset-0 text-white" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-wide text-mechanic-400">
              Depuis 2016 a Kankan
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight md:text-5xl">
              L'atelier qui a grandi{" "}
              <span className="text-mechanic-400">avec ses clients</span>
            </h1>
            <p className="mt-4 text-white/70">
              De la piece detachee filtree au modele pres, jusqu'a la moto
              livree chez vous : une histoire de confiance construite quartier
              par quartier a Kankan.
            </p>
          </Reveal>
        </div>

        {/* Stats */}
        <div className="relative mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
          <StatCounter value={9} suffix="+" label="Annees d'activite" />
          <StatCounter value={3200} suffix="+" label="Clients servis" />
          <StatCounter value={6} label="Quartiers livres" />
          <StatCounter value={48} suffix="h" label="Delai de livraison max" />
        </div>
      </section>

      <ZigzagDivider color="var(--color-offwhite-100)" />

      {/* Timeline */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <h2 className="text-center font-display text-2xl font-semibold text-navy-900 md:text-3xl">
            Notre parcours
          </h2>
        </Reveal>

        <div className="relative mt-10 space-y-8 border-l-2 border-mechanic-500/20 pl-6">
          {TIMELINE.map((item, i) => (
            <Reveal key={item.annee} delay={i * 0.08} className="relative">
              <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-mechanic-500 ring-4 ring-offwhite-100" />
              <p className="font-display text-sm font-semibold text-mechanic-500">
                {item.annee}
              </p>
              <p className="mt-1 text-sm text-navy-800/80 md:text-base">
                {item.texte}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <ZigzagDivider color="var(--color-navy-900)" flip />

      {/* Valeurs */}
      <section className="bg-navy-900 py-16 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <h2 className="text-center font-display text-2xl font-semibold md:text-3xl">
              Ce qui nous engage
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {VALEURS.map((v, i) => (
              <Reveal key={v.titre} delay={i * 0.06}>
                <div
                  className={cn(
                    "h-full rounded-xl border border-white/10 bg-white/5 p-5",
                    "transition-colors hover:border-mechanic-400/40 hover:bg-white/[0.07]",
                  )}
                >
                  <h3 className="font-display text-lg font-semibold text-mechanic-400">
                    {v.titre}
                  </h3>
                  <p className="mt-2 text-sm text-white/70">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ZigzagDivider color="var(--color-offwhite-100)" />

      {/* Zones de livraison */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <h2 className="text-center font-display text-2xl font-semibold text-navy-900 md:text-3xl">
            Zones de livraison couvertes
          </h2>
          <p className="mt-2 text-center text-sm text-navy-800/60">
            Livraison rapide sur les quartiers suivants a Kankan
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ZONES.map((zone, i) => (
            <Reveal key={zone} delay={i * 0.05}>
              <div className="rounded-lg border border-navy-800/10 bg-white px-4 py-3 text-center text-sm font-medium text-navy-900 shadow-sm">
                {zone}
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
