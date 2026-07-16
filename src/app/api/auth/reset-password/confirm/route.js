import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetConfirmSchema } from "@/lib/validators";
import { hashResetToken, hashPassword } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const parsed = resetConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
  }

  const tokenHash = hashResetToken(parsed.data.token);
  const resetRequest = await prisma.passwordReset.findUnique({ where: { tokenHash } });

  if (!resetRequest || resetRequest.usedAt || resetRequest.expiresAt < new Date()) {
    return NextResponse.json({ error: "Lien invalide ou expire" }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetRequest.userId }, data: { passwordHash } }),
    prisma.passwordReset.update({ where: { id: resetRequest.id }, data: { usedAt: new Date() } }),
  ]);

  return NextResponse.json({ message: "Mot de passe mis a jour" });
}
