// src/app/api/cart/quote/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computePrice } from "@/lib/pricing/computePrice";

function activeDiscountsFilter(now) {
  return { validFrom: { lte: now }, validTo: { gte: now } };
}

// POST /api/cart/quote
// body: { items: [{ productId, quantity }] }
//
// Le store panier (cartStore.js) ne persiste volontairement aucun prix :
// tout est recalcule ici, a chaque appel, pour refleter les seuils gros
// (minQtyGros) et les promotions actives au moment exact de l'affichage.
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Corps de requete JSON invalide" },
        { status: 400 },
      );
    }

    const items = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    const now = new Date();
    const productIds = items.map((i) => i.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isPublished: true },
      include: {
        discounts: { where: activeDiscountsFilter(now) },
        category: {
          include: { discounts: { where: activeDiscountsFilter(now) } },
        },
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    const productById = Object.fromEntries(products.map((p) => [p.id, p]));

    const lines = [];
    const unavailable = [];

    for (const { productId, quantity } of items) {
      const product = productById[productId];
      if (!product) {
        unavailable.push({
          productId,
          reason: "Produit introuvable ou depublie",
        });
        continue;
      }
      if (product.stock < quantity) {
        unavailable.push({
          productId,
          reason: `Stock insuffisant (${product.stock} disponible(s))`,
        });
        continue;
      }

      const priced = computePrice(product, quantity, now);
      lines.push({
        productId,
        name: product.name,
        image: product.images[0]?.url || null,
        quantity,
        unitPrice: priced.unitPrice,
        originalPrice: priced.originalPrice,
        isGrosPricing: priced.isGrosPricing,
        discountName: priced.discount?.name || null,
        lineTotal: priced.unitPrice * quantity,
      });
    }

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

    return NextResponse.json({ lines, subtotal, unavailable });
  } catch (error) {
    console.error("Erreur POST /api/cart/quote:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul du panier" },
      { status: 500 },
    );
  }
}
