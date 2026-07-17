// src/app/(shop)/promotions/page.js
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { GearPattern } from "@/components/stats/AboutStats/GearPattern";
import { Reveal } from "@/components/motion/Reveal";
import { ZigzagDivider } from "@/components/ZigzagDivider";
import { computePrice } from "@/lib/pricing/computePrice";

export const metadata = { title: "Promotions" };
export const revalidate = 300; // regenere au plus toutes les 5 min, pas de hit DB a chaque visite

// Un produit est "en promo" s'il a au moins une Discount active, directement
// ou via sa categorie. compareAtPrice n'est pas stocke : le prix barre est
// toujours recalcule a partir de Discount via computePrice (voir ProductCard).
async function getPromoProducts() {
  const now = new Date();
  const activeWindow = { validFrom: { lte: now }, validTo: { gte: now } };

  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      OR: [
        { discounts: { some: activeWindow } },
        { category: { discounts: { some: activeWindow } } },
      ],
    },
    include: {
      images: true,
      discounts: { where: activeWindow },
      category: { include: { discounts: { where: activeWindow } } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialisation obligatoire : priceDetail/priceGros/discount.value sont des
  // instances Decimal (classe), que React interdit de passer telles quelles
  // d'un Server Component vers un Client Component (ProductCard). Ce
  // JSON round-trip les convertit en valeurs plates (string/number/ISO date).
  return JSON.parse(JSON.stringify(products));
}

// Meilleur taux de reduction affiche dans le hero, calcule a partir du meme
// computePrice que celui utilise par ProductCard (une seule source de verite).
function getBestDiscount(products) {
  if (products.length === 0) return 0;

  const rates = products.map((p) => {
    const { unitPrice, originalPrice } = computePrice(p, 1);
    if (!originalPrice || originalPrice <= unitPrice) return 0;
    return Math.round((1 - unitPrice / originalPrice) * 100);
  });

  return Math.max(...rates, 0);
}

export default async function PromotionsPage() {
  const products = await getPromoProducts();
  const bestDiscount = getBestDiscount(products);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 py-14 text-white md:py-20">
        <GearPattern className="absolute inset-0 text-white" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-wide text-mechanic-400">
              Offres du moment
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight md:text-5xl">
              {bestDiscount > 0 ? (
                <>
                  Jusqu'a{" "}
                  <span className="text-mechanic-400">-{bestDiscount}%</span>{" "}
                  sur une selection de pieces
                </>
              ) : (
                "Nos promotions"
              )}
            </h1>
            <p className="mt-4 text-white/70">
              Stock limite, verifie et livre a Kankan. Les prix baissent, pas la
              qualite.
            </p>
          </Reveal>
        </div>
      </section>

      <ZigzagDivider color="var(--color-offwhite-100)" />

      {/* Grille produits */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {products.length === 0 ? (
          <Reveal>
            <div className="mx-auto max-w-md rounded-xl border border-navy-800/10 bg-white py-16 text-center">
              <p className="font-display text-lg font-semibold text-navy-900">
                Aucune promotion en cours
              </p>
              <p className="mt-2 text-sm text-navy-800/60">
                Revenez bientot, de nouvelles offres arrivent regulierement.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={Math.min(i * 0.05, 0.3)}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
