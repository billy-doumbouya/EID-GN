// src/components/Footer.jsx
"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="w-full border-t border-white/10 bg-navy-950 text-offwhite-100/80 shadow-[0_-8px_32px_rgba(16,22,31,0.4)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 md:py-4">
        {/* Ligne principale compacte et structurée */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 items-start text-xs">
          {/* COL 1: Marque & RCCM */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm tracking-tight text-white">
                EID<span className="text-mechanic-500">-</span>GN
              </span>
              <span className="rounded bg-navy-800 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-mechanic-400">
                ETS-EIDF
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-offwhite-100/60 leading-tight">
              Motos, tricycles &amp; pièces certifiées en Haute-Guinée.
            </p>
            <p className="font-mono text-[10px] text-offwhite-100/40">
              RCCM: GN.TCC.2026.A.06542
            </p>
          </div>

          {/* COL 2: Navigation rapide */}
          <div className="space-y-1">
            <span className="font-mono uppercase tracking-widest text-[10px] font-semibold text-offwhite-100/40 block">
              Catalogue
            </span>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
              <li>
                <Link
                  href="/catalogue?type=MOTO"
                  className="hover:text-mechanic-400 transition-colors"
                >
                  Motos
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?type=TRICYCLE"
                  className="hover:text-mechanic-400 transition-colors"
                >
                  Tricycles
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?type=PIECE"
                  className="hover:text-mechanic-400 transition-colors"
                >
                  Pièces
                </Link>
              </li>
              <li>
                <Link
                  href="/promotions"
                  className="text-mechanic-400 hover:underline"
                >
                  Promos
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 3: Contact Kankan direct */}
          <div className="space-y-1 hidden sm:block">
            <span className="font-mono uppercase tracking-widest text-[10px] font-semibold text-offwhite-100/40 block">
              Contact Boutique
            </span>
            <div className="space-y-0.5 text-[11px]">
              <a
                href="tel:+224624151415"
                className="flex items-center gap-1.5 font-mono font-semibold text-white hover:text-mechanic-400 transition-colors"
              >
                <Phone className="h-3 w-3 text-mechanic-400 shrink-0" />
                +224 624 15 14 15
              </a>
              <div className="flex items-center gap-1.5 text-offwhite-100/60 truncate">
                <MapPin className="h-3 w-3 text-mechanic-400 shrink-0" />
                <span className="truncate">Korialen, Kankan</span>
              </div>
            </div>
          </div>

          {/* COL 4: Paiement & Légal */}
          <div className="space-y-1 flex flex-col items-end sm:items-start text-right sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 border border-white/10 px-2 py-1 text-[10px] font-medium text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Orange Money &amp; MTN MoMo</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-offwhite-100/50">
              <Link href="/mentions-legales" className="hover:text-white transition-colors">
                Mentions
              </Link>
              <span>·</span>
              <Link href="/confidentialite" className="hover:text-white transition-colors">
                Confidentialité
              </Link>
              <span>·</span>
              <Link href="/retours" className="hover:text-white transition-colors">
                Garantie
              </Link>
            </div>
          </div>
        </div>

        {/* Ligne inférieure de signature */}
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-offwhite-100/40">
          <p>© {new Date().getFullYear()} EID-MULTISERVICE · Haute-Guinée</p>
          <a
            href="https://wa.me/224624151415"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Assistance WhatsApp
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}