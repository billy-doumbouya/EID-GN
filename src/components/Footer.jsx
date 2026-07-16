// src/components/Footer.jsx
import Link from "next/link";
import { ZigzagDivider } from "@/components/ZigzagDivider";

export function Footer() {
  return (
    <>
      <ZigzagDivider color="var(--color-navy-900)" />

      <footer className="bg-navy-900 text-offwhite-100">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              EID-GN
            </h3>
            <p className="mt-2 text-sm text-offwhite-100/70">
              Motos, tricycles et pieces detachees a Kankan. Qualite garantie,
              livraison rapide.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Catalogue</h4>
            <ul className="mt-3 space-y-2 text-sm text-offwhite-100/70">
              <li>
                <Link href="/motos" className="hover:text-mechanic-400">
                  Motos
                </Link>
              </li>
              <li>
                <Link href="/tricycles" className="hover:text-mechanic-400">
                  Tricycles
                </Link>
              </li>
              <li>
                <Link href="/pieces" className="hover:text-mechanic-400">
                  Pieces detachees
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Informations</h4>
            <ul className="mt-3 space-y-2 text-sm text-offwhite-100/70">
              <li>
                <Link
                  href="/mentions-legales"
                  className="hover:text-mechanic-400"
                >
                  Mentions legales
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="hover:text-mechanic-400"
                >
                  Confidentialite
                </Link>
              </li>
              <li>
                <Link href="/retours" className="hover:text-mechanic-400">
                  Retours &amp; garantie
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Paiement</h4>
            <p className="mt-3 text-sm text-offwhite-100/70">
              Orange Money, MTN Mobile Money via LengoPay et Djomy.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-offwhite-100/50">
          © {new Date().getFullYear()} EID-GN Kankan. Tous droits reserves.
        </div>
      </footer>
    </>
  );
}
