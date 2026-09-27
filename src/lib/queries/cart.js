import { prisma } from "@/lib/prisma";
import { computePrice } from "@/lib/pricing/computePrice";

function activeDiscountsFilter(now) {
  return { validFrom: { lte: now }, validTo: { gte: now } };
}

export async function getCartQuote(items, customerType = "DETAIL") {
  if (!items || items.length === 0) return null;
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
      unavailable.push({ productId, reason: "Produit introuvable ou dépublié" });
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
      slug: product.slug,
      image: product.images[0]?.url || null,
      quantity,
      unitPrice: priced.unitPrice,
      originalPrice: priced.originalPrice,
      isGrosPricing: priced.isGrosPricing,
      discountName: priced.discount?.name || null,
      lineTotal: priced.unitPrice * quantity,
      availableStock: product.stock,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const discount = lines.reduce(
    (sum, l) => sum + Math.max(0, (l.originalPrice - l.unitPrice) * l.quantity),
    0
  );
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  return { lines, subtotal, discount, deliveryFee, total, unavailable };
}
