"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "MOTO", label: "Moto" },
  { value: "TRICYCLE", label: "Tricycle" },
  { value: "PIECE", label: "Piece detachee" },
];

export function ProductEditForm({ product, categories }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description,
    type: product.type,
    priceDetail: product.priceDetail,
    priceGros: product.priceGros,
    minQtyGros: product.minQtyGros,
    stock: product.stock,
    lowStockAlert: product.lowStockAlert,
    isPublished: product.isPublished,
    categoryId: product.categoryId || "",
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (Number(form.priceGros) > Number(form.priceDetail)) {
      toast.error("Le prix de gros ne peut pas depasser le prix detail");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la mise a jour");
        return;
      }

      toast.success("Produit mis a jour");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Erreur reseau");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-navy-800/10 bg-white p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">
            Nom
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">
            Slug
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            required
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-navy-800/70">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          required
          className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">
            Type
          </label>
          <select
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            className="w-full rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm outline-none"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">
            Categorie
          </label>
          <select
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            className="w-full rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Aucune</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">
            Prix detail (GNF)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.priceDetail}
            onChange={(e) => update("priceDetail", e.target.value)}
            required
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">
            Prix gros (GNF)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.priceGros}
            onChange={(e) => update("priceGros", e.target.value)}
            required
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">
            Qte min. gros
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={form.minQtyGros}
            onChange={(e) => update("minQtyGros", e.target.value)}
            required
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">
            Stock
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            required
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-800/70">
            Seuil stock faible
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.lowStockAlert}
            onChange={(e) => update("lowStockAlert", e.target.value)}
            required
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-navy-800/80">
        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => update("isPublished", e.target.checked)}
          className="rounded border-navy-800/30"
        />
        Publie sur le catalogue
      </label>

      <button
        type="submit"
        disabled={isSaving}
        className="flex items-center gap-2 rounded-lg bg-mechanic-500 px-4 py-2 text-sm font-medium text-white hover:bg-mechanic-600 disabled:opacity-50"
      >
        {isSaving && <Loader2 size={16} className="animate-spin" />}
        Enregistrer
      </button>
    </form>
  );
}
