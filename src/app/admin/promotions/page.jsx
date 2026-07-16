// src/app/(admin)/admin/promotions/page.js
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeactivateButton } from "@/components/admin/DeactivateButton";

export const metadata = { title: "Promotions" };

const STATUS_CONFIG = {
  ACTIVE: { label: "Active", style: "bg-success/10 text-success" },
  A_VENIR: { label: "A venir", style: "bg-amber-500/10 text-amber-500" },
  EXPIREE: { label: "Expiree", style: "bg-navy-800/10 text-navy-800/50" },
};

function getStatus(discount, now) {
  if (now < new Date(discount.validFrom)) return "A_VENIR";
  if (now > new Date(discount.validTo)) return "EXPIREE";
  return "ACTIVE";
}

function formatValue(discount) {
  return discount.type === "POURCENTAGE"
    ? `-${Number(discount.value)}%`
    : `-${Number(discount.value).toLocaleString("fr-FR")} GNF`;
}

function getTarget(discount) {
  if (discount.product)
    return { label: discount.product.name, kind: "Produit" };
  if (discount.category)
    return { label: discount.category.name, kind: "Categorie" };
  return { label: "—", kind: "" };
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.style}`}
    >
      {config.label}
    </span>
  );
}

export default async function PromotionsAdminPage({ searchParams }) {
  const params = await searchParams;
  const filter = params?.status || "";
  const now = new Date();

  const discounts = await prisma.discount.findMany({
    orderBy: { validFrom: "desc" },
    include: {
      product: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  const enriched = discounts.map((d) => ({ ...d, status: getStatus(d, now) }));
  const filtered = filter
    ? enriched.filter((d) => d.status === filter)
    : enriched;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Promotions
        </h1>
        <Link
          href="/admin/promotions/nouvelle"
          className="flex items-center gap-2 rounded-lg bg-mechanic-500 px-4 py-2 text-sm font-medium text-white hover:bg-mechanic-600"
        >
          <Plus size={16} /> Nouvelle promotion
        </Link>
      </div>

      <form className="mb-4 flex gap-2">
        <select
          name="status"
          defaultValue={filter}
          className="rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="">Toutes</option>
          {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-mechanic-500"
        >
          Filtrer
        </button>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-navy-800/10 bg-white py-16 text-center">
          <p className="text-sm text-navy-800/60">
            {filter
              ? "Aucune promotion dans ce statut."
              : "Aucune promotion pour le moment."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop : table */}
          <div className="hidden overflow-x-auto rounded-xl border border-navy-800/10 bg-white md:block">
            <table className="w-full text-sm">
              <thead className="bg-offwhite-200 text-left text-navy-800/70">
                <tr>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Cible</th>
                  <th className="px-4 py-2">Valeur</th>
                  <th className="px-4 py-2">Periode</th>
                  <th className="px-4 py-2">Applique a</th>
                  <th className="px-4 py-2">Statut</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const target = getTarget(d);
                  return (
                    <tr key={d.id} className="border-t border-navy-800/5">
                      <td className="px-4 py-2 font-medium text-navy-900">
                        {d.name}
                      </td>
                      <td className="px-4 py-2 text-navy-800/70">
                        <span className="text-xs text-navy-800/40">
                          {target.kind}
                        </span>{" "}
                        {target.label}
                      </td>
                      <td className="px-4 py-2 font-medium text-mechanic-500">
                        {formatValue(d)}
                      </td>
                      <td className="px-4 py-2 text-xs text-navy-800/60">
                        {new Date(d.validFrom).toLocaleDateString("fr-FR")} —{" "}
                        {new Date(d.validTo).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-2 text-xs text-navy-800/60">
                        {[d.applyToDetail && "Detail", d.applyToGros && "Gros"]
                          .filter(Boolean)
                          .join(" + ")}
                      </td>
                      <td className="px-4 py-2">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        {d.status !== "EXPIREE" && (
                          <DeactivateButton discountId={d.id} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile : cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((d) => {
              const target = getTarget(d);
              return (
                <div
                  key={d.id}
                  className="rounded-xl border border-navy-800/10 bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-navy-900">{d.name}</p>
                      <p className="mt-0.5 text-xs text-navy-800/60">
                        {target.kind} : {target.label}
                      </p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-navy-800/60">
                    <span className="font-medium text-mechanic-500">
                      {formatValue(d)}
                    </span>
                    <span>
                      {new Date(d.validFrom).toLocaleDateString("fr-FR")} —{" "}
                      {new Date(d.validTo).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-navy-800/50">
                      {[d.applyToDetail && "Detail", d.applyToGros && "Gros"]
                        .filter(Boolean)
                        .join(" + ")}
                    </span>
                    {d.status !== "EXPIREE" && (
                      <DeactivateButton discountId={d.id} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
