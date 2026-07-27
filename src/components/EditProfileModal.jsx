"use client";

import { useState } from "react";
import { Edit3, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { BaseFormModal } from "./common/BaseFormModal";

export function EditProfileModal({ initialData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-navy-800/10 bg-offwhite-100 px-3 py-1.5 text-xs font-medium text-navy-900 transition-colors hover:bg-mechanic-500 hover:text-white hover:border-mechanic-500"
      >
        <Edit3 size={13} />
        Modifier
      </button>

      <BaseFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modifier mes coordonnées"
        subtitle="Mettez à jour vos informations de contact."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-navy-800/70">
              Nom complet
            </label>
            <input
              type="text"
              name="fullName"
              defaultValue={initialData.fullName}
              required
              className="mt-1 w-full rounded-xl border border-navy-800/10 px-3.5 py-2 text-sm focus:border-mechanic-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-800/70">
              Adresse email
            </label>
            <input
              type="email"
              name="email"
              defaultValue={initialData.email}
              className="mt-1 w-full rounded-xl border border-navy-800/10 px-3.5 py-2 text-sm focus:border-mechanic-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-800/70">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={initialData.phone}
              required
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
              Enregistrer
            </button>
          </div>
        </form>
      </BaseFormModal>
    </>
  );
}
