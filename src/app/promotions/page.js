import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { DeactivatePromotionButton } from "@/components/admin/DeactivatePromotionButton";

export const metadata = { title: "Promotions" };

const TYPE_LABELS = { POURCENTAGE: "%", MONTANT_FIXE: "GNF" };

function getStatus(discount) {
  const now = new Date();
  if (new Date(discount.validTo) < now) return "expired";
  if (new Date(discount.validFrom) > now) return "scheduled";
  return "active";
}

function StatusBadge({ status }) {
  const config = {
    active: { label: "Active", cls: "bg-success/10 text-success" },
    expired: { label: "Expiree", cls: "bg-navy-800/10 text-navy-800/60" },
    scheduled: { label: "Planifiee", cls: "bg-amber-500/10 text-amber-600" },
  }[status];

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.cls}`}>
      {config.label}
    </span>
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function AdminPromotionsPage() {
  const discounts = await prisma.discount.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Promotions
        </h1>
        <Link
          href="/admin/promotions/nouveau"
          className="flex items-center gap-2 rounded-lg bg-mechanic-500 px-4 py-2 text-sm font-medium text-white hover:bg-mechanic-600"
        >
          <Plus size={16} /> Nouvelle promotion
        </Link>
      </div>

      {discounts.length === 0 ? (
        <div className="rounded-xl border border-navy-800/10 bg-white py-16 text-center">
          <p className="text-sm text-navy-800/60">Aucune promotion pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-navy-800/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-offwhite-200 text-left text-navy-800/70">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Valeur</th>
                <th className="px-4 py-2">Cible</th>
                <th className="px-4 py-2">Periode</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => {
                const status = getStatus(d);
                const targetLabel = d.product
                  ? `Produit : ${d.product.name}`
                  : d.category
                    ? `Categorie : ${d.category.name}`
                    : "Cible manquante";

                return (
                  <tr key={d.id} className="border-t border-navy-800/5">
                    <td className="px-4 py-2 font-medium text-navy-900">{d.name}</td>
                    <td className="px-4 py-2 text-navy-800/70">
                      {d.type === "POURCENTAGE"
                        ? `-${Number(d.value)}%`
                        : `-${Number(d.value).toLocaleString("fr-FR")} GNF`}
                    </td>
                    <td className="px-4 py-2 text-navy-800/70">{targetLabel}</td>
                    <td className="px-4 py-2 text-navy-800/70">
                      {formatDate(d.validFrom)} → {formatDate(d.validTo)}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/promotions/${d.id}`}
                          title="Modifier"
                          className="rounded-lg p-2 text-navy-800/70 hover:bg-navy-800/5"
                        >
                          <Pencil size={16} />
                        </Link>
                        {status !== "expired" && (
                          <DeactivatePromotionButton discountId={d.id} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
