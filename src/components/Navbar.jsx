// src/components/Navbar.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Bell,
} from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

import { AdminUserMenu } from "@/components/admin/AdminUserMenu";

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

async function searchProducts(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 2)
    return { products: [], pagination: { total: 0 } };
  const res = await fetch(
    `/api/products?search=${encodeURIComponent(searchTerm.trim())}`,
  );
  if (!res.ok) throw new Error("Erreur recherche");
  return res.json();
}

// Notification Bell for Admins
function AdminNotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Polling simulé pour les alertes urgentes / base de données
  useEffect(() => {
    // Dans un cas de prod, on ferait un fetch("/api/admin/notifications") toutes les X secondes
    // Ici, on simule l'arrivée de notifications pour l'audit et on demande la permission du navigateur
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      // Simulation: Alerte rupture de stock occasionnelle (10% de chance toutes les 30s)
      if (Math.random() > 0.9) {
        const newNotif = {
          id: Date.now(),
          title: "Alerte Stock",
          message: "Un produit vient de passer en rupture de stock.",
          time: new Date().toLocaleTimeString(),
        };
        setNotifications((prev) => [newNotif, ...prev].slice(0, 5));
        setUnreadCount((c) => c + 1);

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(newNotif.title, { body: newNotif.message });
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setUnreadCount(0);
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-offwhite-200/50 text-navy-800 transition-all hover:bg-offwhite-200 hover:text-mechanic-500"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl bg-white shadow-xl border border-navy-800/10 z-50">
          <div className="bg-navy-900 px-4 py-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Alertes Système
            </h3>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-xs text-navy-800/50">
                Aucune alerte urgente.
              </p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="mb-2 rounded-lg bg-offwhite-100 p-3 last:mb-0 border border-navy-800/5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-danger">{notif.title}</span>
                    <span className="text-[9px] font-medium text-navy-800/40">{notif.time}</span>
                  </div>
                  <p className="text-[11px] text-navy-800/70">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const itemCount = useCartStore((s) => s.itemCount());

  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 0,
  });
  const isAdmin = userData?.user?.role === "ADMIN";

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["live-search", debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30000,
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsDropdownOpen(false);
    router.push(`/pieces?search=${encodeURIComponent(searchQuery.trim())}`);
    setMobileOpen(false);
  };

  const handleSelectProduct = (product) => {
    setIsDropdownOpen(false);
    setSearchQuery("");
    router.push(`/products/${product.slug}`);
  };

  const productsList = searchResults?.products || [];
  const totalResults = searchResults?.pagination?.total || 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all shadow-sm border-b border-navy-800/5">
      <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        {/* LOGO */}
        <Link
          href="/"
          className="shrink-0 flex items-center transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo.png"
            alt="EID-GN"
            width={36}
            height={36}
            className="rounded-full bg-navy-900"
          />
          <span className="ml-2 hidden font-display text-lg font-bold text-navy-900 sm:block">
            EID-GN
          </span>
        </Link>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                  active
                    ? "bg-offwhite-200 text-mechanic-500"
                    : "text-navy-800/70 hover:bg-offwhite-100 hover:text-navy-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* BARRE DE RECHERCHE TEMPS RÉEL (DESKTOP) */}
        <div ref={searchRef} className="relative hidden flex-1 max-w-sm md:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <button
              type="submit"
              aria-label="Rechercher"
              className="absolute left-3.5 text-navy-800/40 hover:text-mechanic-500 transition-colors z-10"
            >
              {isSearching ? (
                <Loader2 size={16} className="animate-spin text-mechanic-500" />
              ) : (
                <Search size={16} />
              )}
            </button>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              placeholder="Rechercher une pièce..."
              className="w-full rounded-full bg-offwhite-200/50 py-2.5 pl-10 pr-8 text-xs font-medium text-navy-900 placeholder:text-navy-800/40 border border-transparent transition-all focus:bg-white focus:border-mechanic-500 focus:ring-4 focus:ring-mechanic-500/10 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsDropdownOpen(false);
                }}
                className="absolute right-3 text-navy-800/40 hover:text-navy-900 z-10"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* MENUS DÉROULANT DES RÉSULTATS */}
          {isDropdownOpen && debouncedQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl bg-white p-2 shadow-xl border border-navy-800/5 z-50">
              {isSearching && (
                <div className="p-4 text-center text-xs font-medium text-navy-800/50">
                  Recherche en cours...
                </div>
              )}

              {!isSearching && productsList.length === 0 && (
                <div className="p-4 text-center text-xs font-medium text-navy-800/50">
                  Aucun résultat pour « {debouncedQuery} »
                </div>
              )}

              {!isSearching && productsList.length > 0 && (
                <div className="flex flex-col gap-1">
                  {productsList.slice(0, 5).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-offwhite-100"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-offwhite-200">
                        <Image
                          src={product.images?.[0]?.url || "/placeholder.png"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-xs font-bold text-navy-900">
                          {product.name}
                        </p>
                        <p className="text-[10px] font-semibold text-mechanic-500">
                          {product.priceDetail?.toLocaleString("fr-FR")} GNF
                        </p>
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={handleSearchSubmit}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-offwhite-200 py-2 text-xs font-bold text-navy-900 transition-colors hover:bg-navy-900 hover:text-white"
                  >
                    <span>Voir les {totalResults} résultats</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACTIONS & ICONES */}
        <div className="flex items-center gap-1.5">
          {isAdmin && <AdminNotificationBell />}

          {isAdmin && <AdminUserMenu user={userData?.user} />}

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-offwhite-200/50 text-navy-800 transition-all hover:bg-offwhite-200 hover:text-mechanic-500"
            aria-label="Panier"
          >
            <ShoppingCart size={18} />
            {mounted && itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-mechanic-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            href="/compte"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-offwhite-200/50 text-navy-800 transition-all hover:bg-offwhite-200 hover:text-mechanic-500"
            aria-label="Mon compte"
          >
            <User size={18} />
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-offwhite-200/50 text-navy-800 transition-all hover:bg-offwhite-200 hover:text-mechanic-500 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* NAVIGATION ET RECHERCHE MOBILE */}
      {mobileOpen && (
        <nav className="flex flex-col gap-2 bg-white px-6 py-4 border-t border-navy-800/5 lg:hidden shadow-lg">
          <form onSubmit={handleSearchSubmit} className="w-full mb-2">
            <div className="relative w-full flex items-center">
              <button type="submit" className="absolute left-3.5 text-navy-800/40">
                <Search size={16} />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une pièce..."
                className="w-full rounded-xl bg-offwhite-200/50 py-3 pl-10 pr-4 text-xs font-medium text-navy-900 outline-none focus:ring-2 focus:ring-mechanic-500/20"
              />
            </div>
          </form>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-xs font-bold text-white"
              onClick={() => setMobileOpen(false)}
            >
              <ShieldCheck size={16} /> Espace Admin
            </Link>
          )}

          <Link
            href="/cart"
            className="flex items-center justify-between rounded-xl bg-offwhite-200/50 px-4 py-3 text-xs font-bold text-navy-900"
            onClick={() => setMobileOpen(false)}
          >
            <span>Mon Panier</span>
            {itemCount > 0 && (
              <span className="rounded-full bg-mechanic-500 px-2 py-0.5 text-[10px] text-white">
                {itemCount}
              </span>
            )}
          </Link>

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
                    ? "bg-mechanic-500/10 text-mechanic-500"
                    : "text-navy-800/70 hover:bg-offwhite-100"
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
