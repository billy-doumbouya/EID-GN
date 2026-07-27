"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "danger", // "danger" | "primary"
  isLoading = false,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const buttonStyle =
    variant === "danger"
      ? "bg-danger hover:bg-danger/90 text-white"
      : "bg-mechanic-500 hover:bg-mechanic-600 text-white";

  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-navy-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-base font-semibold text-navy-900">{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm text-navy-800/60">{description}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-navy-800/70 hover:bg-offwhite-200 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${buttonStyle}`}
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
