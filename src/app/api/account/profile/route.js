import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { fullName, email, phone } = await req.json();

    if (!fullName || !phone) {
      return NextResponse.json(
        { message: "Le nom et le téléphone sont requis" },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.sub },
      data: {
        fullName,
        email: email || null,
        phone,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la mise à jour" },
      { status: 500 },
    );
  }
}
