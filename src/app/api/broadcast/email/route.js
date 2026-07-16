import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { broadcastEmail } from "@/lib/mailer";

// Diffusion "nouvel arrivage" par email - passe par Brevo (pas de boucle SMTP),
// respecte l'opt-in des clients.
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const { subject, html } = await request.json();
  if (!subject || !html) {
    return NextResponse.json({ error: "Sujet et contenu requis" }, { status: 400 });
  }

  const recipients = await prisma.user.findMany({
    where: { optInEmail: true },
    select: { email: true },
  });
  const emails = recipients.map((r) => r.email);

  const broadcast = await prisma.emailBroadcast.create({
    data: { subject, bodyHtml: html, recipientsCount: emails.length, status: "EN_ATTENTE" },
  });

  try {
    await broadcastEmail({ subject, html, recipients: emails });
    await prisma.emailBroadcast.update({
      where: { id: broadcast.id },
      data: { status: "ENVOYE", sentAt: new Date() },
    });
  } catch (err) {
    await prisma.emailBroadcast.update({ where: { id: broadcast.id }, data: { status: "ECHEC" } });
    return NextResponse.json({ error: "Envoi echoue" }, { status: 500 });
  }

  return NextResponse.json({ sent: emails.length });
}
