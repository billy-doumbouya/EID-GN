// src/app/compte/commandes/[orderNumber]/page.js
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Detail de la commande" };

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

export default async function OrderDetailPage({ params }) {
  const { orderNumber } = await params;

  const session = await getCurrentUser();
  if (!session) {
    redirect(`/connexion?next=/compte/commandes/${orderNumber}`);
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { product: true } },
      address: true,
      receipt: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  // Commande inexistante OU appartenant a un autre utilisateur : 404 dans
  // les deux cas, pour ne pas laisser deviner si un numero de commande
  // existe en base (evite l'enumeration).
  if (!order || order.userId !== session.sub) {
    notFound();
  }

  const payment = order.payments[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <Link
        href="/compte/commandes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-navy-800/60 hover:text-navy-900"
      >
        <ChevronLeft size={16} /> Mes commandes
      </Link>

      <div className="rounded-xl border border-navy-800/10 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-lg font-semibold text-navy-900">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-navy-800/60">
              Passee le{" "}
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`rounded-full bg-offwhite-100 px-3 py-1 text-sm font-medium ${STATUS_COLORS[order.status]}`}
          >
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        <div className="mt-5 divide-y divide-navy-800/5 border-t border-navy-800/10">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3 text-sm"
            >
              <div>
                <p className="font-medium text-navy-900">
                  {item.product?.name || "Produit"}
                </p>
                <p className="text-xs text-navy-800/50">
                  {item.quantity} x{" "}
                  {Number(item.unitPrice).toLocaleString("fr-FR")} GNF
                </p>
              </div>
              <span className="font-medium text-navy-900">
                {(item.quantity * Number(item.unitPrice)).toLocaleString(
                  "fr-FR",
                )}{" "}
                GNF
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1 border-t border-navy-800/10 pt-4 text-sm">
          <div className="flex justify-between text-navy-800/70">
            <span>Livraison</span>
            <span>{Number(order.deliveryFee).toLocaleString("fr-FR")} GNF</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-navy-900">
            <span>Total</span>
            <span>{Number(order.total).toLocaleString("fr-FR")} GNF</span>
          </div>
        </div>

        {order.address && (
          <div className="mt-4 border-t border-navy-800/10 pt-4 text-sm">
            <p className="font-medium text-navy-900">Adresse de livraison</p>
            <p className="text-navy-800/70">
              {order.address.label} — {order.address.quartier},{" "}
              {order.address.ville}
            </p>
            {order.address.reperes && (
              <p className="text-navy-800/50">{order.address.reperes}</p>
            )}
            <p className="text-navy-800/70">{order.address.telephone}</p>
          </div>
        )}

        {payment && (
          <div className="mt-4 border-t border-navy-800/10 pt-4 text-sm">
            <p className="font-medium text-navy-900">Paiement</p>
            <p className="text-navy-800/70">
              {payment.provider} —{" "}
              {STATUS_LABELS[payment.status] || payment.status}
            </p>
          </div>
        )}

        {order.receipt?.pdfUrl && (
          <a
            href={order.receipt.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-mechanic-500 hover:underline"
          >
            Telecharger le recu (PDF)
          </a>
        )}
      </div>
    </div>
  );
}
