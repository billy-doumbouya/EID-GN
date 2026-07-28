// src/app/api/broadcast/email/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { broadcastEmail } from "@/lib/mailer";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const { subject, html } = await request.json();
  if (!subject || !html) {
    return NextResponse.json(
      { error: "Sujet et contenu requis" },
      { status: 400 },
    );
  }

  const recipients = await prisma.user.findMany({
    where: { optInEmail: true },
    select: { email: true },
  });
  const emails = recipients.map((r) => r.email);

  const broadcast = await prisma.emailBroadcast.create({
    data: {
      subject,
      bodyHtml: html,
      recipientsCount: emails.length,
      status: "EN_ATTENTE",
    },
  });

  let result;
  try {
    result = await broadcastEmail({ subject, html, recipients: emails });
    await prisma.emailBroadcast.update({
      where: { id: broadcast.id },
      data: {
        status: result.failed.length === emails.length ? "ECHEC" : "ENVOYE",
        sentAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Erreur broadcastEmail:", err);
    await prisma.emailBroadcast.update({
      where: { id: broadcast.id },
      data: { status: "ECHEC" },
    });
    return NextResponse.json({ error: "Envoi echoue" }, { status: 500 });
  }

  return NextResponse.json({ sent: result.sent, failed: result.failed.length });
}
