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
      window.location.href = "/login";
    }
  }

  return (
    <>
      {variant === "sidebar" && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Se déconnecter
        </button>
      )}
      
      {variant === "client-sidebar" && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-danger hover:bg-danger/10"
        >
          <LogOut size={17} />
          Se déconnecter
        </button>
      )}

      {variant === "mobile" && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex shrink-0 flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium text-danger"
        >
          <LogOut size={19} />
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
