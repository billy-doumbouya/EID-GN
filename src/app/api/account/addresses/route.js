import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getCurrentUser();
    if (!session?.sub) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { label, ville, quartier, reperes, telephone } = await req.json();

    if (!label || !ville || !quartier || !telephone) {
      return NextResponse.json(
        {
          message:
            "Veuillez remplir tous les champs obligatoires (label, ville, quartier, téléphone)",
        },
        { status: 400 },
      );
    }

    const existingCount = await prisma.address.count({
      where: { userId: session.sub },
    });

    const newAddress = await prisma.address.create({
      data: {
        userId: session.sub,
        label,
        ville,
        quartier,
        telephone,
        reperes: reperes || null,
        isDefault: existingCount === 0,
      },
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error("Erreur création adresse:", error);
    return NextResponse.json(
      {
        message: "Erreur serveur lors de la création de l'adresse",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
