import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { discountSchema } from "@/lib/validations/discount";

// GET : liste des promotions, filtrable par statut temporel.
// ?status=active | expired | scheduled (omis = toutes)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const now = new Date();

    const where =
      status === "active"
        ? { validFrom: { lte: now }, validTo: { gte: now } }
        : status === "expired"
          ? { validTo: { lt: now } }
          : status === "scheduled"
            ? { validFrom: { gt: now } }
            : {};

    const discounts = await prisma.discount.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(discounts);
  } catch (error) {
    console.error("Erreur GET promotions:", error);
    return NextResponse.json(
      { error: "Erreur lecture des promotions" },
      { status: 500 },
    );
  }
}

// POST : creer une promotion (cible produit ou categorie)
export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = discountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Verifier que la cible existe reellement avant de creer la promo
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

    const discount = await prisma.discount.create({
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

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "Cible invalide (produit ou categorie introuvable)" },
        { status: 400 },
      );
    }
    console.error("Erreur creation promotion:", error);
    return NextResponse.json(
      { error: "Erreur creation promotion" },
      { status: 500 },
    );
  }
}
