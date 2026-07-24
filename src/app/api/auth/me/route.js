import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Utilise par la Navbar (savoir si admin) et par le Checkout
// (pre-remplir les coordonnees d'un utilisateur connecte).
export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      role: true,
      email: true,
      fullName: true,
      phone: true,
    },
  });

  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({ user });
}
