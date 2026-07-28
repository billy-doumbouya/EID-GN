// src/components/Footer.jsx
"use client";

import Link from "next/link";
import { ArrowUp, Phone, Mail, MapPin, Wrench } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#e6eef8] text-slate-600 transition-all">
      {/* Ligne de démarcation neumorphique douce */}
      <div className="w-full h-1 bg-[#e6eef8] shadow-[0_-4px_10px_#c3cad3,0_-2px_6px_#ffffff]" />

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        {/* GRILLE PRINCIPALE */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* CARTE MARQUE / À PROPOS */}
          <div className="rounded-2xl bg-[#e6eef8] p-6 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff] space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6eef8] text-mechanic-500 shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff]">
                <Wrench size={20} />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-800">
                EID-GN
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Motos, tricycles et pièces détachées à Kankan. Qualité garantie,
              livraison rapide.
            </p>
            <div className="pt-2 text-xs text-slate-500 space-y-1 font-medium">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-mechanic-500" />
                <span>Kankan, Guinée</span>
              </div>
            </div>
          </div>

          {/* CATALOGUE */}
          <div className="rounded-2xl bg-[#e6eef8] p-6 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Catalogue
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600">
              <li>
                <Link
                  href="/motos"
                  className="hover:text-mechanic-500 transition-colors"
                >
                  Motos
                </Link>
              </li>
              <li>
                <Link
                  href="/tricycles"
                  className="hover:text-mechanic-500 transition-colors"
                >
                  Tricycles
                </Link>
              </li>
              <li>
                <Link
                  href="/pieces"
                  className="hover:text-mechanic-500 transition-colors"
                >
                  Pièces détachées
                </Link>
              </li>
            </ul>
          </div>

          {/* INFORMATIONS */}
          <div className="rounded-2xl bg-[#e6eef8] p-6 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Informations
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600">
              <li>
                <Link
                  href="/mentions-legales"
                  className="hover:text-mechanic-500 transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="hover:text-mechanic-500 transition-colors"
                >
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/retours"
                  className="hover:text-mechanic-500 transition-colors"
                >
                  Retours &amp; garantie
                </Link>
              </li>
            </ul>
          </div>

          {/* PAIEMENT & SÉCURITÉ */}
          <div className="rounded-2xl bg-[#e6eef8] p-6 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Paiement
            </h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Paiement sécurisé via Orange Money, MTN Mobile Money (LengoPay
              &amp; Djomy).
            </p>
            {/* BADGE DE CONFIANCE ENFONCÉ */}
            <div className="mt-3 rounded-xl bg-[#e6eef8] p-2.5 text-[11px] font-semibold text-slate-600 text-center shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
              🔒 Transactions 100% Sécurisées
            </div>
          </div>
        </div>

        {/* PIED DU FOOTER */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-300/50 pt-8 sm:flex-row text-xs font-medium text-slate-500">
          <p>
            © {new Date().getFullYear()} EID-GN Kankan. Tous droits réservés.
          </p>

          {/* BOUTON RETOUR EN HAUT NEUMORPHIQUE */}
          <button
            onClick={scrollToTop}
            aria-label="Retour en haut de page"
            className="flex items-center gap-2 rounded-xl bg-[#e6eef8] px-4 py-2.5 text-xs font-bold text-slate-700 transition-all duration-200 shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] hover:text-mechanic-500 hover:shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_5px_#c3cad3,inset_-2px_-2px_5px_#ffffff]"
          >
            <span>Haut de page</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
