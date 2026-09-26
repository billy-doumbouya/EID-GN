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
import { LogoutButton } from "@/components/LogoutButton";

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
      <aside className="fixed left-0 top-[64px] hidden h-[calc(100vh-64px)] w-64 flex-col border-r border-emerald-500/10 bg-black/50 backdrop-blur-xl p-4 lg:flex z-30">
        <div className="mb-6 px-2 font-display text-lg tracking-wide text-zinc-300">
          EID-GN <span className="text-emerald-400 font-semibold">Admin</span>
        </div>
        <nav className="flex flex-col gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-none px-3 py-2.5 text-sm transition-all border-l-2 ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-400 shadow-[inset_2px_0_10px_rgba(16,185,129,0.1)]"
                    : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
              >
                <Icon size={18} className={active ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* mt-auto : pousse la deconnexion en bas de la sidebar */}
        <div className="mt-auto border-t border-white/5 pt-3">
          <LogoutButton variant="sidebar" />
        </div>
      </aside>

      {/* Mobile : bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around overflow-x-auto border-t border-emerald-500/20 bg-black/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)] pt-2 lg:hidden">
        {LINKS.map(({ href, shortLabel, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 flex-col items-center gap-1 px-2 pb-1 text-[11px] ${
                active ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-zinc-500"
              }`}
            >
              <Icon size={20} />
              {shortLabel}
            </Link>
          );
        })}
        <LogoutButton variant="mobile" />
      </nav>
    </>
  );
}
