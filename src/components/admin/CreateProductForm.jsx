"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  ImagePlus,
  X,
  Package,
  Tag,
  DollarSign,
  Eye,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { LaunchDiscountForm } from "./LaunchDiscountForm";
import { cn } from "@/lib/utiles";
import { productSchema } from "@/lib/validators"; // Import de ton schéma Zod

const PRODUCT_TYPES = [
  { id: "MOTO", label: "Moto" },
  { id: "TRICYCLE", label: "Tricycle" },
  { id: "PIECE", label: "Pièce Détachée" },
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-mechanic-500 focus:ring-2 focus:ring-mechanic-500/10";

export function Field({ label, required, children, error, hint }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
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

export function CreateProductForm({ categories = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [image, setImage] = useState(null);

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

  function handleDiscountChange(e) {
    const { name, value, type, checked } = e.target;
    setDiscountData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess("");

    // 1. Préparation de l'objet pour la validation Zod
    const payloadRaw = {
      ...formData,
      priceDetail: parseFloat(formData.priceDetail),
      priceGros: parseFloat(formData.priceGros),
      minQtyGros: parseInt(formData.minQtyGros, 10) || 5,
      stock: parseInt(formData.stock, 10) || 0,
      lowStockAlert: parseInt(formData.lowStockAlert, 10) || 3,
      image: image
        ? { url: image.url, cloudinaryPublicId: image.publicId }
        : null,
      launchDiscount: hasLaunchDiscount ? discountData : null,
    };

    // 2. Validation avec Zod
    const result = productSchema.safeParse(payloadRaw);

    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        formattedErrors[path] = issue.message;
      });

      setFieldErrors(formattedErrors);
      setError("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    // 3. Soumission API des données validées par Zod
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création du produit.");
      }

      setSuccess("Produit enregistré avec succès !");
      setTimeout(() => router.push("/admin/produits"), 1000);
    } catch (err) {
      setError(
        err.message || "Une erreur est survenue lors de l'enregistrement.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8 pb-16">
      {/* BARRE D'EN-TÊTE FIXE / STICKY */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 bg-slate-50/80 p-4 backdrop-blur-md rounded-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produits"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Nouveau Produit
            </h1>
            <p className="text-xs text-slate-500">
              Ajoutez un nouvel article au catalogue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/produits"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-mechanic-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-mechanic-600 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {loading ? "Enregistrement..." : "Enregistrer le produit"}
          </button>
        </div>
      </div>

      {/* MESSAGES D'ALERTE */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
          {success}
        </div>
      )}

      {/* GRILLE DU FORMULAIRE */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* COLONNE PRINCIPALE (GAUCHE - 8/12) */}
        <div className="space-y-6 lg:col-span-8">
          {/* INFORMATIONS GÉNÉRALES */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
              <Package className="text-mechanic-500" size={20} />
              <h2 className="font-semibold text-base">
                Informations Générales
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Code SKU"
                required
                hint="Code unique produit"
                error={fieldErrors.sku}
              >
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="ex: MOT-SANYA-125"
                  className={inputClass}
                />
              </Field>

              <Field label="Type de Produit" required error={fieldErrors.type}>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  {PRODUCT_TYPES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom du produit" required error={fieldErrors.name}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="ex: Moto Sanya CG125"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Slug URL"
                required
                hint="Généré automatiquement"
                error={fieldErrors.slug}
              >
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="moto-sanya-cg125"
                  className={cn(inputClass, "bg-slate-50 text-slate-500")}
                />
              </Field>
            </div>

            <Field
              label="Description du produit"
              error={fieldErrors.description}
            >
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Rédigez une description détaillée du produit..."
                className={inputClass}
              />
            </Field>
          </div>

          {/* TARIFICATION */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
              <DollarSign className="text-mechanic-500" size={20} />
              <h2 className="font-semibold text-base">
                Structure Tarifaire (GNF)
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  Prix Détail
                </span>
                <Field
                  label="Prix unitaire standard"
                  required
                  error={fieldErrors.priceDetail}
                >
                  <input
                    type="number"
                    min="0"
                    name="priceDetail"
                    value={formData.priceDetail}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-700/10">
                  Prix Grossiste
                </span>
                <Field
                  label="Prix unitaire de gros"
                  required
                  error={fieldErrors.priceGros}
                >
                  <input
                    type="number"
                    min="0"
                    name="priceGros"
                    value={formData.priceGros}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <Field
              label="Quantité minimale pour la vente en gros"
              hint="Seuil de déclenchement"
              error={fieldErrors.minQtyGros}
            >
              <input
                type="number"
                min="1"
                name="minQtyGros"
                value={formData.minQtyGros}
                onChange={handleInputChange}
                className={cn(inputClass, "max-w-xs")}
              />
            </Field>
          </div>

          {/* OFFRE PROMOTIONNELLE */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4 text-slate-800">
              <Sparkles className="text-amber-500" size={20} />
              <h2 className="font-semibold text-base">
                Offre Promotionnelle de Lancement
              </h2>
            </div>

            <LaunchDiscountForm
              hasLaunchDiscount={hasLaunchDiscount}
              setHasLaunchDiscount={setHasLaunchDiscount}
              discountData={discountData}
              handleDiscountChange={handleDiscountChange}
              errors={fieldErrors}
            />
          </div>
        </div>

        {/* COLONNE SECONDAIRE (DROITE - 4/12) */}
        <div className="space-y-6 lg:col-span-4">
          {/* PUBLICATION */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
              <Eye className="text-mechanic-500" size={20} />
              <h2 className="font-semibold text-base">Publication</h2>
            </div>

            <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50">
              <span className="text-sm font-medium text-slate-800">
                Visibilité Boutique
              </span>
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-slate-300 text-mechanic-500 focus:ring-mechanic-500"
              />
            </label>

            <Field label="Catégorie Principale" error={fieldErrors.categoryId}>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="">Aucune Catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* INVENTAIRE */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
              <Tag className="text-mechanic-500" size={20} />
              <h2 className="font-semibold text-base">Inventaire</h2>
            </div>

            <Field label="Quantité en stock" error={fieldErrors.stock}>
              <input
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className={inputClass}
              />
            </Field>

            <Field
              label="Alerte stock bas"
              hint="Seuil de notification"
              error={fieldErrors.lowStockAlert}
            >
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

          {/* IMAGE PRODUIT */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
              <ImagePlus className="text-mechanic-500" size={20} />
              <h2 className="font-semibold text-base">Image du Produit</h2>
            </div>

            {image ? (
              <div className="relative group overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={image.url}
                  alt="Aperçu produit"
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition-transform hover:scale-110"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result) => {
                  if (result?.info && typeof result.info !== "string") {
                    setImage({
                      url: result.info.secure_url,
                      publicId: result.info.public_id,
                    });
                  }
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="flex flex-col items-center justify-center gap-2 w-full h-40 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center transition-colors hover:border-mechanic-500 hover:bg-slate-50"
                  >
                    <ImagePlus size={28} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">
                      Téléverser une image
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PNG, JPG ou WEBP jusqu'à 5MB
                    </span>
                  </button>
                )}
              </CldUploadWidget>
            )}
            {fieldErrors.image && (
              <p className="text-xs font-medium text-rose-500">
                {fieldErrors.image}
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
