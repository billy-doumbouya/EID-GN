import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { discountSchema } from "@/lib/validations/discount";

// GET : recuperer une promotion (utilise par la page d'edition admin)
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const discount = await prisma.discount.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    if (!discount) {
      return NextResponse.json(
        { error: "Promotion introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json(discount);
  } catch (error) {
    console.error("Erreur GET promotion:", error);
    return NextResponse.json(
      { error: "Erreur lecture de la promotion" },
      { status: 500 },
    );
  }
}

// PUT : modifier une promotion existante (meme validation que la creation)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = discountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const target =
      data.targetType === "product"
        ? await prisma.product.findUnique({ where: { id: data.targetId } })
        : await prisma.category.findUnique({ where: { id: data.targetId } });

    if (!target) {
      return NextResponse.json(
        { error: `${data.targetType === "product" ? "Produit" : "Categorie"} introuvable` },
        { status: 400 },
      );
    }

    const discount = await prisma.discount.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        value: data.value,
        validFrom: data.validFrom,
        validTo: data.validTo,
        applyToDetail: data.applyToDetail,
        applyToGros: data.applyToGros,
        productId: data.targetType === "product" ? data.targetId : null,
        categoryId: data.targetType === "category" ? data.targetId : null,
      },
    });

    return NextResponse.json(discount);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Promotion introuvable" },
        { status: 404 },
      );
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "Cible invalide (produit ou categorie introuvable)" },
        { status: 400 },
      );
    }
    console.error("Erreur mise a jour promotion:", error);
    return NextResponse.json(
      { error: "Erreur mise a jour de la promotion" },
      { status: 500 },
    );
  }
}
