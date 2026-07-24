import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ConfirmationStatus } from "../ConfirmationStatus/page";

export const metadata = { title: "Confirmation de commande" };

export default async function ConfirmationPage({ searchParams }) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber
    ? await prisma.order.findUnique({ where: { orderNumber } })
    : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-navy-800/60">Commande introuvable.</p>
        <Link
          href="/"
          className="mt-3 inline-block text-mechanic-500 hover:underline"
        >
          Retour a l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <ConfirmationStatus
        orderNumber={order.orderNumber}
        initialStatus={order.status}
        total={Number(order.total)}
      />
      <Link
        href="/compte"
        className="mt-6 inline-block rounded-lg bg-mechanic-500 px-6 py-2.5 font-medium text-white hover:bg-mechanic-600"
      >
        Voir mes commandes
      </Link>
    </div>
  );
}
