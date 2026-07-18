"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Star, Trash2, Upload, Loader2 } from "lucide-react";

export function ProductImageManager({ productId, initialImages }) {
  const [images, setImages] = useState(initialImages || []);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingActionId, setPendingActionId] = useState(null);
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/products/${productId}/images`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'upload");
        return;
      }

      setImages((prev) => [
        ...prev.map((img) =>
          data.isPrimary ? { ...img, isPrimary: false } : img,
        ),
        data,
      ]);
      toast.success("Image ajoutee");
    } catch (err) {
      console.error(err);
      toast.error("Erreur reseau lors de l'upload");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(imageId) {
    const confirmed = window.confirm("Supprimer cette image ?");
    if (!confirmed) return;

    setPendingActionId(imageId);
    try {
      const res = await fetch(
        `/api/products/${productId}/images/${imageId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la suppression");
        return;
      }

      setImages((prev) => {
        const remaining = prev.filter((img) => img.id !== imageId);
        const deletedWasPrimary = prev.find((img) => img.id === imageId)?.isPrimary;
        if (deletedWasPrimary && remaining.length > 0) {
          // Reflete cote client la promotion automatique faite en base
          // (image restante la plus ancienne devient primaire).
          const sorted = [...remaining].sort((a, b) => a.position - b.position);
          sorted[0].isPrimary = true;
          return sorted;
        }
        return remaining;
      });
      toast.success("Image supprimee");
    } catch (err) {
      console.error(err);
      toast.error("Erreur reseau");
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleSetPrimary(imageId) {
    setPendingActionId(imageId);
    try {
      const res = await fetch(
        `/api/products/${productId}/images/${imageId}`,
        { method: "PATCH" },
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur");
        return;
      }
      setImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.id === imageId })),
      );
      toast.success("Image primaire mise a jour");
    } catch (err) {
      console.error(err);
      toast.error("Erreur reseau");
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <div className="rounded-xl border border-navy-800/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-navy-900">Images</h2>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-900/80">
          {isUploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          Ajouter une image
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-navy-800/50">
          Aucune image. Un placeholder Unsplash est affiche sur le catalogue en attendant.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-navy-800/10 bg-offwhite-200"
            >
              <Image
                src={img.url}
                alt={img.alt || ""}
                fill
                className="object-cover"
                sizes="150px"
              />
              {img.isPrimary && (
                <span className="absolute left-1 top-1 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-navy-900">
                  <Star size={10} fill="currentColor" /> Principale
                </span>
              )}
              <div className="absolute inset-0 flex items-end justify-end gap-1 bg-navy-900/0 p-1.5 opacity-0 transition-opacity group-hover:bg-navy-900/20 group-hover:opacity-100">
                {!img.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    disabled={pendingActionId === img.id}
                    title="Definir comme principale"
                    className="rounded-full bg-white p-1.5 text-navy-900 hover:bg-amber-500 hover:text-white disabled:opacity-50"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  disabled={pendingActionId === img.id}
                  title="Supprimer"
                  className="rounded-full bg-white p-1.5 text-danger hover:bg-danger hover:text-white disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
