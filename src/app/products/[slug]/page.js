import { notFound } from "next/navigation";
import { ShieldCheck, Truck, PackageCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AddToCartButton } from "./AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PromoCountdown } from "@/components/PromoCountdown";

async function getProduct(slug) {
  const product = await prisma.product.findUnique({
    where: { slug, isPublished: true },
    include: {
      images: true,
      compatibility: { include: { vehicleModel: true } },
      category: true,
    },
  });
  return product;
}

async function getIsFavorited(userId, productId) {
  if (!userId) return false;
  const favorite = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  return !!favorite;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | EID-GN`,
    description:
      product.description?.slice(0, 155) ||
      `Acheter ${product.name} chez EID-GN Kankan.`,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const session = await getCurrentUser();
  const isFavorited = await getIsFavorited(session?.sub, product.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "GNF",
      price: product.priceDetail?.toString() || "0",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Container */}
      <div className="rounded-2xl border border-navy-800/10 bg-white p-6 md:p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Galerie Images */}
          <div className="relative">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Détails Produit */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              {/* Entête & Favori */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  {product.category && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-mechanic-500">
                      {product.category.name}
                    </span>
                  )}
                  <h1 className="font-display text-2xl font-bold text-navy-900 md:text-3xl">
                    {product.name}
                  </h1>
                </div>
                <div className="rounded-xl border border-navy-800/10 bg-offwhite-100/50 p-1">
                  <FavoriteButton
                    productId={product.id}
                    initialFavorited={isFavorited}
                  />
                </div>
              </div>

              <p className="mt-1 text-xs font-mono text-navy-800/40">
                Réf: {product.sku}
              </p>

              {/* Countdown / Urgence Marketing */}
              <div className="mt-4">
                <PromoCountdown targetHours={48} />
              </div>

              {/* Section Prix & Stock */}
              <div className="mt-5 flex flex-wrap items-baseline gap-3 rounded-xl bg-offwhite-100/60 p-4 border border-navy-800/5">
                <div>
                  <span className="text-3xl font-extrabold text-navy-900">
                    {Number(product.priceDetail).toLocaleString("fr-FR")}
                  </span>
                  <span className="ml-1.5 font-bold text-mechanic-500 text-sm">
                    GNF
                  </span>
                </div>

                {/* Stock Indicator */}
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
                    <PackageCheck size={13} />
                    {product.stock <= 5
                      ? `Plus que ${product.stock} en stock !`
                      : "En stock à Kankan"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-500/20">
                    Rupture de stock
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-5 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-800/50">
                  Description de la pièce
                </h3>
                <p className="text-sm leading-relaxed text-navy-800/80">
                  {product.description}
                </p>
              </div>

              {/* Compatibilités engins */}
              {product.compatibility?.length > 0 && (
                <div className="mt-5 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-800/50">
                    Engins compatibles
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {product.compatibility.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center rounded-lg border border-navy-800/10 bg-white px-2.5 py-1 text-xs font-medium text-navy-800/80 shadow-2xs"
                      >
                        {c.vehicleModel.brand} {c.vehicleModel.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bouton d'Achat & Rassurance */}
            <div className="space-y-4 pt-4 border-t border-navy-800/5">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: Number(product.priceDetail),
                  image: product.images[0]?.url,
                  stock: product.stock,
                  lowStockAlert: product.lowStockAlert,
                }}
              />

              {/* Badges de Réassurance Kankan */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 rounded-xl border border-navy-800/5 bg-offwhite-100/40 p-2.5 text-xs text-navy-800/70">
                  <Truck size={16} className="text-mechanic-500 shrink-0" />
                  <span>Livraison rapide à Kankan et régions</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-navy-800/5 bg-offwhite-100/40 p-2.5 text-xs text-navy-800/70">
                  <ShieldCheck
                    size={16}
                    className="text-emerald-600 shrink-0"
                  />
                  <span>Pièce d'origine certifiée EID-GN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
