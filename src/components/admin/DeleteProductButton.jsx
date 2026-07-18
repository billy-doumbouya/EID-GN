"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteProductButton({ productId, productName }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer definitivement "${productName}" ? Cette action est irreversible.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        // Cas attendu : produit deja commande, on guide vers la depublication
        if (data.code === "PRODUCT_HAS_ORDERS") {
          toast.error(data.error, {
            action: {
              label: "Depublier a la place",
              onClick: () => handleUnpublish(),
            },
          });
        } else {
          toast.error(data.error || "Erreur lors de la suppression");
        }
        return;
      }

      toast.success("Produit supprime");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Erreur reseau lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleUnpublish() {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: false }),
      });
      if (!res.ok) throw new Error();
      toast.success("Produit depublie");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la depublication");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title="Supprimer"
      className="rounded-lg p-2 text-danger hover:bg-danger/10 disabled:opacity-50"
    >
      {isDeleting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
