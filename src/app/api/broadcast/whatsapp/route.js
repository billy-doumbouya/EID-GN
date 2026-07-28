// src/app/api/broadcast/whatsapp/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendWhatsAppTemplate } from "@/lib/whatsappBroadcast";
import { resolveTemplateSid } from "@/lib/whatsappTemplates";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const { templateId, contentVariables } = await request.json();
  if (!templateId) {
    return NextResponse.json(
      { error: "Le template a utiliser est requis" },
      { status: 400 },
    );
  }

  const contentSid = resolveTemplateSid(templateId);
  if (!contentSid) {
    return NextResponse.json(
      { error: "Template inconnu ou non configure" },
      { status: 400 },
    );
  }

  const recipients = await prisma.user.findMany({
    where: { optInWhatsapp: true, phone: { not: null } },
    select: { phone: true },
  });

  const broadcast = await prisma.whatsappBroadcast.create({
    data: {
      templateName: templateId,
      message: JSON.stringify(contentVariables || {}),
      recipientsCount: recipients.length,
      status: "EN_ATTENTE",
    },
  });

  let sent = 0;
  const errors = [];
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
    data: {
      status: errors.length === recipients.length ? "ECHEC" : "ENVOYE",
      sentAt: new Date(),
    },
  });

  return NextResponse.json({ sent, failed: errors.length });
}
