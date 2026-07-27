"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  Tag,
  Calendar,
  Percent,
  Coins,
  Package,
  FolderTree,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Layers,
  AlertCircle,
} from "lucide-react";
import { promotionSchema } from "@/lib/validators";
import { cn } from "@/lib/utiles";

function toDateInputValue(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function Field({ label, required, children, error, hint }) {
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-rose-500 pt-0.5">
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

export function PromotionForm({
  mode,
  discount,
  products = [],
  categories = [],
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const initialTargetType = discount?.productId
    ? "product"
    : discount?.categoryId
      ? "category"
      : "product";

  const initialTargetId = discount?.productId || discount?.categoryId || "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: discount?.name || "",
      type: discount?.type || "POURCENTAGE",
      value: discount?.value ?? "",
      validFrom:
        toDateInputValue(discount?.validFrom) || toDateInputValue(new Date()),
      validTo: toDateInputValue(discount?.validTo) || "",
      applyToDetail: discount?.applyToDetail ?? true,
      applyToGros: discount?.applyToGros ?? false,
      targetType: initialTargetType,
      targetId: initialTargetId,
    },
  });

  const currentType = watch("type");
  const currentTargetType = watch("targetType");
  const applyToDetail = watch("applyToDetail");
  const applyToGros = watch("applyToGros");

  async function onSubmit(data) {
    setIsSaving(true);
    try {
      const url =
        mode === "create" ? "/api/discounts" : `/api/discounts/${discount.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();

      if (!res.ok) {
        toast.error(resData.error || "Erreur lors de l'enregistrement");
        return;
      }

      toast.success(
        mode === "create"
          ? "Promotion créée avec succès"
          : "Promotion mise à jour",
      );
      router.push("/admin/promotions");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Erreur réseau");
    } finally {
      setIsSaving(false);
    }
  }

  const targetOptions = currentTargetType === "product" ? products : categories;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 pb-16">
      {/* BARRE EN-TÊTE - PLEINE LARGEUR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 bg-white p-4 rounded-xl shadow-sm w-full">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/promotions"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {mode === "create"
                ? "Nouvelle Promotion"
                : "Modifier la Promotion"}
            </h1>
            <p className="text-xs text-slate-500">
              Définissez les critères de réduction pour votre catalogue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/promotions"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-mechanic-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-mechanic-600 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {mode === "create" ? "Créer la promotion" : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* GRILLE D'ENGAGEMENT DE L'ESPACE (12 COLONNES FULL-WIDTH) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
        {/* COLONNE GAUCHE (8 COLONNES) */}
        <div className="space-y-6 lg:col-span-8 w-full">
          {/* CARTE : INFORMATIONS DE BASE */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6 w-full">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
              <Tag className="text-mechanic-500" size={20} />
              <h2 className="font-semibold text-base">
                Configuration Générale
              </h2>
            </div>

            <Field
              label="Nom de la promotion"
              required
              error={errors.name?.message}
              hint="ex: Offre Tabaski 2026"
            >
              <input
                type="text"
                {...register("name")}
                placeholder="ex: Réduction Moteurs & Pièces"
                className={cn(
                  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-mechanic-500 focus:ring-2 focus:ring-mechanic-500/10",
                  errors.name && "border-rose-300 bg-rose-50/30",
                )}
              />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2 w-full">
              <Field
                label="Type de Réduction"
                required
                error={errors.type?.message}
              >
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-lg border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() =>
                      setValue("type", "POURCENTAGE", { shouldValidate: true })
                    }
                    className={cn(
                      "flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all",
                      currentType === "POURCENTAGE"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900",
                    )}
                  >
                    <Percent size={14} /> Pourcentage
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setValue("type", "MONTANT_FIXE", { shouldValidate: true })
                    }
                    className={cn(
                      "flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all",
                      currentType === "MONTANT_FIXE"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900",
                    )}
                  >
                    <Coins size={14} /> Fixe (GNF)
                  </button>
                </div>
              </Field>

              <Field
                label={`Valeur (${currentType === "POURCENTAGE" ? "%" : "GNF"})`}
                required
                error={errors.value?.message}
              >
                <input
                  type="number"
                  step="any"
                  {...register("value")}
                  placeholder={
                    currentType === "POURCENTAGE" ? "ex: 15" : "ex: 50000"
                  }
                  className={cn(
                    "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-mechanic-500 focus:ring-2 focus:ring-mechanic-500/10",
                    errors.value && "border-rose-300 bg-rose-50/30",
                  )}
                />
              </Field>
            </div>
          </div>

          {/* CARTE : CIBLE DE LA PROMOTION */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6 w-full">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
              <Layers className="text-mechanic-500" size={20} />
              <h2 className="font-semibold text-base">Cible de la Remise</h2>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Type de Cible <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setValue("targetType", "product", { shouldValidate: true });
                    setValue("targetId", "", { shouldValidate: true });
                  }}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border text-left transition-all w-full",
                    currentTargetType === "product"
                      ? "border-mechanic-500 bg-mechanic-500/5 ring-2 ring-mechanic-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      currentTargetType === "product"
                        ? "bg-mechanic-500 text-white"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    <Package size={20} />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-900">
                      Un Produit
                    </span>
                    <span className="text-xs text-slate-500">
                      Appliquer à un seul article du catalogue
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setValue("targetType", "category", {
                      shouldValidate: true,
                    });
                    setValue("targetId", "", { shouldValidate: true });
                  }}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border text-left transition-all w-full",
                    currentTargetType === "category"
                      ? "border-mechanic-500 bg-mechanic-500/5 ring-2 ring-mechanic-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      currentTargetType === "category"
                        ? "bg-mechanic-500 text-white"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    <FolderTree size={20} />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-900">
                      Une Catégorie
                    </span>
                    <span className="text-xs text-slate-500">
                      Appliquer à tous les articles de la catégorie
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <Field
              label={
                currentTargetType === "product"
                  ? "Sélectionner le Produit"
                  : "Sélectionner la Catégorie"
              }
              required
              error={errors.targetId?.message}
            >
              <select
                {...register("targetId")}
                className={cn(
                  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-mechanic-500 focus:ring-2 focus:ring-mechanic-500/10",
                  errors.targetId && "border-rose-300 bg-rose-50/30",
                )}
              >
                <option value="">-- Sélectionner dans la liste --</option>
                {targetOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* COLONNE DROITE (4 COLONNES) */}
        <div className="space-y-6 lg:col-span-4 w-full">
          {/* CARTE : PÉRIODE DE VALIDITÉ */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5 w-full">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
              <Calendar className="text-mechanic-500" size={20} />
              <h2 className="font-semibold text-base">Planification</h2>
            </div>

            <Field
              label="Date de Début"
              required
              error={errors.validFrom?.message}
            >
              <input
                type="date"
                {...register("validFrom")}
                className={cn(
                  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-mechanic-500 focus:ring-2 focus:ring-mechanic-500/10",
                  errors.validFrom && "border-rose-300 bg-rose-50/30",
                )}
              />
            </Field>

            <Field label="Date de Fin" required error={errors.validTo?.message}>
              <input
                type="date"
                {...register("validTo")}
                className={cn(
                  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-mechanic-500 focus:ring-2 focus:ring-mechanic-500/10",
                  errors.validTo && "border-rose-300 bg-rose-50/30",
                )}
              />
            </Field>
          </div>

          {/* CARTE : TARIFS CONCERNÉS */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 w-full">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
              <ShieldCheck className="text-mechanic-500" size={20} />
              <h2 className="font-semibold text-base">
                Portée de la Réduction
              </h2>
            </div>

            <div className="space-y-3">
              <label
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                  applyToDetail
                    ? "bg-slate-50 border-slate-300"
                    : "bg-white border-slate-100",
                )}
              >
                <input
                  type="checkbox"
                  {...register("applyToDetail")}
                  className="h-4 w-4 rounded border-slate-300 text-mechanic-500 focus:ring-mechanic-500"
                />
                <span className="text-sm font-medium text-slate-800">
                  Appliquer au prix détail
                </span>
              </label>

              <label
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                  applyToGros
                    ? "bg-slate-50 border-slate-300"
                    : "bg-white border-slate-100",
                )}
              >
                <input
                  type="checkbox"
                  {...register("applyToGros")}
                  className="h-4 w-4 rounded border-slate-300 text-mechanic-500 focus:ring-mechanic-500"
                />
                <span className="text-sm font-medium text-slate-800">
                  Appliquer au prix de gros
                </span>
              </label>

              {errors.applyToDetail && (
                <p className="flex items-center gap-1 text-xs font-medium text-rose-500 pt-1">
                  <AlertCircle size={13} />
                  {errors.applyToDetail.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
