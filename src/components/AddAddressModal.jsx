"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { BaseFormModal } from "./common/BaseFormModal";

export function AddAddressModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.message || "Erreur lors de l'enregistrement");
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
        className="inline-flex items-center gap-1 rounded-lg bg-mechanic-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-mechanic-600 shadow-xs"
      >
        <Plus size={14} />
        Ajouter
      </button>

      <BaseFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Ajouter une adresse de livraison"
        subtitle="Renseignez le quartier, le téléphone et des points de repère clairs."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-navy-800/70">
              Nom de l'adresse (ex: Boutique Kankan, Domicile)
            </label>
            <input
              type="text"
              name="label"
              required
              placeholder="Ex: Boutique principale"
              className="mt-1 w-full rounded-xl border border-navy-800/10 px-3.5 py-2 text-sm focus:border-mechanic-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-800/70">
              Numéro de téléphone pour la livraison
            </label>
            <input
              type="tel"
              name="telephone"
              required
              placeholder="Ex: 620 00 00 00"
              className="mt-1 w-full rounded-xl border border-navy-800/10 px-3.5 py-2 text-sm focus:border-mechanic-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-800/70">
                Ville
              </label>
              <input
                type="text"
                name="ville"
                defaultValue="Kankan"
                required
                className="mt-1 w-full rounded-xl border border-navy-800/10 px-3.5 py-2 text-sm focus:border-mechanic-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-800/70">
                Quartier
              </label>
              <input
                type="text"
                name="quartier"
                required
                placeholder="Ex: Salamani"
                className="mt-1 w-full rounded-xl border border-navy-800/10 px-3.5 py-2 text-sm focus:border-mechanic-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-800/70">
              Point de repère
            </label>
            <input
              type="text"
              name="reperes"
              placeholder="Ex: Derrière le grand marché, à côté de la station Shell"
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
