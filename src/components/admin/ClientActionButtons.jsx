"use client";

import { useState } from "react";
import { Ban, Trash2, CheckCircle, Loader2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

export function ClientActionButtons({ client }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleToggleSuspend = async () => {
    setIsSuspending(true);
    setShowMenu(false);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: !client.isSuspended }),
      });

      if (!res.ok) throw new Error("Erreur");
      
      toast.success(
        client.isSuspended ? "Client réactivé" : "Client suspendu"
      );
      router.refresh();
    } catch (error) {
      toast.error("Impossible de modifier le statut du client");
    } finally {
      setIsSuspending(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur serveur");
      }
      
      toast.success("Client supprimé avec succès");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
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
              <button
                onClick={handleToggleSuspend}
                disabled={isSuspending}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-offwhite-100"
              >
                {isSuspending ? (
                  <Loader2 size={14} className="animate-spin text-navy-800/50" />
                ) : client.isSuspended ? (
                  <CheckCircle size={14} className="text-success" />
                ) : (
                  <Ban size={14} className="text-amber-500" />
                )}
                {client.isSuspended ? "Réactiver" : "Suspendre"}
              </button>
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
        isOpen={showDeleteModal}
        title="Supprimer ce client ?"
        message={`Êtes-vous sûr de vouloir supprimer ${client.fullName} ? Cette action est irréversible et supprimera également toutes ses données personnelles (commandes anonymisées).`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
}
