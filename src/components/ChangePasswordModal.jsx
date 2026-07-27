"use client";

import { useState } from "react";
import { KeyRound, ChevronRight, Loader2 } from "lucide-react";
import { BaseFormModal } from "./common/BaseFormModal";

export function ChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    if (data.newPassword !== data.confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsOpen(false);
      } else {
        const errData = await res.json();
        setError(
          errData.message || "Erreur lors du changement de mot de passe.",
        );
      }
    } catch (err) {
      setError("Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex w-full items-center justify-between rounded-xl border border-navy-800/5 p-4 text-sm font-medium text-navy-800/80 transition-colors hover:bg-offwhite-100 hover:text-navy-900"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800/5 text-navy-800/60 group-hover:bg-mechanic-500/10 group-hover:text-mechanic-600">
            <KeyRound size={18} />
          </div>
          <span>Changer mon mot de passe</span>
        </div>
        <ChevronRight
          size={16}
          className="text-navy-800/30 group-hover:translate-x-0.5 transition-transform"
        />
      </button>

      <BaseFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Changer mon mot de passe"
        subtitle="Sécurisez votre compte avec un nouveau mot de passe."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-danger/10 p-3 text-xs font-medium text-danger">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-navy-800/70">
              Mot de passe actuel
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              className="mt-1 w-full rounded-xl border border-navy-800/10 px-3.5 py-2 text-sm focus:border-mechanic-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-800/70">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={6}
              className="mt-1 w-full rounded-xl border border-navy-800/10 px-3.5 py-2 text-sm focus:border-mechanic-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-800/70">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              className="mt-1 w-full rounded-xl border border-navy-800/10 px-3.5 py-2 text-sm focus:border-mechanic-500 focus:outline-hidden"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-navy-800/70 hover:bg-offwhite-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-mechanic-500 px-4 py-2 text-sm font-medium text-white hover:bg-mechanic-600 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Mettre à jour
            </button>
          </div>
        </form>
      </BaseFormModal>
    </>
  );
}
