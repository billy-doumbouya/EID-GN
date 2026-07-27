import { prisma } from "@/lib/prisma";
import { ConfirmDeliveryButton } from "./ConfirmDeliveryButton";

export const metadata = { title: "Confirmer la livraison" };

export default async function ConfirmDeliveryPage({ params }) {
  const { token } = await params;

  const order = await prisma.order.findUnique({
    where: { deliveryToken: token },
    select: { orderNumber: true, status: true, total: true },
  });

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-navy-800/60">Lien invalide ou expire.</p>
      </div>
    );
  }

  if (order.status === "LIVREE") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-medium text-success">
          Commande {order.orderNumber} deja marquee comme livree.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-xl font-semibold text-navy-900">
        Commande {order.orderNumber}
      </h1>
      <p className="mt-2 text-navy-800/60">
        {Number(order.total).toLocaleString("fr-FR")} GNF
      </p>
      <p className="mt-4 text-sm text-navy-800/70">
        Confirmez la reception de votre commande pour cloturer la livraison.
      </p>
      <ConfirmDeliveryButton token={token} orderNumber={order.orderNumber} />
    </div>
  );
}
