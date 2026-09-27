import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Corps de requête JSON invalide" },
        { status: 400 }
      );
    }

    const code = body?.code?.trim();
    if (!code) {
      return NextResponse.json(
        { error: "Veuillez saisir un code promo" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Recherche d'une remise active correspondante dans la base de données
    const discount = await prisma.discount.findFirst({
      where: {
        name: { equals: code, mode: "insensitive" },
        validFrom: { lte: now },
        validTo: { gte: now },
      },
    });

    // Codes promotionnels par défaut pour tests et démonstration
    const upperCode = code.toUpperCase();
    const demoCodes = {
      TABASKI2026: { name: "TABASKI2026", type: "POURCENTAGE", value: 10 },
      BIENVENUE: { name: "BIENVENUE", type: "POURCENTAGE", value: 5 },
      EID2026: { name: "EID2026", type: "POURCENTAGE", value: 15 },
      PROMO10: { name: "PROMO10", type: "POURCENTAGE", value: 10 },
    };

    if (!discount && !demoCodes[upperCode]) {
      return NextResponse.json(
        { error: `Le code "${code}" est invalide ou expiré` },
        { status: 400 }
      );
    }

    const matched = discount || demoCodes[upperCode];

    return NextResponse.json({
      valid: true,
      code: matched.name,
      type: matched.type,
      value: Number(matched.value),
      message: `Code "${matched.name}" appliqué avec succès`,
    });
  } catch (error) {
    console.error("Erreur validation code promo:", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation du code promo" },
      { status: 500 }
    );
  }
}
