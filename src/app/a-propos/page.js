// src/app/(marketing)/about/page.js

import Image from "next/image";
import { GuineaDeliveryMap } from "@/components/GuineaDeliveryMap";
import { Reveal } from "@/components/motion/Reveal";
import { StatCounter } from "@/components/stats/AboutStats/StatCounter";

export const metadata = { title: "À propos" };

const VALEURS = [
  {
    titre: "Compatibilité garantie",
    desc: "Chaque pièce est vérifiée et filtrée par modèle exact avant expédition. Fini les erreurs de référence.",
  },
  {
    titre: "Réseau national",
    desc: "Depuis notre centre de distribution à Kankan, nous livrons désormais les 8 régions du pays.",
  },
  {
    titre: "Service après-vente",
    desc: "Une équipe technique disponible pour vous accompagner sur le choix des pièces.",
  },
];

const TIMELINE = [
  {
    annee: "2016",
    texte: "Ouverture du premier atelier de pièces détachées à Kankan.",
  },
  {
    annee: "2019",
    texte:
      "Extension de l'activité aux tricycles utilitaires pour les commerçants locaux.",
  },
  {
    annee: "2022",
    texte: "Lancement de la vente de motos neuves et d'occasions vérifiées.",
  },
  {
    annee: "2025",
    texte:
      "Digitalisation complète : catalogue en ligne, paiement mobile money, livraison traquée.",
  },
  {
    annee: "2026",
    texte:
      "Extension de la livraison aux 8 régions de Guinée, depuis notre hub de Kankan.",
  },
];

const PAYMENT_METHODS = [
  { name: "Orange Money", src: "/payment-logo/orange.png" },
  { name: "MTN MoMo", src: "/payment-logo/mtn.png" },
  { name: "Moov Money", src: "/payment-logo/moov.png" },
  { name: "Visa", src: "/payment-logo/visa.png" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#e6eef8] py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <span className="inline-block rounded-full bg-[#e6eef8] px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-mechanic-500 shadow-[inset_2px_2px_5px_#c3cad3,inset_-2px_-2px_5px_#ffffff]">
              Depuis 2016 à Kankan
            </span>
            <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight text-slate-800 md:text-5xl">
              De l'atelier de Kankan{" "}
              <span className="text-mechanic-500">à tout le pays</span>
            </h1>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600 md:text-base">
              Une histoire de confiance née quartier par quartier à Kankan, qui
              livre aujourd'hui l'ensemble des régions de Guinée.
            </p>
          </Reveal>
        </div>

        {/* Stats Soft UI */}
        <div className="relative mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
          <div className="rounded-2xl bg-[#e6eef8] p-5 text-center shadow-[6px_6px_14px_#c3cad3,-6px_-6px_14px_#ffffff]">
            <StatCounter value={9} suffix="+" label="Années d'activité" />
          </div>
          <div className="rounded-2xl bg-[#e6eef8] p-5 text-center shadow-[6px_6px_14px_#c3cad3,-6px_-6px_14px_#ffffff]">
            <StatCounter value={3200} suffix="+" label="Clients servis" />
          </div>
          <div className="rounded-2xl bg-[#e6eef8] p-5 text-center shadow-[6px_6px_14px_#c3cad3,-6px_-6px_14px_#ffffff]">
            <StatCounter value={8} label="Régions couvertes" />
          </div>
          <div className="rounded-2xl bg-[#e6eef8] p-5 text-center shadow-[6px_6px_14px_#c3cad3,-6px_-6px_14px_#ffffff]">
            <StatCounter value={48} suffix="h" label="Délai max" />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-3xl bg-[#e6eef8] p-8 shadow-[10px_10px_20px_#c3cad3,-10px_-10px_20px_#ffffff] md:p-12">
          <Reveal>
            <h2 className="text-center font-display text-2xl font-bold text-slate-800 md:text-3xl">
              Notre parcours
            </h2>
          </Reveal>

          <div className="relative mt-10 space-y-8 border-l-2 border-slate-300/60 pl-6 md:pl-8">
            {TIMELINE.map((item, i) => (
              <Reveal key={item.annee} delay={i * 0.08} className="relative">
                {/* Puce Soft UI */}
                <span className="absolute -left-[31px] md:-left-[39px] flex h-5 w-5 items-center justify-center rounded-full bg-[#e6eef8] shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff]">
                  <span className="h-2.5 w-2.5 rounded-full bg-mechanic-500" />
                </span>
                <span className="inline-block rounded-lg bg-[#e6eef8] px-2.5 py-0.5 font-mono text-xs font-bold text-mechanic-500 shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
                  {item.annee}
                </span>
                <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600 md:text-sm">
                  {item.texte}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Valeurs Section */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <Reveal>
          <h2 className="text-center font-display text-2xl font-bold text-slate-800 md:text-3xl">
            Ce qui nous engage
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {VALEURS.map((v, i) => (
            <Reveal key={v.titre} delay={i * 0.06}>
              <div className="h-full rounded-2xl bg-[#e6eef8] p-6 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff] transition-transform duration-300 hover:-translate-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6eef8] shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
                  <span className="h-2.5 w-2.5 rounded-full bg-mechanic-500" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-slate-800">
                  {v.titre}
                </h3>
                <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
                  {v.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Carte de livraison nationale */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-3xl bg-[#e6eef8] p-8 shadow-[10px_10px_20px_#c3cad3,-10px_-10px_20px_#ffffff]">
          <Reveal>
            <h2 className="text-center font-display text-2xl font-bold text-slate-800 md:text-3xl">
              Un réseau qui couvre tout le pays
            </h2>
            <p className="mt-2 text-center text-xs font-medium text-slate-500">
              Depuis notre centre de distribution à Kankan, vers chaque région
              de Guinée
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 rounded-2xl bg-[#e6eef8] p-4 shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff]">
              <GuineaDeliveryMap />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Moyens de paiement */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-3xl bg-[#e6eef8] p-8 text-center shadow-[10px_10px_20px_#c3cad3,-10px_-10px_20px_#ffffff]">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-slate-800 md:text-3xl">
              Payez en toute confiance
            </h2>
            <p className="mt-2 text-xs font-medium text-slate-500">
              Mobile Money et carte bancaire, sans intermédiaire ni frais cachés
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.name}
                  className="flex h-20 items-center justify-center rounded-2xl bg-[#e6eef8] p-4 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]"
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={method.src}
                      alt={method.name}
                      fill
                      className="object-contain"
                      sizes="120px"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
