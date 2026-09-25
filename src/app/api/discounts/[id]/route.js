import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { promotionSchema } from "@/lib/validators";

export async function PUT(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const parsed = promotionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        value: data.value,
        validFrom: new Date(data.validFrom),
        validTo: new Date(data.validTo),
        applyToDetail: data.applyToDetail,
        applyToGros: data.applyToGros,
        productId: data.targetType === "product" ? data.targetId : null,
        categoryId: data.targetType === "category" ? data.targetId : null,
      },
    });

    return NextResponse.json(updatedDiscount);
  } catch (error) {
    console.error("Erreur PUT discount:", error);
    return NextResponse.json(
      { error: "Impossible de modifier la promotion" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;

    await prisma.discount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE discount:", error);
    return NextResponse.json(
      { error: "Impossible de supprimer la promotion" },
      { status: 500 }
    );
  }
}
