// src/lib/pricing.js
// Centralise la logique de calcul de prix (utilisé par la fiche produit + page promo + panier)

export function computeEffectiveDiscount(product, customerType) {
  if (!product) return null;

  const isGros = customerType === "GROS";
  const basePrice = isGros
    ? Number(product.priceGros || product.priceDetail || 0)
    : Number(product.priceDetail || 0);

  if (basePrice <= 0) return null;

  // Récupère toutes les remises applicables (produit + catégorie)
  const allDiscounts = [
    ...(product.discounts || []),
    ...(product.category?.discounts || []),
  ];

  if (allDiscounts.length === 0) return null;

  let bestDiscount = null;
  let bestPrice = basePrice;

  for (const d of allDiscounts) {
    const eligible = isGros ? d.applyToGros : d.applyToDetail;
    if (!eligible) continue;

    let discountedPrice = basePrice;
    if (d.type === "POURCENTAGE") {
      discountedPrice = basePrice * (1 - Number(d.value) / 100);
    } else if (d.type === "MONTANT_FIXE") {
      discountedPrice = basePrice - Number(d.value);
    }
    discountedPrice = Math.max(discountedPrice, 0);

    if (discountedPrice < bestPrice) {
      bestPrice = discountedPrice;
      bestDiscount = {
        name: d.name,
        type: d.type,
        value: Number(d.value),
        percentage:
          d.type === "POURCENTAGE"
            ? Number(d.value)
            : Math.round(((basePrice - discountedPrice) / basePrice) * 100),
        originalPrice: basePrice,
        finalPrice: discountedPrice,
        savings: basePrice - discountedPrice,
        validTo: d.validTo,
      };
    }
  }

  return bestDiscount;
}
