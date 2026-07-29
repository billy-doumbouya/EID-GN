// src/components/Footer.jsx
"use client";

import Link from "next/link";
import { ArrowUp, Phone, Mail, MapPin, Wrench, ShieldCheck } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#e6eef8] text-slate-600 transition-all">
      {/* Ligne de démarcation neumorphique douce */}
      <div className="h-1 w-full bg-[#e6eef8] shadow-[0_-4px_10px_#c3cad3,0_-2px_6px_#ffffff]" />

      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16">
        {/* GRILLE PRINCIPALE */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* CARTE MARQUE / À PROPOS */}
          <div className="space-y-4 rounded-2xl bg-[#e6eef8] p-6 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6eef8] text-mechanic-500 shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff]">
                <Wrench size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-800">
                  EID-GN
                </h3>
                <p className="font-mono text-[10px] font-semibold text-slate-500">
                  ETS-EIDF
                </p>
              </div>
            </div>

            <p className="text-xs font-medium leading-relaxed text-slate-500">
              Vente de motos, tricycles, pièces détachées et huiles moteur à Kankan et livraison dans toute la Guinée.
            </p>

            {/* RCCM ENCASTRE */}
            <div className="rounded-xl bg-[#e6eef8] px-3 py-2 text-[11px] font-mono font-bold text-slate-600 shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
              RCCM: GN.TCC.2026.A.06542
            </div>
          </div>

          {/* CATALOGUE & NAVIGATION */}
          <div className="space-y-3 rounded-2xl bg-[#e6eef8] p-6 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Catalogue & Offres
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600">
              <li>
                <Link
                  href="/motos"
                  className="transition-colors hover:text-mechanic-500"
                >
                  Motos neuves & d'occasion
                </Link>
              </li>
              <li>
                <Link
                  href="/tricycles"
                  className="transition-colors hover:text-mechanic-500"
                >
                  Tricycles utilitaires
                </Link>
              </li>
              <li>
                <Link
                  href="/pieces"
                  className="transition-colors hover:text-mechanic-500"
                >
                  Pièces détachées
                </Link>
              </li>
              <li>
                <Link
                  href="/a-propos"
                  className="transition-colors hover:text-mechanic-500"
                >
                  À propos d'ETS-EIDF
                </Link>
              </li>
            </ul>
          </div>

          {/* COORDONNÉES ET CONTACT BOUTIQUE */}
          <div className="space-y-3 rounded-2xl bg-[#e6eef8] p-6 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Contact Boutique
            </h4>
            <ul className="space-y-3 text-xs font-medium text-slate-600">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-mechanic-500" />
                <span>Korialen, Commune de Kankan, Guinée</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="shrink-0 text-mechanic-500" />
                <a
                  href="tel:+224624151415"
                  className="font-mono font-bold text-slate-800 transition-colors hover:text-mechanic-500"
                >
                  +224 624 15 14 15
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="shrink-0 text-mechanic-500" />
                <a
                  href="mailto:moussadoumbouya952@gmail.com"
                  className="truncate font-mono transition-colors hover:text-mechanic-500"
                >
                  moussadoumbouya952@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* INFORMATIONS LÉGALES & PAIEMENT */}
          <div className="space-y-3 rounded-2xl bg-[#e6eef8] p-6 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Confiance & Légal
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <Link
                  href="/mentions-legales"
                  className="transition-colors hover:text-mechanic-500"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="transition-colors hover:text-mechanic-500"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/retours"
                  className="transition-colors hover:text-mechanic-500"
                >
                  Retours &amp; garantie
                </Link>
              </li>
            </ul>

            {/* BADGE PAIEMENT SÉCURISÉ */}
            <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#e6eef8] p-2.5 text-[11px] font-semibold text-slate-700 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Orange & MTN Mobile Money</span>
            </div>
          </div>

        </div>

        {/* PIED DU FOOTER */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-300/50 pt-8 sm:flex-row text-xs font-medium text-slate-500">
          <p>
            © {new Date().getFullYear()} ETS-EIDF (EID-GN Kankan). Tous droits réservés.
          </p>

          {/* BOUTON RETOUR EN HAUT NEUMORPHIQUE */}
          <button
            onClick={scrollToTop}
            aria-label="Retour en haut de page"
            className="flex items-center gap-2 rounded-xl bg-[#e6eef8] px-4 py-2.5 text-xs font-bold text-slate-700 shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] transition-all duration-200 hover:text-mechanic-500 hover:shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_5px_#c3cad3,inset_-2px_-2px_5px_#ffffff]"
          >
            <span>Haut de page</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}