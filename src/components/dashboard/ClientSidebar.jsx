"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Truck, Receipt, Heart, User } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

const TABS = [
  { href: "/compte", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/compte/commandes", label: "Mes commandes", icon: Package },
  { href: "/compte/suivi", label: "Suivi livraison", icon: Truck },
  { href: "/compte/recus", label: "Mes recus", icon: Receipt },
  { href: "/compte/favoris", label: "Favoris", icon: Heart },
  { href: "/compte/profil", label: "Mon profil", icon: User },
];

function isActive(pathname, href) {
  return href === "/compte" ? pathname === "/compte" : pathname.startsWith(href);
}

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop : sidebar verticale fixe */}
      <aside className="fixed left-0 top-[64px] hidden h-[calc(100vh-64px)] w-56 flex-col border-r border-navy-800/10 bg-white pt-6 lg:flex z-30">
        <nav className="flex flex-col gap-1 px-3">
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-mechanic-500/10 text-mechanic-500"
                    : "text-navy-800/70 hover:bg-offwhite-200 hover:text-navy-900"
                }`}
              >
                <tab.icon size={17} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto border-t border-navy-800/5 p-3">
          <LogoutButton variant="client-sidebar" />
        </div>
      </aside>

      {/* Mobile : barre de navigation fixee en bas */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-navy-800/10 bg-white py-1.5 lg:hidden">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors ${
                active ? "text-mechanic-500" : "text-navy-800/50"
              }`}
            >
              <tab.icon size={19} />
              {tab.label.split(" ")[0]}
            </Link>
          );
        })}
        <LogoutButton variant="mobile" />
      </nav>
    </>
  );
}
