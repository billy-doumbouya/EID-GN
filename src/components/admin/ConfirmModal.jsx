"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "danger",
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const getVariantStyles = () => {
    if (variant === "danger") {
      return {
        iconBg: "bg-rose-50 text-rose-600",
        button: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20",
      };
    }
    return {
      iconBg: "bg-amber-50 text-amber-600",
      button: "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/20",
    };
  };

  const styles = getVariantStyles();

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onCancel : undefined}
      />
      
      {/* Modal Box */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex gap-5">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg} ring-1 ring-inset ring-current/10 shadow-inner`}>
              <AlertTriangle size={24} />
            </div>
            <div className="pt-1">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 bg-slate-50/80 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200/50 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 ${styles.button}`}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
