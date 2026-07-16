// src/components/AdminSidebar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Send,
  Settings,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Vue d'ensemble", shortLabel: "Accueil", icon: LayoutDashboard },
  { href: "/admin/produits", label: "Produits", shortLabel: "Produits", icon: Package },
  { href: "/admin/commandes", label: "Commandes", shortLabel: "Commandes", icon: ShoppingBag },
  { href: "/admin/clients", label: "Clients", shortLabel: "Clients", icon: Users },
  { href: "/admin/promotions", label: "Promotions", shortLabel: "Promos", icon: Tag },
  { href: "/admin/diffusion", label: "Diffusion", shortLabel: "Diffusion", icon: Send },
  { href: "/admin/parametres", label: "Parametres", shortLabel: "Reglages", icon: Settings },
];

function isActive(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop : sidebar fixe */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-navy-800/10 bg-navy-900 p-4 lg:flex">
        <div className="mb-6 px-2 font-display text-lg font-semibold text-white">
          EID-GN <span className="text-mechanic-400">Admin</span>
        </div>
        <nav className="flex flex-col gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-mechanic-500 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile : bottom navigation, plus naturel au pouce */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around overflow-x-auto border-t border-navy-800/10 bg-white pb-[env(safe-area-inset-bottom)] pt-2 lg:hidden">
        {LINKS.map(({ href, shortLabel, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 flex-col items-center gap-1 px-2 pb-1 text-[11px] ${
                active ? "text-mechanic-500" : "text-navy-800/60"
              }`}
            >
              <Icon size={20} />
              {shortLabel}
            </Link>
          );
        })}
      </nav>
    </>
  );
}