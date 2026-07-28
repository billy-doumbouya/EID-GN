"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingCart, User, Menu, X, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

const NAV_LINKS = [
  { href: "/motos", label: "Motos" },
  { href: "/tricycles", label: "Tricycles" },
  { href: "/pieces", label: "Pièces détachées" },
  { href: "/promotions", label: "Promotions" },
  { href: "/a-propos", label: "À propos" },
];

function isActivePath(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

async function fetchCurrentUser() {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return { user: null };
  return res.json();
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = useCartStore((s) => s.itemCount());
  const { data } = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 0,
  });
  const isAdmin = data?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 bg-[#e6eef8] transition-all shadow-[0_10px_20px_#c3cad3,0_5px_10px_#ffffff]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* LOGO EN RELIEF */}
        <Link
          href="/"
          className="shrink-0 overflow-hidden rounded-full p-1 bg-[#e6eef8] shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] transition-all active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]"
        >
          <Image
            src="/logo.png"
            alt="EID-GN"
            width={32}
            height={32}
            className="rounded-full"
          />
        </Link>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden items-center gap-2 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-[#e6eef8] text-mechanic-500 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]"
                    : "text-slate-600 hover:text-mechanic-500 hover:shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* BARRE DE RECHERCHE NEUMORPHIQUE ENFONCÉE */}
        <div className="hidden flex-1 max-w-xs md:flex">
          <div className="relative w-full flex items-center">
            <Search size={16} className="absolute left-3.5 text-slate-400" />
            <input
              type="search"
              placeholder="Rechercher une pièce, une moto..."
              className="w-full rounded-xl bg-[#e6eef8] py-2 pl-10 pr-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_4px_4px_8px_#bdc4ce,inset_-4px_-4px_8px_#ffffff]"
            />
          </div>
        </div>

        {/* ACTIONS & ICONES */}
        <div className="flex items-center gap-3">
          {/* ESPACE ADMIN */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-xl bg-[#e6eef8] px-3.5 py-2 text-xs font-bold text-mechanic-500 shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff] md:flex transition-all"
            >
              <ShieldCheck size={16} /> Admin
            </Link>
          )}

          {/* PANIER */}
          {!isAdmin && (
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6eef8] text-slate-700 transition-all shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] hover:text-mechanic-500 hover:shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]"
              aria-label="Panier"
            >
              <ShoppingCart size={18} />
              {mounted && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-mechanic-500 text-[10px] font-bold text-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {/* COMPTE */}
          <Link
            href="/compte"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6eef8] text-slate-700 transition-all shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] hover:text-mechanic-500 hover:shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]"
            aria-label="Mon compte"
          >
            <User size={18} />
          </Link>

          {/* BOUTON MENU MOBILE */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6eef8] text-slate-700 transition-all shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] hover:text-mechanic-500 active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff] lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* NAVIGATION MOBILE */}
      {mobileOpen && (
        <nav className="flex flex-col gap-2 bg-[#e6eef8] px-6 py-4 border-t border-slate-300/40 lg:hidden shadow-[inset_0_4px_6px_#c3cad3]">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-xl bg-[#e6eef8] px-4 py-3 text-xs font-bold text-mechanic-500 shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff]"
              onClick={() => setMobileOpen(false)}
            >
              <ShieldCheck size={16} /> Espace Admin
            </Link>
          )}
          {!isAdmin && (
            <Link
              href="/cart"
              className="flex items-center justify-between rounded-xl bg-[#e6eef8] px-4 py-3 text-xs font-bold text-slate-700 shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff]"
              onClick={() => setMobileOpen(false)}
            >
              <span>Mon Panier</span>
              {itemCount > 0 && (
                <span className="rounded-full bg-mechanic-500 px-2 py-0.5 text-[10px] text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  active
                    ? "bg-[#e6eef8] text-mechanic-500 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]"
                    : "text-slate-600 hover:text-mechanic-500"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
