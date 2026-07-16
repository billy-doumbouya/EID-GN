"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/compte", label: "Mes commandes" },
  { href: "/compte/suivi", label: "Suivi livraison" },
  { href: "/compte/recus", label: "Mes recus" },
  { href: "/compte/favoris", label: "Favoris" },
  { href: "/compte/profil", label: "Mon profil" },
];

export function ClientTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-navy-800/10 pb-px">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-mechanic-500 text-mechanic-500"
                : "border-transparent text-navy-800/60 hover:text-navy-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
