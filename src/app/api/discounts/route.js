// src/app/api/discounts/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      value,
      validFrom,
      validTo,
      applyToDetail,
      applyToGros,
      targetType, // "product" | "category"
      targetId,
    } = body;

    if (
      !name ||
      !type ||
      value == null ||
      !validFrom ||
      !validTo ||
      !targetType ||
      !targetId
    ) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 },
      );
    }

    const parsedValue = parseFloat(value);
    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      return NextResponse.json({ error: "Valeur invalide" }, { status: 400 });
    }
    if (type === "POURCENTAGE" && parsedValue > 100) {
      return NextResponse.json(
        { error: "Un pourcentage ne peut pas depasser 100" },
        { status: 400 },
      );
    }
    if (new Date(validTo) <= new Date(validFrom)) {
      return NextResponse.json(
        { error: "La date de fin doit etre apres la date de debut" },
        { status: 400 },
      );
    }
    if (!applyToDetail && !applyToGros) {
      return NextResponse.json(
        {
          error:
            "La promotion doit s'appliquer au moins au prix detail ou gros",
        },
        { status: 400 },
      );
    }

    const discount = await prisma.discount.create({
      data: {
        name,
        type,
        value: parsedValue,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        applyToDetail: applyToDetail ?? true,
        applyToGros: applyToGros ?? false,
        productId: targetType === "product" ? targetId : null,
        categoryId: targetType === "category" ? targetId : null,
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    console.error("Erreur creation promotion:", error);
    return NextResponse.json(
      { error: "Erreur creation promotion" },
      { status: 500 },
    );
  }
}
