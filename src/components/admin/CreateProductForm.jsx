// src/components/admin/CreateProductForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader, ImagePlus, X } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { LaunchDiscountForm } from "./LaunchDiscountForm";
import { cn } from "@/lib/utiles";

const PRODUCT_TYPES = ["MOTO", "TRICYCLE", "PIECE"];

const inputClass =
  "mt-1 w-full rounded-lg border border-navy-800/10 bg-white px-3 py-2 text-sm outline-none focus:border-mechanic-500";

// Exporté pour que le sous-composant puisse le réutiliser
export function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy-900">
        {label} {required && "*"}
      </label>
      {children}
    </div>
  );
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function toPositiveNumber(value, fallback = null) {
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function toPositiveInt(value, fallback = null) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function CreateProductForm({ categories }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [image, setImage] = useState(null); // { url, publicId }

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    slug: "",
    description: "",
    type: "MOTO",
    priceDetail: "",
    priceGros: "",
    minQtyGros: "5",
    stock: "0",
    lowStockAlert: "3",
    isPublished: true,
    categoryId: "",
  });

  const [hasLaunchDiscount, setHasLaunchDiscount] = useState(false);
  const [discountData, setDiscountData] = useState({
    name: "",
    type: "POURCENTAGE",
    value: "",
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: "",
    applyToDetail: true,
    applyToGros: false,
  });

  function handleDiscountChange(e) {
    const { name, value, type, checked } = e.target;
    setDiscountData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleNameChange(e) {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, name, slug: generateSlug(name) }));
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const priceDetail = toPositiveNumber(formData.priceDetail);
    const priceGros = toPositiveNumber(formData.priceGros);
    const minQtyGros = toPositiveInt(formData.minQtyGros, 5);
    const stock = toPositiveInt(formData.stock, 0);
    const lowStockAlert = toPositiveInt(formData.lowStockAlert, 3);

    if (hasLaunchDiscount) {
      const value = toPositiveNumber(discountData.value);
      if (!discountData.name || value === null || !discountData.validTo) {
        setError(
          "La promotion de lancement nécessite un nom, une valeur et une date de fin.",
        );
        return;
      }
      if (discountData.type === "POURCENTAGE" && value > 100) {
        setError("Un pourcentage de réduction ne peut pas dépasser 100.");
        return;
      }
    }

    if (
      !formData.sku ||
      !formData.name ||
      !formData.slug ||
      priceDetail === null ||
      priceGros === null
    ) {
      setError(
        "Le SKU, le nom, le prix détail et le prix de gros (valides) sont obligatoires.",
      );
      return;
    }

    if (priceGros > priceDetail) {
      setError(
        "Le prix de gros est supérieur au prix détail — vérifie que ce n'est pas une erreur de saisie.",
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        priceDetail,
        priceGros,
        minQtyGros,
        stock,
        lowStockAlert,
        image: image
          ? { url: image.url, cloudinaryPublicId: image.publicId }
          : null,
        launchDiscount: hasLaunchDiscount
          ? {
              name: discountData.name,
              type: discountData.type,
              value: toPositiveNumber(discountData.value),
              validFrom: new Date(discountData.validFrom).toISOString(),
              validTo: new Date(discountData.validTo).toISOString(),
              applyToDetail: discountData.applyToDetail,
              applyToGros: discountData.applyToGros,
            }
          : null,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création du produit.");
      }

      setSuccess("Produit créé avec succès !");
      setTimeout(() => router.push("/admin/produits"), 1200);
    } catch (err) {
      setError(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/admin/produits"
        className="flex items-center gap-1 text-sm text-navy-800/60 hover:text-navy-800"
      >
        <ArrowLeft size={16} /> Retour
      </Link>

      <div className="rounded-xl border border-navy-800/10 bg-white p-6">
        <h1 className="mb-6 font-display text-2xl font-semibold text-navy-900">
          Nouveau produit (Gros &amp; Détail)
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-success/10 p-3 text-sm text-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="SKU" required>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="ex: MOT-001"
                className={inputClass}
              />
            </Field>
            <Field label="Type" required>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={inputClass}
              >
                {PRODUCT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nom" required>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="ex: Moto Sanya CG125"
                className={inputClass}
              />
            </Field>
            <Field label="Slug" required>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="auto-généré"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Description du produit..."
              className={inputClass}
            />
          </Field>

          {/* BLOC TARIFAIRE */}
          <div className="space-y-4 rounded-xl bg-navy-800/5 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900">
              Tarification GNF
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Prix au détail" required>
                <input
                  type="number"
                  min="0"
                  name="priceDetail"
                  value={formData.priceDetail}
                  onChange={handleInputChange}
                  placeholder="Prix client standard"
                  className={inputClass}
                />
              </Field>
              <Field label="Prix de gros (unitaire)" required>
                <input
                  type="number"
                  min="0"
                  name="priceGros"
                  value={formData.priceGros}
                  onChange={handleInputChange}
                  placeholder="Prix dès l'atteinte du seuil"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Quantité minimum pour déclencher le prix de gros">
              <input
                type="number"
                min="1"
                name="minQtyGros"
                value={formData.minQtyGros}
                onChange={handleInputChange}
                className={cn(inputClass, "md:w-1/2")}
              />
            </Field>
            <p className="text-xs text-navy-800/50">
              Les promotions (prix barré, réduction temporaire) se gèrent
              séparément depuis la page Promotions, une fois ce produit créé.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Stock initial">
              <input
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className={inputClass}
              />
            </Field>
            <Field label="Seuil alerte stock faible">
              <input
                type="number"
                min="0"
                name="lowStockAlert"
                value={formData.lowStockAlert}
                onChange={handleInputChange}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Catégorie">
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className={inputClass}
            >
              <option value="">Aucune</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Image */}
          <Field label="Image principale">
            {image ? (
              <div className="mt-2 flex items-center gap-4">
                <img
                  src={image.url}
                  alt="Aperçu"
                  className="h-32 w-32 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="flex items-center gap-1 text-sm text-danger hover:underline"
                >
                  <X size={14} /> Supprimer l'image
                </button>
              </div>
            ) : (
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result) => {
                  setImage({
                    url: result.info.secure_url,
                    publicId: result.info.public_id,
                  });
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="mt-1 flex items-center gap-2 rounded-lg border border-dashed border-navy-800/20 px-4 py-3 text-sm text-navy-800/60 hover:border-mechanic-500 hover:text-mechanic-500"
                  >
                    <ImagePlus size={16} /> Choisir une image
                  </button>
                )}
              </CldUploadWidget>
            )}
          </Field>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleInputChange}
              className="rounded"
            />
            <label className="text-sm font-medium text-navy-900">
              Rendre visible sur la boutique
            </label>
          </div>

          <div className="flex gap-2 border-t border-navy-800/10 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-mechanic-500 px-4 py-2 font-medium text-white hover:bg-mechanic-600 disabled:opacity-50"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              {loading ? "Création en cours..." : "Créer le produit"}
            </button>
            <Link
              href="/admin/produits"
              className="rounded-lg border border-navy-800/10 px-4 py-2 text-sm font-medium text-navy-900 hover:bg-navy-800/5"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>

      {/* COMPOSANT PROMO DE LANCEMENT */}
      <LaunchDiscountForm
        hasLaunchDiscount={hasLaunchDiscount}
        setHasLaunchDiscount={setHasLaunchDiscount}
        discountData={discountData}
        handleDiscountChange={handleDiscountChange}
      />
    </div>
  );
}
