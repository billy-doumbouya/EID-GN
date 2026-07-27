import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session?.sub) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // S'assurer que l'adresse appartient bien à l'utilisateur connecté
    await prisma.address.deleteMany({
      where: {
        id,
        userId: session.sub,
      },
    });

    return NextResponse.json({ message: "Adresse supprimée" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
