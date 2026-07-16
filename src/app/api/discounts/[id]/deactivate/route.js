// src/app/api/discounts/[id]/deactivate/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Desactiver = ramener validTo a maintenant, plutot que supprimer.
// Garde l'historique de la promo (utile pour les stats/audit plus tard).
export async function PATCH(request, { params }) {
  const { id } = await params;

  try {
    const discount = await prisma.discount.update({
      where: { id },
      data: { validTo: new Date() },
    });
    return NextResponse.json(discount);
  } catch {
    return NextResponse.json({ error: "Promotion introuvable" }, { status: 404 });
  }
}