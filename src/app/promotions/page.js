// src/app/(shop)/promotions/page.js
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProductCard } from "@/components/ProductCard";
import { ZigzagDivider } from "@/components/ZigzagDivider";

export const metadata = { title: "Promotions" };

async function getPromotedProducts(now, customerType) {
  const isGros = customerType === "GROS";
  const eligibilityFilter = {
    validFrom: { lte: now },
    validTo: { gte: now },
    ...(isGros ? { applyToGros: true } : { applyToDetail: true }),
  };

  // Meme logique d'eligibilite que computePrice : une reduction doit non
  // seulement etre dans sa periode de validite, mais aussi s'appliquer au
  // type de client (gros/detail) qui consulte cette page. Sans ce filtre,
  // un produit avec une promo "gros uniquement" apparaitrait ici pour un
  // visiteur detail sans que son prix affiche soit reellement reduit.
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
      discounts: { where: eligibilityFilter },
      category: {
        include: { discounts: { where: eligibilityFilter } },
      },
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

export default async function PromotionsPage() {
  const now = new Date();
  const session = await getCurrentUser();

  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.sub },
        select: { customerType: true },
      })
    : null;

  const products = await getPromotedProducts(
    now,
    user?.customerType || "DETAIL",
  );

  const favoriteIds = await getFavoriteIds(
    session?.sub,
    products.map((p) => p.id),
  );

  return (
    <>
      <div className="bg-navy-900 py-10 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-3xl font-bold">Promotions</h1>
          <p className="mt-1 text-white/60">
            Les offres en cours sur nos motos, tricycles et pieces
          </p>
        </div>
      </div>

      <ZigzagDivider color="var(--color-navy-900)" flip />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {products.length === 0 ? (
          <div className="rounded-xl border border-navy-800/10 bg-white py-16 text-center">
            <p className="text-sm text-navy-800/60">
              Aucune promotion en cours pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorited={favoriteIds.has(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
