// src/app/(shop)/promotions/page.js
import { Suspense } from "react";
import { Clock, Tag, Flame } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProductCard } from "@/components/ProductCard";
import { PromotionsHero } from "@/components/promotions/PromotionsHero";
import { PromotionsTabs } from "@/components/promotions/PromotionsTabs";
import { TopDeals } from "@/components/promotions/TopDeals";
import { PromotionsSkeleton } from "@/components/promotions/PromotionsSkeleton";
import { PromotionsJsonLd } from "@/components/seo/PromotionsJsonLd";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Promotions & Bons Plans — EID-MULTISERVICE",
  description:
    "Profitez de réductions exclusives sur nos motos, tricycles et pièces détachées en stock à Kankan et livrables partout en Guinée.",
};

function computeProductDiscount(product, customerType, now) {
  const isGros = customerType === "GROS";
  const basePrice = isGros
    ? Number(product.priceGros)
    : Number(product.priceDetail);

  const isValid = (d) => {
    const from = new Date(d.validFrom);
    const to = new Date(d.validTo);
    if (now < from || now > to) return false;
    return isGros ? d.applyToGros : d.applyToDetail;
  };

  // Priorité : remise sur le produit > remise sur la catégorie
  const activeDiscount =
    (product.discounts || []).find(isValid) ||
    (product.category?.discounts || []).find(isValid);

  if (!activeDiscount) return null;

  const value = Number(activeDiscount.value);
  let finalPrice = basePrice;
  let percentage = 0;

  if (activeDiscount.type === "POURCENTAGE") {
    percentage = Math.round(value);
    finalPrice = Math.max(0, basePrice * (1 - value / 100));
  } else {
    // MONTANT_FIXE
    finalPrice = Math.max(0, basePrice - value);
    percentage =
      basePrice > 0
        ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
        : 0;
  }

  const savings = Math.max(0, basePrice - finalPrice);

  return {
    percentage,
    finalPrice,
    originalPrice: basePrice,
    savings,
    validTo: activeDiscount.validTo,
  };
}

async function getPromotedProducts(now, customerType) {
  const isGros = customerType === "GROS";
  const eligibilityFilter = {
    validFrom: { lte: now },
    validTo: { gte: now },
    ...(isGros ? { applyToGros: true } : { applyToDetail: true }),
  };

  return prisma.product.findMany({
    where: {
      isPublished: true,
      OR: [
        { discounts: { some: eligibilityFilter } },
        { category: { discounts: { some: eligibilityFilter } } },
      ],
    },
    include: {
      images: true,
      category: {
        include: { discounts: { where: eligibilityFilter } },
      },
      discounts: { where: eligibilityFilter },
    },
    orderBy: { updatedAt: "desc" },
  });
}

async function getFavoriteIds(userId, productIds) {
  if (!userId || productIds.length === 0) return new Set();
  const favorites = await prisma.favorite.findMany({
    where: { userId, productId: { in: productIds } },
    select: { productId: true },
  });
  return new Set(favorites.map((f) => f.productId));
}

export default async function PromotionsPage({ searchParams }) {
  const params = await searchParams;
  const activeType = params?.type || "ALL";
  const sortBy = params?.sort || "discount";

  const now = new Date();
  const session = await getCurrentUser();

  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.sub },
        select: { customerType: true },
      })
    : null;

  const customerType = user?.customerType || "DETAIL";

  const rawProducts = await getPromotedProducts(now, customerType);

  // Attacher le discount calculé à chaque produit
  const productsWithDiscounts = rawProducts
    .map((product) => {
      const discount = computeProductDiscount(product, customerType, now);
      return { ...product, _discount: discount };
    })
    .filter((p) => p._discount !== null);

  // Statistiques globales pour le Hero
  const totalOffers = productsWithDiscounts.length;
  const maxDiscount =
    totalOffers > 0
      ? Math.max(...productsWithDiscounts.map((p) => p._discount.percentage))
      : 0;
  const totalSavings = productsWithDiscounts.reduce(
    (acc, p) => acc + (p._discount.savings || 0),
    0
  );

  // Top 3 des meilleures offres
  const topDeals = [...productsWithDiscounts]
    .sort((a, b) => b._discount.percentage - a._discount.percentage)
    .slice(0, 3);

  // Filtrage par type
  let filteredProducts = productsWithDiscounts;
  if (activeType !== "ALL") {
    filteredProducts = filteredProducts.filter((p) => p.type === activeType);
  }

  // Tri
  filteredProducts.sort((a, b) => {
    if (sortBy === "price-asc") {
      return a._discount.finalPrice - b._discount.finalPrice;
    }
    if (sortBy === "price-desc") {
      return b._discount.finalPrice - a._discount.finalPrice;
    }
    if (sortBy === "new") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    // "discount" par défaut
    return b._discount.percentage - a._discount.percentage;
  });

  const favoriteIds = await getFavoriteIds(
    session?.sub,
    filteredProducts.map((p) => p.id)
  );

  return (
    <main className="relative min-h-screen bg-navy-950 text-offwhite-100 overflow-hidden">
      <PromotionsJsonLd
        products={filteredProducts}
        customerType={customerType}
      />

      {/* Hero Section */}
      <PromotionsHero
        totalOffers={totalOffers}
        maxDiscount={maxDiscount}
        totalSavings={totalSavings}
      />

      {/* Top Deals Section */}
      {topDeals.length > 0 && (
        <section className="relative py-12 md:py-16 border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-8">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-mechanic-400">
                Sélection choc
              </span>
              <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold text-white">
                Les meilleures remises du moment
              </h2>
            </div>
            <Suspense fallback={<PromotionsSkeleton variant="top" count={3} />}>
              <TopDeals products={topDeals} />
            </Suspense>
          </div>
        </section>
      )}

      {/* Catalogue complet filtrable */}
      <section id="catalogue" className="relative py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                Toutes les offres
              </h2>
              <p className="mt-1 text-sm text-offwhite-100/60">
                {filteredProducts.length}{" "}
                {filteredProducts.length > 1
                  ? "articles remisés"
                  : "article remisé"}
              </p>
            </div>
            <PromotionsTabs activeType={activeType} sortBy={sortBy} />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center backdrop-blur-sm">
              <p className="text-sm text-offwhite-100/60">
                Aucune promotion ne correspond à votre filtre pour le moment.
              </p>
            </div>
          ) : (
            <Suspense fallback={<PromotionsSkeleton count={8} />}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorited={favoriteIds.has(product.id)}
                    discount={product._discount}
                    customerType={customerType}
                  />
                ))}
              </div>
            </Suspense>
          )}
        </div>
      </section>

      <section className="relative py-16 border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReassuranceItem
              icon={Clock}
              title="Offres à durée limitée"
              desc="Profitez-en avant la fin de la période promotionnelle indiquée sur chaque produit."
            />
            <ReassuranceItem
              icon={Tag}
              title="Stock réel vérifié"
              desc="Chaque produit en promo est en stock physique. Pas de mauvaise surprise au checkout."
            />
            <ReassuranceItem
              icon={Flame}
              title="Paiement mobile money"
              desc="Orange Money, MTN MoMo ou paiement à la livraison. Sans frais cachés."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function ReassuranceItem({ icon: Icon, title, desc }) {
  return (
    <div className="text-center md:text-left">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-mechanic-500/10 border border-mechanic-500/20 text-mechanic-400 mb-3">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="font-display text-base font-semibold text-white">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-offwhite-100/60 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
