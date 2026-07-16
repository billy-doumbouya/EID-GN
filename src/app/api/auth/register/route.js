import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { hashPassword, signSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { fullName, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe deja avec cet email" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { fullName, email, phone, passwordHash, role: "CLIENT" },
  });

  const token = signSessionToken(user);
  await setSessionCookie(token);

  return NextResponse.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  });
}
