"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { AdminUserMenu } from "@/components/admin/AdminUserMenu";
import { AdminNotificationBell } from "@/components/admin/AdminNotificationBell";
import { SearchCombobox } from "./SearchCombobox";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { href: "/motos", label: "Motos" },
  { href: "/tricycles", label: "Tricycles" },
  { href: "/pieces", label: "Pièces" },
  { href: "/promotions", label: "Promotions" },
  { href: "/a-propos", label: "À propos" },
];

function isActivePath(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

async function fetchCurrentUser() {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return { user: null };
  return res.json();
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  // Hydration safe
  useEffect(() => setMounted(true), []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Escape to close mobile menu
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  // Cart count (hydration-safe)
  const itemCount = useCartStore((s) =>
    typeof s.itemCount === "function"
      ? s.itemCount()
      : s.items?.reduce((sum, i) => sum + i.quantity, 0) || 0
  );

  // Current user (cached 1 min)
  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
    retry: 1,
  });
  const isAdmin = userData?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 bg-navy-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between gap-3 md:gap-6 px-4 md:px-6">
        {/* ============================================================
            LOGO
            ============================================================ */}
        <Link
          href="/"
          aria-label="EID-MULTISERVICE accueil"
          aria-current={pathname === "/" ? "page" : undefined}
          className="shrink-0 flex items-center gap-2.5 group"
        >
          <div className="relative h-9 w-9 md:h-10 md:w-10 overflow-hidden rounded-xl bg-mechanic-500/10 border border-mechanic-500/20 flex items-center justify-center transition-all group-hover:bg-mechanic-500/20 group-hover:border-mechanic-500/40">
            <Image
              src="/logo.png"
              alt=""
              fill
              sizes="40px"
              className="object-cover p-1.5"
              priority
            />
          </div>
          <span className="hidden sm:block font-display text-lg md:text-xl font-bold tracking-tight text-white">
            EID<span className="text-mechanic-500">-</span>GN
          </span>
        </Link>

        {/* ============================================================
            NAVIGATION DESKTOP
            ============================================================ */}
        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "text-mechanic-400"
                    : "text-offwhite-100/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-px h-0.5 bg-mechanic-500 rounded-full"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 30 }
                    }
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ============================================================
            RECHERCHE (DESKTOP)
            ============================================================ */}
        <div className="hidden md:block flex-1 max-w-sm">
          <SearchCombobox />
        </div>

        {/* ============================================================
            ACTIONS
            ============================================================ */}
        <div className="flex items-center gap-1.5">
          {isAdmin && <AdminNotificationBell />}

          {isAdmin && <AdminUserMenu user={userData?.user} />}

          {/* Cart */}
          <Link
            href="/panier"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-offwhite-100/80 transition-all hover:bg-white/10 hover:text-mechanic-400 hover:border-mechanic-500/30"
            aria-label={`Panier${mounted && itemCount > 0 ? `, ${itemCount} article${itemCount > 1 ? "s" : ""}` : ""}`}
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {mounted && itemCount > 0 && (
              <span
                aria-live="polite"
                className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mechanic-500 text-[10px] font-bold text-white ring-2 ring-navy-950"
              >
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link
            href={isAdmin ? "/admin" : "/compte"}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-offwhite-100/80 transition-all hover:bg-white/10 hover:text-mechanic-400 hover:border-mechanic-500/30"
            aria-label={isAdmin ? "Espace admin" : "Mon compte"}
          >
            {isAdmin ? <ShieldCheck className="h-[18px] w-[18px]" /> : <User className="h-[18px] w-[18px]" />}
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-offwhite-100/80 transition-all hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "close" : "menu"}
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.15 }}
              >
                {mobileOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ============================================================
          MENU MOBILE
          ============================================================ */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            navLinks={NAV_LINKS}
            pathname={pathname}
            isAdmin={isAdmin}
            itemCount={itemCount}
            onClose={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
