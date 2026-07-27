// src/components/AddressCard.jsx
"use client";

import { useState } from "react";
import { MapPin, Star, Phone, Edit2, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { BaseFormModal } from "./common/BaseFormModal";
import { ConfirmModal } from "./common/ConfirmModal";


export function AddressCard({ address }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Modification de l'adresse
  async function handleEdit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch(`/api/account/addresses/${address.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsEditOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.message || "Erreur lors de la modification");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Suppression de l'adresse
  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/account/addresses/${address.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsDeleteOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Définir comme adresse par défaut
  async function handleSetDefault() {
    if (address.isDefault) return;
    try {
      const res = await fetch(`/api/account/addresses/${address.id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div className="relative flex flex-col justify-between rounded-xl border border-navy-800/10 bg-white p-4 transition-all hover:border-mechanic-500/40 hover:bg-offwhite-100/30">
        <div>
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-navy-900 text-sm">
              {address.label}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {address.isDefault ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
                  <Star size={10} className="fill-emerald-600 text-emerald-600" />
                  Par défaut
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSetDefault}
                  className="text-[10px] text-navy-800/50 hover:text-mechanic-500 underline"
                >
                  Définir par défaut
                </button>
              )}
            </div>
          </div>

          <p className="mt-2 flex items-start gap-1.5 text-xs text-navy-800/70">
            <MapPin size={14} className="mt-0.5 shrink-0 text-mechanic-500" />
            <span>
              <strong className="text-navy-900 font-medium">{address.quartier}</strong>, {address.ville}
              {address.reperes && (
                <span className="block text-navy-800/50 mt-0.5 italic">
                  Repère : {address.reperes}
                </span>
              )}
            </span>
          </p>

          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-navy-800/60">
            <Phone size={13} className="shrink-0 text-navy-800/40" />
            <span>{address.telephone}</span>
          </p>
        </div>

        {/* Actions sur l'adresse */}
        <div className="mt-4 flex items-center justify-end gap-1 border-t border-navy-800/5 pt-2">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-navy-800/60 hover:bg-offwhite-200 hover:text-navy-900"
          >
            <Edit2 size={13} />
            Modifier
          </button>
          {!address.isDefault && (
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={13} />
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Modale de modification d'adresse */}
      <BaseFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Modifier l'adresse"
        subtitle="Mettez à jour les informations de livraison."
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-navy-800/70">
              Nom de l'adresse (ex: Boutique Kankan, Domicile)
            </label>
            <input
              type="text"
              name="label"
              defaultValue={address.label}
              required
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
              defaultValue={address.telephone}
              required
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
                defaultValue={address.ville}
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
                defaultValue={address.quartier}
                required
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
              defaultValue={address.reperes || ""}
              className="mt-1 w-full rounded-xl border border-navy-800/10 px-3.5 py-2 text-sm focus:border-mechanic-500 focus:outline-hidden"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
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

      {/* Modale de confirmation de suppression */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={loading}
        title="Supprimer cette adresse ?"
        description={`Êtes-vous sûr de vouloir supprimer "${address.label}" ?`}
        confirmText="Supprimer"
        variant="danger"
      />
    </>
  );
}