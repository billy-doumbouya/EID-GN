"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function toDateInputValue(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function PromotionForm({ mode, discount, products, categories }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const initialTargetType = discount?.productId
    ? "product"
    : discount?.categoryId
      ? "category"
      : "product";
  const initialTargetId = discount?.productId || discount?.categoryId || "";

  const [form, setForm] = useState({
    name: discount?.name || "",
    type: discount?.type || "POURCENTAGE",
    value: discount?.value ?? "",
    validFrom: toDateInputValue(discount?.validFrom) || toDateInputValue(new Date()),
    validTo: toDateInputValue(discount?.validTo) || "",
    applyToDetail: discount?.applyToDetail ?? true,
    applyToGros: discount?.applyToGros ?? false,
    targetType: initialTargetType,
    targetId: initialTargetId,
  });

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      // Reinitialise la cible si on change de type de cible, pour ne pas
      // envoyer un targetId de produit alors que targetType = "category"
      ...(field === "targetType" ? { targetId: "" } : {}),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.applyToDetail && !form.applyToGros) {
      toast.error("La promotion doit s'appliquer au moins au detail ou au gros");
      return;
    }
    if (!form.targetId) {
      toast.error("Choisis une cible (produit ou categorie)");
      return;
    }

    setIsSaving(true);
    try {
      const url = mode === "create" ? "/api/discounts" : `/api/discounts/${discount.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'enregistrement");
        return;
      }

      toast.success(mode === "create" ? "Promotion creee" : "Promotion mise a jour");
      router.push("/admin/promotions");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Erreur reseau");
    } finally {
      setIsSaving(false);
    }
  }

  const targetOptions = form.targetType === "product" ? products : categories;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-navy-800/10 bg-white p-5"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-navy-800/70">Nom</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="ex: Promo Tabaski"
          required
          className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">Type</label>
          <select
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            className="w-full rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="POURCENTAGE">Pourcentage (%)</option>
            <option value="MONTANT_FIXE">Montant fixe (GNF)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">
            Valeur {form.type === "POURCENTAGE" ? "(%)" : "(GNF)"}
          </label>
          <input
            type="number"
            min="0"
            max={form.type === "POURCENTAGE" ? 100 : undefined}
            step="1"
            value={form.value}
            onChange={(e) => update("value", e.target.value)}
            required
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">
            Debut
          </label>
          <input
            type="date"
            value={form.validFrom}
            onChange={(e) => update("validFrom", e.target.value)}
            required
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">Fin</label>
          <input
            type="date"
            value={form.validTo}
            onChange={(e) => update("validTo", e.target.value)}
            required
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-navy-800/80">
          <input
            type="checkbox"
            checked={form.applyToDetail}
            onChange={(e) => update("applyToDetail", e.target.checked)}
            className="rounded border-navy-800/30"
          />
          S'applique au prix detail
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-800/80">
          <input
            type="checkbox"
            checked={form.applyToGros}
            onChange={(e) => update("applyToGros", e.target.checked)}
            className="rounded border-navy-800/30"
          />
          S'applique au prix gros
        </label>
      </div>

      <div className="border-t border-navy-800/10 pt-4">
        <label className="mb-1 block text-xs font-medium text-navy-800/70">Cible</label>
        <div className="mb-2 flex gap-4">
          <label className="flex items-center gap-2 text-sm text-navy-800/80">
            <input
              type="radio"
              checked={form.targetType === "product"}
              onChange={() => update("targetType", "product")}
            />
            Un produit
          </label>
          <label className="flex items-center gap-2 text-sm text-navy-800/80">
            <input
              type="radio"
              checked={form.targetType === "category"}
              onChange={() => update("targetType", "category")}
            />
            Une categorie
          </label>
        </div>
        <select
          value={form.targetId}
          onChange={(e) => update("targetId", e.target.value)}
          required
          className="w-full rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="">-- Choisir --</option>
          {targetOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="flex items-center gap-2 rounded-lg bg-mechanic-500 px-4 py-2 text-sm font-medium text-white hover:bg-mechanic-600 disabled:opacity-50"
      >
        {isSaving && <Loader2 size={16} className="animate-spin" />}
        {mode === "create" ? "Creer la promotion" : "Enregistrer"}
      </button>
    </form>
  );
}
