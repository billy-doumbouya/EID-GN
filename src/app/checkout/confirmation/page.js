import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ConfirmationStatus } from "@/components/checkout/ConfirmationStatus";

export const metadata = { title: "Confirmation de commande — EID-MULTISERVICE" };

export default async function ConfirmationPage({ searchParams }) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber
    ? await prisma.order.findUnique({
        where: { orderNumber },
        include: { payments: { take: 1, orderBy: { createdAt: "desc" } } },
      })
    : null;

  if (!order) {
    return (
      <main className="min-h-[70vh] bg-navy-950 flex items-center justify-center px-4 py-24 text-center">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-white/60">Commande introuvable.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-mechanic-400 hover:text-mechanic-300"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <ConfirmationStatus
      orderNumber={order.orderNumber}
      initialStatus={order.status}
      total={Number(order.total)}
      paymentProvider={order.payments[0]?.provider}
    />
  );
}
