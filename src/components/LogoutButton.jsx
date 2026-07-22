"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut, Loader2 } from "lucide-react";

// variant "sidebar" : style ligne de sidebar desktop (comme les autres liens)
// variant "mobile"  : style icone + petit label pour la bottom-nav
export function LogoutButton({ variant = "sidebar" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  // document n'existe pas cote serveur : on ne portal-render qu'apres le
  // montage cote client, pour eviter un mismatch d'hydratation.
  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleConfirm() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Erreur lors de la deconnexion:", err);
    } finally {
      // Navigation complete (pas router.push) : on veut vider le cache
      // client (Router Cache, React Query, etc.) et repartir d'une page
      // neuve - meme logique que la protection anti-cache mise en place
      // sur /admin, pour ne jamais laisser du contenu deja rendu visible
      // apres la deconnexion.
      window.location.href = "/login";
    }
  }

  const modal = isOpen && (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-navy-900/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-base font-semibold text-navy-900">
          Se deconnecter ?
        </h2>
        <p className="mt-1.5 text-sm text-navy-800/60">
          Tu devras te reconnecter pour acceder a nouveau a cet espace.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setIsOpen(false)}
            disabled={isLoggingOut}
            className="rounded-lg px-4 py-2 text-sm font-medium text-navy-800/70 hover:bg-offwhite-200 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoggingOut}
            className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger/90 disabled:opacity-50"
          >
            {isLoggingOut && <Loader2 size={15} className="animate-spin" />}
            Se deconnecter
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {variant === "sidebar" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Se deconnecter
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

      {/* Portail vers document.body : echappe a tout ancetre position:fixed
          (aside, bottom-nav) qui creerait sinon un contexte d'empilement
          piegeant le modal en dessous d'autres elements fixed de la page. */}
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
