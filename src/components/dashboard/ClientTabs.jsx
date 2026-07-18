"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Truck,
  Receipt,
  Heart,
  User,
} from "lucide-react";

const TABS = [
  { href: "/compte", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/compte/commandes", label: "Mes commandes", icon: Package },
  { href: "/compte/suivi", label: "Suivi livraison", icon: Truck },
  { href: "/compte/recus", label: "Mes recus", icon: Receipt },
  { href: "/compte/favoris", label: "Favoris", icon: Heart },
  { href: "/compte/profil", label: "Mon profil", icon: User },
];

export function ClientTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-navy-800/10 pb-px">
      {TABS.map((tab) => {
        // "/compte" est la racine : match exact uniquement, sinon elle
        // resterait active sur toutes les sous-pages (elle est prefixe de
        // toutes). Les autres onglets matchent leur sous-arbre.
        const active =
          tab.href === "/compte"
            ? pathname === "/compte"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-mechanic-500 text-mechanic-500"
                : "border-transparent text-navy-800/60 hover:text-navy-900"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
