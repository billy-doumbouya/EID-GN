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
  { href: "/pieces", label: "Pieces detachees" },
  { href: "/promotions", label: "Promotions" },
  { href: "/a-propos", label: "A propos" },
];

function isActivePath(pathname, href) {
  // exact match, ou sous-page (ex: /motos/125cc reste actif sur "Motos")
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

  // S'exécute uniquement côté client après la première hydratation
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
    <header className="sticky top-0 z-40 border-b border-navy-800/10 bg-offwhite-100/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="shrink-0 overflow-hidden rounded-full">
          <Image src="/logo.png" alt="EID-GN" width={32} height={32} />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3 py-1.5 text-sm font-medium rounded transition-all duration-300 ease-out bg-gradient-to-t from-mechanic-500/20 to-mechanic-500/20 bg-no-repeat bg-bottom hover:text-mechanic-600 ${
                  active
                    ? "text-mechanic-600 font-semibold [background-size:100%_100%]"
                    : "text-navy-800 [background-size:100%_0%] hover:[background-size:100%_100%]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden flex-1 max-w-xs md:flex">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-800/50"
            />
            <input
              type="search"
              placeholder="Rechercher une piece, une moto..."
              className="w-full rounded-full border border-navy-800/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus-visible:border-mechanic-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-full bg-navy-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-mechanic-500 md:flex"
            >
              <ShieldCheck size={14} /> Espace Admin
            </Link>
          )}
          {!isAdmin && (
            <Link
              href="/cart"
              className="relative rounded-full p-2 hover:bg-navy-800/5"
              aria-label="Panier"
            >
              <ShoppingCart size={22} className="text-navy-800" />
              {mounted && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-mechanic-500 text-[11px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
          <Link
            href="/compte"
            className="rounded-full p-2 hover:bg-navy-800/5"
            aria-label="Mon compte"
          >
            <User size={22} className="text-navy-800" />
          </Link>
          <button
            className="rounded-full p-2 hover:bg-navy-800/5 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-navy-800/10 bg-white px-4 py-3 lg:hidden">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-lg bg-navy-900 px-3 py-2 text-sm font-medium text-white"
              onClick={() => setMobileOpen(false)}
            >
              <ShieldCheck size={16} /> Espace Admin
            </Link>
          )}
          {!isAdmin && (
            <Link
              href="/cart"
              className="rounded-lg px-3 py-2 text-sm font-medium text-navy-800 hover:bg-offwhite-200"
              onClick={() => setMobileOpen(false)}
            >
              Panier
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
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-mechanic-500/20 text-mechanic-600 font-semibold"
                    : "text-navy-800 hover:bg-offwhite-200"
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
