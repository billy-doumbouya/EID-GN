import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetRequestSchema } from "@/lib/validators";
import { generateResetToken } from "@/lib/auth";
import { sendTransactionalEmail, resetPasswordTemplate } from "@/lib/mailer";

const EXPIRY_MINUTES = 30;

export async function POST(request) {
  const body = await request.json();
  const parsed = resetRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Reponse identique que l'utilisateur existe ou non - evite l'enumeration
  // de comptes valides.
  if (user) {
    const { rawToken, tokenHash } = generateResetToken();
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000),
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/confirm?token=${rawToken}`;
    await sendTransactionalEmail({
      to: user.email,
      subject: "Reinitialisation de votre mot de passe",
      html: resetPasswordTemplate(resetUrl),
    });
  }

  return NextResponse.json({ message: "Si ce compte existe, un email a ete envoye." });
}
