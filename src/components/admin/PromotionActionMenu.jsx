"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Edit, Trash2, Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

export function PromotionActionMenu({ discount }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDeactivate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/discounts/${discount.id}/deactivate`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error();
      toast.success("Promotion désactivée (expirée manuellement)");
      router.refresh();
    } catch {
      toast.error("Impossible de désactiver la promotion");
    } finally {
      setIsLoading(false);
      setShowDeactivateModal(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/discounts/${discount.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Promotion supprimée avec succès");
      router.refresh();
    } catch {
      toast.error("Impossible de supprimer la promotion");
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="rounded-lg p-2 text-navy-800/60 hover:bg-offwhite-100 hover:text-navy-900"
        >
          <MoreVertical size={16} />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-navy-800/5 bg-white shadow-lg">
              {discount.status !== "EXPIREE" && (
                <>
                  <Link
                    href={`/admin/promotions/${discount.id}`}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-offwhite-100"
                    onClick={() => setShowMenu(false)}
                  >
                    <Edit size={14} className="text-mechanic-500" /> Modifier
                  </Link>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeactivateModal(true);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-amber-500/10 text-amber-600"
                  >
                    <Ban size={14} /> Désactiver
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteModal(true);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeactivateModal}
        title="Désactiver la promotion ?"
        message={`Êtes-vous sûr de vouloir désactiver "${discount.name}" ? Elle expirera immédiatement pour les clients.`}
        confirmText="Désactiver"
        cancelText="Annuler"
        onConfirm={handleDeactivate}
        onCancel={() => setShowDeactivateModal(false)}
        isLoading={isLoading}
        variant="danger"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Supprimer la promotion ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement "${discount.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isLoading}
        variant="danger"
      />
    </>
  );
}
