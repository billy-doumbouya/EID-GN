// src/components/admin/CreatePromotionForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader } from "lucide-react";

const inputClass =
  "mt-1 w-full rounded-lg border border-navy-800/10 bg-white px-3 py-2 text-sm outline-none focus:border-mechanic-500";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy-900">
        {label} {required && "*"}
      </label>
      {children}
    </div>
  );
}

export function CreatePromotionForm({ products, categories }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [targetType, setTargetType] = useState("product");
  const [form, setForm] = useState({
    name: "",
    type: "POURCENTAGE",
    value: "",
    targetId: "",
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: "",
    applyToDetail: true,
    applyToGros: false,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.value || !form.targetId || !form.validTo) {
      setError("Nom, valeur, cible et date de fin sont obligatoires.");
      return;
    }
    if (!form.applyToDetail && !form.applyToGros) {
      setError("Choisissez au moins un prix cible (detail ou gros).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          targetType,
          validFrom: new Date(form.validFrom).toISOString(),
          validTo: new Date(form.validTo).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la creation");
      }

      router.push("/admin/promotions");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const targetOptions = targetType === "product" ? products : categories;

  return (
    <div className="max-w-xl">
      <Link
        href="/admin/promotions"
        className="mb-6 flex items-center gap-1 text-sm text-navy-800/60 hover:text-navy-800"
      >
        <ArrowLeft size={16} /> Retour
      </Link>

      <div className="rounded-xl border border-navy-800/10 bg-white p-6">
        <h1 className="mb-6 font-display text-2xl font-semibold text-navy-900">Nouvelle promotion</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nom de la promotion" required>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="ex: Promo Tabaski freinage"
              className={inputClass}
            />
          </Field>

          <Field label="S'applique a" required>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setTargetType("product");
                  setForm((prev) => ({ ...prev, targetId: "" }));
                }}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  targetType === "product"
                    ? "border-mechanic-500 bg-mechanic-500/5 text-mechanic-500"
                    : "border-navy-800/10 text-navy-800/60"
                }`}
              >
                Un produit
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetType("category");
                  setForm((prev) => ({ ...prev, targetId: "" }));
                }}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  targetType === "category"
                    ? "border-mechanic-500 bg-mechanic-500/5 text-mechanic-500"
                    : "border-navy-800/10 text-navy-800/60"
                }`}
              >
                Une categorie
              </button>
            </div>
          </Field>

          <Field label={targetType === "product" ? "Produit" : "Categorie"} required>
            <select name="targetId" value={form.targetId} onChange={handleChange} className={inputClass}>
              <option value="">Selectionner...</option>
              {targetOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                  {opt.sku ? ` (${opt.sku})` : ""}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Type de reduction">
              <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                <option value="POURCENTAGE">Pourcentage (%)</option>
                <option value="MONTANT_FIXE">Montant fixe (GNF)</option>
              </select>
            </Field>
            <Field label="Valeur" required>
              <input
                type="number"
                min="0"
                name="value"
                value={form.value}
                onChange={handleChange}
                placeholder={form.type === "POURCENTAGE" ? "ex: 15" : "ex: 50000"}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Debut de validite">
              <input
                type="date"
                name="validFrom"
                value={form.validFrom}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
            <Field label="Fin de validite" required>
              <input
                type="date"
                name="validTo"
                value={form.validTo}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex gap-4 rounded-lg bg-navy-800/5 p-3">
            <label className="flex items-center gap-2 text-sm text-navy-800">
              <input
                type="checkbox"
                name="applyToDetail"
                checked={form.applyToDetail}
                onChange={handleChange}
                className="rounded"
              />
              S'applique au prix detail
            </label>
            <label className="flex items-center gap-2 text-sm text-navy-800">
              <input
                type="checkbox"
                name="applyToGros"
                checked={form.applyToGros}
                onChange={handleChange}
                className="rounded"
              />
              S'applique au prix gros
            </label>
          </div>

          <div className="flex gap-2 border-t border-navy-800/10 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-mechanic-500 px-4 py-2 font-medium text-white hover:bg-mechanic-600 disabled:opacity-50"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              {loading ? "Creation..." : "Creer la promotion"}
            </button>
            <Link
              href="/admin/promotions"
              className="rounded-lg border border-navy-800/10 px-4 py-2 text-sm font-medium text-navy-900 hover:bg-navy-800/5"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}