"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { ConfirmModal } from "./common/ConfirmModal";

export function LogoutButton({ variant = "sidebar" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Erreur lors de la deconnexion:", err);
    } finally {
      window.location.href = "/connexion";
    }
  }

  return (
    <>
      {variant === "sidebar" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Se déconnecter
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex shrink-0 flex-col items-center gap-1 px-2 pb-1 text-[11px] text-navy-800/60"
        >
          <LogOut size={20} />
          Sortir
        </button>
      )}

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
        title="Se déconnecter ?"
        description="Tu devras te reconnecter pour accéder à nouveau à cet espace."
        confirmText="Se déconnecter"
        variant="danger"
      />
    </>
  );
}
