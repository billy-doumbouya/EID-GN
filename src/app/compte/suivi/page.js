// src/app/compte/suivi-livraison/page.js
import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Suivi livraison" };

// LIVREE volontairement exclue des etapes actives : une commande livree
// n'est plus une livraison "en cours", elle bascule dans l'historique
// (Mes commandes) au lieu de rester ici indefiniment.
const ACTIVE_STATUSES = ["PAYEE", "EN_PREPARATION", "EXPEDIEE"];
const STEPS = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];
const STEP_LABELS = {
  PAYEE: "Commande confirmee",
  EN_PREPARATION: "En preparation",
  EXPEDIEE: "Expediee",
  LIVREE: "Livree",
};
const MAX_ORDERS = 10;

export default async function TrackingPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/connexion?next=/compte/suivi-livraison");
  }

  const activeOrders = await prisma.order.findMany({
    where: { userId: session.sub, status: { in: ACTIVE_STATUSES } },
    orderBy: { createdAt: "desc" },
    take: MAX_ORDERS,
    include: {
      items: true,
      address: true,
    },
  });

  if (activeOrders.length === 0) {
    return (
      <div className="rounded-xl border border-navy-800/10 bg-white p-6 text-center">
        <p className="text-navy-800/60">Aucune livraison en cours.</p>
        <Link
          href="/compte/commandes"
          className="mt-2 inline-block text-sm font-medium text-mechanic-500 hover:underline"
        >
          Voir l'historique de mes commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeOrders.map((order) => {
        const currentIndex = STEPS.indexOf(order.status);
        const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

        return (
          <div
            key={order.id}
            className="rounded-xl border border-navy-800/10 bg-white p-4"
          >
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="font-medium text-navy-900">{order.orderNumber}</p>
              <p className="text-sm font-medium text-navy-900">
                {Number(order.total).toLocaleString("fr-FR")} GNF
              </p>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-800/50">
              <span>
                {itemCount} article{itemCount > 1 ? "s" : ""}
              </span>
              <span>
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
              {order.address && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {order.address.quartier}, {order.address.ville}
                </span>
              )}
            </div>

            <div className="flex items-center">
              {STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 items-center">
                  <div
                    aria-label={STEP_LABELS[step]}
                    title={STEP_LABELS[step]}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                      i <= currentIndex
                        ? "bg-mechanic-500 text-white"
                        : "bg-offwhite-200 text-navy-800/40"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        i < currentIndex ? "bg-mechanic-500" : "bg-offwhite-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-navy-800/60">
              {STEP_LABELS[order.status]}
            </p>
          </div>
        );
      })}

      {activeOrders.length === MAX_ORDERS && (
        <Link
          href="/compte/commandes"
          className="block text-center text-sm font-medium text-mechanic-500 hover:underline"
        >
          Voir toutes mes commandes
        </Link>
      )}
    </div>
  );
}
