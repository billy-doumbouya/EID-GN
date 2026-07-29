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
} from "lucide-react";
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

// Fetcher pour la recherche temps réel
async function searchProducts(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 2)
    return { products: [], pagination: { total: 0 } };
  const res = await fetch(
    `/api/products?search=${encodeURIComponent(searchTerm.trim())}`,
  );
  if (!res.ok) throw new Error("Erreur recherche");
  return res.json();
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

  // Debounce du champ de recherche (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fermer le dropdown lors des clics en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fermer le menu mobile/dropdown lors des changements de page
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

  // Requéte de recherche dynamique
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
    // Ajuster le chemin selon la structure de tes fiches produits (ex: /pieces/id ou /products/slug)
    router.push(`/products/${product.slug}`);
  };

  const productsList = searchResults?.products || [];
  const totalResults = searchResults?.pagination?.total || 0;

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

        {/* BARRE DE RECHERCHE TEMPS RÉEL (DESKTOP) */}
        <div
          ref={searchRef}
          className="relative hidden flex-1 max-w-xs md:block"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center"
          >
            <button
              type="submit"
              aria-label="Rechercher"
              className="absolute left-3.5 text-slate-400 hover:text-mechanic-500 transition-colors z-10"
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
              placeholder="Rechercher une pièce, moto..."
              className="w-full rounded-xl bg-[#e6eef8] py-2 pl-10 pr-8 text-xs font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_4px_4px_8px_#bdc4ce,inset_-4px_-4px_8px_#ffffff]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsDropdownOpen(false);
                }}
                className="absolute right-3 text-slate-400 hover:text-slate-600 z-10"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* MENUS DÉROULANT DES RÉSULTATS (TEMPS RÉEL) */}
          {isDropdownOpen && debouncedQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-3 overflow-hidden rounded-2xl bg-[#e6eef8] p-2 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff] z-50 border border-slate-200/50">
              {isSearching && (
                <div className="p-4 text-center text-xs font-medium text-slate-500">
                  Recherche en cours...
                </div>
              )}

              {!isSearching && productsList.length === 0 && (
                <div className="p-4 text-center text-xs font-medium text-slate-500">
                  Aucun produit trouvé pour « {debouncedQuery} »
                </div>
              )}

              {!isSearching && productsList.length > 0 && (
                <div className="flex flex-col gap-1">
                  {productsList.slice(0, 5).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="flex items-center gap-3 rounded-xl p-2 text-left transition-all hover:bg-[#dce6f2] active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#e6eef8] shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
                        <Image
                          src={product.images?.[0]?.url || "/placeholder.png"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-xs font-bold text-slate-700">
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
                    className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#e6eef8] py-2 text-xs font-bold text-mechanic-500 shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff] transition-all"
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
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-xl bg-[#e6eef8] px-3.5 py-2 text-xs font-bold text-mechanic-500 shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff] md:flex transition-all"
            >
              <ShieldCheck size={16} /> Admin
            </Link>
          )}

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

          <Link
            href="/compte"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6eef8] text-slate-700 transition-all shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] hover:text-mechanic-500 hover:shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]"
            aria-label="Mon compte"
          >
            <User size={18} />
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6eef8] text-slate-700 transition-all shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] hover:text-mechanic-500 active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff] lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* NAVIGATION ET RECHERCHE MOBILE */}
      {mobileOpen && (
        <nav className="flex flex-col gap-3 bg-[#e6eef8] px-6 py-4 border-t border-slate-300/40 lg:hidden shadow-[inset_0_4px_6px_#c3cad3]">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative w-full flex items-center">
              <button
                type="submit"
                className="absolute left-3.5 text-slate-400"
              >
                <Search size={16} />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une pièce..."
                className="w-full rounded-xl bg-[#e6eef8] py-2.5 pl-10 pr-4 text-xs font-medium text-slate-700 outline-none shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]"
              />
            </div>
          </form>

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
