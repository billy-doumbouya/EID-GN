// src/lib/pricing/computePrice.js

/**
 * Calcule le prix unitaire final d'un produit pour une quantite donnee,
 * en tenant compte du seuil gros et des promotions actives.
 *
 * @param {object} product - doit inclure priceDetail, priceGros, minQtyGros,
 *                            et ses discounts actifs preloades (product.discounts)
 *                            ainsi que ceux de sa categorie (product.category.discounts)
 * @param {number} quantity
 * @param {Date} [now] - injectable pour les tests
 */
export function computePrice(product, quantity, now = new Date()) {
  const isGrosPricing = quantity >= product.minQtyGros;
  const basePrice = isGrosPricing ? Number(product.priceGros) : Number(product.priceDetail);

  const activeDiscount = pickActiveDiscount(product, isGrosPricing, now);

  if (!activeDiscount) {
    return { unitPrice: basePrice, originalPrice: basePrice, discount: null, isGrosPricing };
  }

  const discounted = applyDiscount(basePrice, activeDiscount);

  return {
    unitPrice: discounted,
    originalPrice: basePrice,
    discount: { id: activeDiscount.id, name: activeDiscount.name },
    isGrosPricing,
  };
}

function pickActiveDiscount(product, isGrosPricing, now) {
  const isValid = (d) => {
    if (now < new Date(d.validFrom) || now > new Date(d.validTo)) return false;
    return isGrosPricing ? d.applyToGros : d.applyToDetail;
  };

  // Priorite : discount produit > discount categorie (confirme plus tot)
  const productDiscount = (product.discounts || []).find(isValid);
  if (productDiscount) return productDiscount;

  const categoryDiscount = (product.category?.discounts || []).find(isValid);
  if (categoryDiscount) return categoryDiscount;

  return null;
}

function applyDiscount(basePrice, discount) {
  const value = Number(discount.value);
  if (discount.type === "POURCENTAGE") {
    return Math.max(0, basePrice * (1 - value / 100));
  }
  // MONTANT_FIXE
  return Math.max(0, basePrice - value);
}