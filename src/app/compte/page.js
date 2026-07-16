// src/app/(client)/compte/commandes/page.js
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = { title: "Mes commandes" };

const STATUS_LABELS = {
  EN_ATTENTE: "En attente de paiement",
  PAYEE: "Payee",
  EN_PREPARATION: "En preparation",
  EXPEDIEE: "Expediee",
  LIVREE: "Livree",
  ANNULEE: "Annulee",
};

const STATUS_COLORS = {
  EN_ATTENTE: "text-amber-500",
  PAYEE: "text-success",
  EN_PREPARATION: "text-mechanic-500",
  EXPEDIEE: "text-mechanic-500",
  LIVREE: "text-success",
  ANNULEE: "text-danger",
};

export default async function OrdersPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/connexion?next=/compte/commandes");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-navy-800/20 py-16 text-center">
        <p className="text-navy-800/60">
          Vous n'avez pas encore passe de commande.
        </p>
        <Link
          href="/"
          className="mt-3 inline-block text-mechanic-500 hover:underline"
        >
          Parcourir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/compte/commandes/${order.orderNumber}`}
          className="flex items-center justify-between rounded-xl border border-navy-800/10 bg-white p-4 transition-colors hover:border-mechanic-500/40"
        >
          <div>
            <p className="font-medium text-navy-900">{order.orderNumber}</p>
            <p className="text-sm text-navy-800/60">
              {order.items.length} article(s) -{" "}
              {new Date(order.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p
                className={`text-sm font-medium ${STATUS_COLORS[order.status]}`}
              >
                {STATUS_LABELS[order.status]}
              </p>
              <p className="font-semibold text-navy-900">
                {Number(order.total).toLocaleString("fr-FR")} GNF
              </p>
            </div>
            <ChevronRight size={18} className="text-navy-800/30" />
          </div>
        </Link>
      ))}
    </div>
  );
}
