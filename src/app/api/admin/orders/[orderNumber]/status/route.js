// src/app/api/admin/orders/[orderNumber]/status/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendWhatsAppTemplate } from "@/lib/whatsappBroadcast";

// Transitions manuelles autorisees depuis l'admin. EN_ATTENTE n'apparait
// jamais ici : ce statut n'est modifie que par le paiement (confirmOrderPayment),
// jamais manuellement. ANNULEE et LIVREE sont terminaux (aucune sortie).
const ALLOWED_TRANSITIONS = {
  PAYEE: ["EN_PREPARATION", "ANNULEE"],
  EN_PREPARATION: ["EXPEDIEE", "ANNULEE"],
  EXPEDIEE: ["LIVREE"],
  LIVREE: [],
  ANNULEE: [],
};

export async function PATCH(request, { params }) {
  const { orderNumber } = await params;

  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const body = await request.json();
  const { status: nextStatus } = body;

  if (!nextStatus) {
    return NextResponse.json({ error: "Statut manquant" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      status: true,
      guestPhone: true,
      user: { select: { phone: true } },
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Commande introuvable" },
      { status: 404 },
    );
  }

  const allowed = ALLOWED_TRANSITIONS[order.status] || [];
  if (!allowed.includes(nextStatus)) {
    return NextResponse.json(
      {
        error: `Transition invalide : ${order.status} -> ${nextStatus}`,
      },
      { status: 409 },
    );
  }

  const updateData = { status: nextStatus };
  if (nextStatus === "EXPEDIEE") {
    updateData.deliveryToken = crypto.randomUUID();
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: updateData,
  });

  // A l'expedition : on notifie le CLIENT (pas l'admin/livreur) avec un
  // lien pour confirmer lui-meme la reception a l'arrivee du colis.
  if (nextStatus === "EXPEDIEE") {
    const clientPhone = order.guestPhone || order.user?.phone;
    const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/livraison/confirmer/${updated.deliveryToken}`;

    if (clientPhone) {
      try {
        await sendWhatsAppTemplate({
          to: clientPhone,
          contentSid: process.env.TWILIO_DELIVERY_CONFIRM_TEMPLATE_SID,
          contentVariables: { 1: orderNumber, 2: confirmUrl },
        });
      } catch (err) {
        // On ne bloque pas la transition de statut si l'envoi echoue —
        // l'admin peut toujours partager le lien manuellement, et l'echec
        // est logue pour investigation.
        console.error("Notification WhatsApp client echouee:", err);
      }
    } else {
      console.warn(
        `Commande ${orderNumber} expediee sans telephone client — notification non envoyee`,
      );
    }
  }

  return NextResponse.json({ status: updated.status });
}
