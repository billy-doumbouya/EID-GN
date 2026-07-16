import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { verifyPassword, signSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Message volontairement identique (existe/pas existe) pour ne pas divulguer
  // quels emails sont enregistres.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
  }

  const token = signSessionToken(user);
  await setSessionCookie(token);

  return NextResponse.json({ id: user.id, fullName: user.fullName, role: user.role });
}
