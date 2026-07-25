// src/app/api/orders/[orderNumber]/status/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/payments";
import {
  confirmOrderPayment,
  releaseStockReservation,
} from "@/lib/orderFulfillment";

export async function GET(request, { params }) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      status: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, provider: true, providerRef: true, status: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Commande introuvable" },
      { status: 404 },
    );
  }

  const payment = order.payments[0];

  // Le webhook Djomy n'etant pas fiable en sandbox (jamais livre malgre
  // un endpoint fonctionnel et des paiements menes a terme), on verifie
  // activement aupres du fournisseur quand le paiement est encore en
  // attente, au lieu de dependre uniquement du webhook pour avancer.
  if (payment && payment.status === "EN_ATTENTE") {
    try {
      const normalizedStatus = await verifyPayment(
        payment.provider,
        payment.providerRef,
      );

      if (normalizedStatus !== "EN_ATTENTE") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: normalizedStatus, verifiedAt: new Date() },
        });

        if (normalizedStatus === "REUSSI") {
          await confirmOrderPayment(order.id);
        } else if (normalizedStatus === "ECHOUE") {
          await releaseStockReservation(order.id);
        }

        return NextResponse.json({
          status: normalizedStatus === "REUSSI" ? "PAYEE" : "ANNULEE",
        });
      }
    } catch (err) {
      // La verification active a echoue (ex: fournisseur indisponible) :
      // on retombe sur le statut connu en base plutot que de faire
      // echouer toute la requete de polling.
      console.error(
        `Verification active du paiement echouee pour ${orderNumber}:`,
        err,
      );
    }
  }

  return NextResponse.json({ status: order.status });
}
