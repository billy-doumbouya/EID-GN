"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Star, Trash2, Upload, Loader2, Link as LinkIcon } from "lucide-react";
import { ConfirmModal } from "../common/ConfirmModal";
import { CldUploadWidget } from "next-cloudinary";

export function ProductImageManager({ productId, initialImages }) {
  const [images, setImages] = useState(initialImages || []);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingActionId, setPendingActionId] = useState(null);

  // Gere l'ajout de l'image (recuperee via URL de Cloudinary) a notre BDD
  async function handleUploadSuccess(result) {
    if (result.event !== "success") return;
    
    setIsUploading(true);
    try {
      const url = result.info.secure_url;
      const publicId = result.info.public_id;

      const res = await fetch(`/api/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, publicId }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'enregistrement de l'image");
        return;
      }

      setImages((prev) => [
        ...prev.map((img) =>
          data.isPrimary ? { ...img, isPrimary: false } : img,
        ),
        data,
      ]);
      toast.success("Image ajoutee avec succes");
    } catch (err) {
      console.error(err);
      toast.error("Erreur reseau lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  }

  const [imageToDelete, setImageToDelete] = useState(null);

  async function handleDeleteConfirm() {
    if (!imageToDelete) return;
    const imageId = imageToDelete;

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
      setImageToDelete(null);
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
        
        <CldUploadWidget
          uploadPreset="eid_gn_products"
          options={{
            sources: ['local', 'url', 'camera', 'google_drive', 'dropbox', 'unsplash'],
            multiple: true,
            maxFiles: 5
          }}
          onSuccess={handleUploadSuccess}
          onOpen={() => console.log('Widget ouvert')}
        >
          {({ open }) => {
            return (
              <button
                type="button"
                onClick={() => open()}
                disabled={isUploading}
                className="flex items-center gap-2 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-900/80 disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                Ajouter une image
              </button>
            );
          }}
        </CldUploadWidget>
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
                  onClick={() => setImageToDelete(img.id)}
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

      <ConfirmModal
        isOpen={!!imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'image ?"
        description="Cette action est irréversible."
        isLoading={!!pendingActionId}
      />
    </div>
  );
}
