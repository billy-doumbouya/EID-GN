"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "../common/ConfirmModal";

export function DeleteAddressButton({ addressId, onDeleted }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/addresses/${addressId}`, { method: "DELETE" });
      if (res.ok && onDeleted) onDeleted(addressId);
    } catch (err) {
      console.error("Erreur suppression adresse:", err);
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-navy-800/40 hover:text-danger p-1"
      >
        <Trash2 size={16} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer l'adresse ?"
        description="Cette action est irréversible."
        confirmText="Supprimer"
        variant="danger"
      />
    </>
  );
}