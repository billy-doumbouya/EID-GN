// src/components/admin/LaunchDiscountForm.jsx
"use client";

import { Field } from "./CreateProductForm"; // On réutilise le composant Field exporté

const inputClass =
  "mt-1 w-full rounded-lg border border-navy-800/10 bg-white px-3 py-2 text-sm outline-none focus:border-mechanic-500";

export function LaunchDiscountForm({
  hasLaunchDiscount,
  setHasLaunchDiscount,
  discountData,
  handleDiscountChange,
}) {
  return (
    <div className="rounded-xl border border-navy-800/10 p-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={hasLaunchDiscount}
          onChange={(e) => setHasLaunchDiscount(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm font-medium text-navy-900">
          Ajouter une promotion de lancement (facultatif)
        </span>
      </label>

      {hasLaunchDiscount && (
        <div className="mt-4 space-y-4">
          <Field label="Nom de la promotion" required>
            <input
              type="text"
              name="name"
              value={discountData.name}
              onChange={handleDiscountChange}
              placeholder="ex: Promo lancement CG125"
              className={inputClass}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Type de reduction">
              <select
                name="type"
                value={discountData.type}
                onChange={handleDiscountChange}
                className={inputClass}
              >
                <option value="POURCENTAGE">Pourcentage (%)</option>
                <option value="MONTANT_FIXE">Montant fixe (GNF)</option>
              </select>
            </Field>
            <Field label="Valeur" required>
              <input
                type="number"
                min="0"
                name="value"
                value={discountData.value}
                onChange={handleDiscountChange}
                placeholder={
                  discountData.type === "POURCENTAGE" ? "ex: 15" : "ex: 50000"
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Debut de validite">
              <input
                type="date"
                name="validFrom"
                value={discountData.validFrom}
                onChange={handleDiscountChange}
                className={inputClass}
              />
            </Field>
            <Field label="Fin de validite" required>
              <input
                type="date"
                name="validTo"
                value={discountData.validTo}
                onChange={handleDiscountChange}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-navy-800">
              <input
                type="checkbox"
                name="applyToDetail"
                checked={discountData.applyToDetail}
                onChange={handleDiscountChange}
                className="rounded"
              />
              S'applique au prix detail
            </label>
            <label className="flex items-center gap-2 text-sm text-navy-800">
              <input
                type="checkbox"
                name="applyToGros"
                checked={discountData.applyToGros}
                onChange={handleDiscountChange}
                className="rounded"
              />
              S'applique au prix gros
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
