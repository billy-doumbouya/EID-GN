import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendWhatsAppTemplate } from "@/lib/whatsappBroadcast";

// Diffusion WhatsApp en masse via Twilio - necessite un Content Template
// pre-approuve (voir lib/whatsapp.js pour le detail des contraintes).
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const { contentSid, contentVariables } = await request.json();
  if (!contentSid) {
    return NextResponse.json({ error: "Le SID du template Twilio est requis" }, { status: 400 });
  }

  const recipients = await prisma.user.findMany({
    where: { optInWhatsapp: true, phone: { not: null } },
    select: { phone: true },
  });

  const broadcast = await prisma.whatsappBroadcast.create({
    data: {
      templateName: contentSid,
      message: JSON.stringify(contentVariables || {}),
      recipientsCount: recipients.length,
      status: "EN_ATTENTE",
    },
  });

  let sent = 0;
  const errors = [];
  // Envoi sequentiel volontaire pour respecter les limites de debit Twilio/Meta
  // (le compte WhatsApp Business a des paliers de volume selon sa qualite).
  for (const r of recipients) {
    try {
      await sendWhatsAppTemplate({ to: r.phone, contentSid, contentVariables });
      sent++;
    } catch (err) {
      errors.push(r.phone);
    }
  }

  await prisma.whatsappBroadcast.update({
    where: { id: broadcast.id },
    data: { status: errors.length === recipients.length ? "ECHEC" : "ENVOYE", sentAt: new Date() },
  });

  return NextResponse.json({ sent, failed: errors.length });
}
