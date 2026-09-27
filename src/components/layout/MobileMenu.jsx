"use client";

import { forwardRef, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingCart, ShieldCheck, X } from "lucide-react";
import { SearchCombobox } from "./SearchCombobox";

function isActivePath(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const MobileMenu = forwardRef(function MobileMenu(
  { navLinks, pathname, isAdmin, itemCount, onClose },
  ref
) {
  const prefersReducedMotion = useReducedMotion();
  const closeBtnRef = useRef(null);

  // Focus trap
  useEffect(() => {
    closeBtnRef.current?.focus();

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      const focusable = ref?.current?.querySelectorAll?.(
        'a[href], button:not([disabled]), input:not([disabled])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [ref]);

  const motionProps = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <motion.div
      ref={ref}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigation"
      {...motionProps}
      className="lg:hidden fixed inset-x-0 top-16 md:top-20 bottom-0 z-40 bg-navy-950/98 backdrop-blur-xl overflow-y-auto"
    >
      <div className="flex flex-col gap-4 p-4 pb-12">
        {/* Close button */}
        <button
          ref={closeBtnRef}
          onClick={onClose}
          className="self-end flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-offwhite-100/60 hover:text-white"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Recherche */}
        <SearchCombobox />

        {/* Lien admin */}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl bg-mechanic-500/10 border border-mechanic-500/30 px-4 py-3.5 text-sm font-semibold text-mechanic-400"
          >
            <ShieldCheck className="h-4 w-4" />
            Espace Admin
          </Link>
        )}

        {/* Lien panier */}
        <Link
          href="/panier"
          className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm font-semibold text-white"
        >
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-mechanic-400" />
            Mon Panier
          </span>
          {itemCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-mechanic-500 px-1.5 text-[10px] font-bold text-white">
              {itemCount}
            </span>
          )}
        </Link>

        {/* Navigation links */}
        <nav aria-label="Navigation mobile" className="mt-2">
          <p className="px-2 mb-2 font-mono text-[10px] uppercase tracking-wider text-offwhite-100/40">
            Catalogue
          </p>
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-mechanic-500/10 text-mechanic-400 border border-mechanic-500/20"
                      : "text-offwhite-100/80 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Trust badges */}
        <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
          <a
            href="tel:+224622000000"
            className="block px-2 py-2 text-sm text-offwhite-100/60 hover:text-mechanic-400"
          >
            📞 +224 622 000 000
          </a>
          <a
            href="https://wa.me/224622000000"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-2 py-2 text-sm text-offwhite-100/60 hover:text-mechanic-400"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
});
