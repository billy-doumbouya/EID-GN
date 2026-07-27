"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function BaseFormModal({ isOpen, onClose, title, subtitle, children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-navy-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-navy-800/40 hover:bg-offwhite-100 hover:text-navy-900"
        >
          <X size={18} />
        </button>

        <div className="mb-5">
          <h2 className="text-lg font-bold text-navy-900">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-navy-800/60">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}
