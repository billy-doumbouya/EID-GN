"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utiles";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Êtes-vous sûr ?",
  description = "Cette action est irréversible.",
  confirmText = "Supprimer",
  cancelText = "Annuler",
  variant = "danger",
  isLoading = false,
}) {
  const isDestructive = variant === "danger";
  // Verrouiller le scroll de la page quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Fermer avec Echap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm"
            onClick={() => !isLoading && onClose()}
          />

          {/* MODAL CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-navy-800/5"
            role="dialog"
            aria-modal="true"
          >
            {/* ICON & TEXT */}
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "mb-4 flex h-12 w-12 items-center justify-center rounded-full",
                  isDestructive ? "bg-danger/10 text-danger" : "bg-mechanic-500/10 text-mechanic-500"
                )}
              >
                <AlertTriangle size={24} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-bold text-navy-900 mb-1.5">{title}</h2>
              <p className="text-sm font-medium text-navy-800/60 leading-relaxed">
                {description}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-bold text-navy-800/70 hover:bg-offwhite-200 transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                className={cn(
                  "flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 shadow-sm",
                  isDestructive
                    ? "bg-danger hover:bg-red-700 hover:shadow-danger/30"
                    : "bg-mechanic-500 hover:bg-mechanic-600 hover:shadow-mechanic-500/30"
                )}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                <span>{confirmText}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
