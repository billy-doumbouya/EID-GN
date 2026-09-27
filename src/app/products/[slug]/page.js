import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  ChevronRight,
  Home,
  Tag,
  AlertCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductGallery } from "@/components/ProductGallery";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PromoCountdown } from "@/components/PromoCountdown";
import { ProductTabs } from "@/components/product/ProductTabs";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { ShareButton, CopySkuButton } from "@/components/product/ProductActions";
import { computeEffectiveDiscount } from "@/lib/pricing";

// ISR 60s — le catalogue change peu
export const revalidate = 60;

// ============================================================
// DATA FETCHING
// ============================================================
async function getProduct(slug) {
  return prisma.product.findUnique({
    where: { slug, isPublished: true },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] },
      compatibility: { include: { vehicleModel: true } },
      category: {
        include: {
          discounts: {
            where: {
              validFrom: { lte: new Date() },
              validTo: { gte: new Date() },
            },
          },
        },
      },
      discounts: {
        where: {
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() },
        },
      },
    },
  });
}

async function getIsFavorited(userId, productId) {
  if (!userId) return false;
  const favorite = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  return !!favorite;
}

async function getRelatedProducts(product) {
  // Produits de même catégorie ou type, exclusivement le produit courant
  return prisma.product.findMany({
    where: {
      isPublished: true,
      id: { not: product.id },
      OR: [
        { categoryId: product.categoryId },
        { type: product.type },
      ],
    },
    take: 4,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      discounts: {
        where: {
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

async function getCategoryPath(category) {
  // Récupère la hiérarchie complète de la catégorie
  if (!category) return [];
  const path = [category];
  let current = category;
  while (current.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: current.parentId },
    });
    if (!parent) break;
    path.unshift(parent);
    current = parent;
  }
  return path;
}

// ============================================================
// METADATA
// ============================================================
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const title = `${product.name} — ${Number(product.priceDetail).toLocaleString(
    "fr-FR"
  )} GNF | EID-GN`;

  return {
    title,
    description:
      product.description?.slice(0, 155) ||
      `Acheter ${product.name} chez EID-GN à Kankan. Livraison 24-48h en Haute-Guinée, paiement mobile money.`,
    openGraph: {
      title,
      description:
        product.description?.slice(0, 155) ||
        `Acheter ${product.name} chez EID-GN.`,
      images: product.images.map((img) => ({
        url: img.url,
        width: 1200,
        height: 1200,
        alt: product.name,
      })),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: product.description?.slice(0, 155),
    },
  };
}

// ============================================================
// PAGE
// ============================================================
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const session = await getCurrentUser();

  // Récupérer le customerType du user connecté
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.sub },
        select: { customerType: true, id: true },
      })
    : null;
  const customerType = user?.customerType || "DETAIL";

  const [isFavorited, relatedProducts, categoryPath] = await Promise.all([
    getIsFavorited(user?.id, product.id),
    getRelatedProducts(product),
    getCategoryPath(product.category),
  ]);

  // Calcul du prix effectif (avec remise si applicable)
  const discount = computeEffectiveDiscount(product, customerType);
  const basePrice =
    customerType === "GROS"
      ? Number(product.priceGros)
      : Number(product.priceDetail);
  const finalPrice = discount ? discount.finalPrice : basePrice;
  const isOnPromo = !!discount;

  // Stock réservé (en cours dans paniers autres clients)
  const availableStock = Math.max(0, product.stock - (product.reservedStock || 0));
  const productTabsData = {
    description: product.description,
    sku: product.sku,
    lowStockAlert: product.lowStockAlert,
    category: product.category ? { name: product.category.name } : null,
    compatibility: product.compatibility.map((compatibility) => ({
      id: compatibility.id,
      vehicleModel: compatibility.vehicleModel
        ? {
            brand: compatibility.vehicleModel.brand,
            name: compatibility.vehicleModel.name,
          }
        : null,
    })),
  };

  return (
    <main className="relative min-h-screen bg-navy-950 text-offwhite-100 pb-16">
      {/* SEO : JSON-LD Product + Breadcrumb */}
      <ProductJsonLd
        product={product}
        finalPrice={finalPrice}
        categoryPath={categoryPath}
      />

      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-6 md:pt-10">
        {/* ============================================================
            FIL D'ARIANE
            ============================================================ */}
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center gap-1.5 text-xs text-offwhite-100/50 mb-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <Link href="/" className="hover:text-mechanic-400 transition-colors">
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link
            href={`/catalogue?type=${product.type}`}
            className="hover:text-mechanic-400 transition-colors"
          >
            {product.type === "MOTO"
              ? "Motos"
              : product.type === "TRICYCLE"
              ? "Tricycles"
              : "Pièces"}
          </Link>
          {categoryPath.map((cat) => (
            <span key={cat.id} className="contents">
              <ChevronRight className="h-3 w-3 shrink-0" />
              <Link
                href={`/catalogue?category=${cat.slug}`}
                className="hover:text-mechanic-400 transition-colors"
              >
                {cat.name}
              </Link>
            </span>
          ))}
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-offwhite-100/80 truncate">{product.name}</span>
        </nav>

        {/* ============================================================
            CARTE PRINCIPALE
            ============================================================ */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* GALERIE (sticky sur desktop) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* DÉTAILS */}
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {product.category && (
                    <Link
                      href={`/catalogue?category=${product.category.slug}`}
                      className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-mechanic-400 hover:text-mechanic-300"
                    >
                      <Tag className="h-3 w-3" />
                      {product.category.name}
                    </Link>
                  )}
                  <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                    {product.name}
                  </h1>
                  <CopySkuButton sku={product.sku} />
                </div>

                {/* Favoris + Partage */}
                <div className="flex items-center gap-2 shrink-0">
                  <ShareButton slug={product.slug} title={product.name} />
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-1">
                    <FavoriteButton
                      productId={product.id}
                      initialFavorited={isFavorited}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Promo countdown (si vraie promo) */}
            {isOnPromo && discount.validTo && (
              <div className="rounded-2xl border border-mechanic-500/30 bg-mechanic-500/[0.05] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-mechanic-500 text-white text-[10px] font-bold">
                    <Tag className="h-2.5 w-2.5" />
                    Promo
                  </span>
                  <span className="text-xs font-semibold text-mechanic-400">
                    {discount.type === "POURCENTAGE"
                      ? `−${discount.value}%`
                      : `−${discount.value.toLocaleString("fr-FR")} GNF`}
                  </span>
                </div>
                <PromoCountdown
                  targetDate={discount.validTo}
                  label="Offre se termine dans"
                />
              </div>
            )}

            {/* ============================================================
                CTA AJOUT PANIER
                ============================================================ */}
            <ProductPurchasePanel
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                image: product.images[0]?.url,
                priceGros: product.priceGros
                  ? Number(product.priceGros)
                  : null,
                minQtyGros: product.minQtyGros,
                reservedStock: product.reservedStock || 0,
              }}
              basePrice={basePrice}
              finalPrice={finalPrice}
              customerType={customerType}
              discount={
                discount
                  ? {
                      name: discount.name,
                      savings: Number(discount.savings),
                    }
                  : null
              }
              isOnPromo={isOnPromo}
              availableStock={availableStock}
            />

            {/* Réassurance */}
            <div className="grid grid-cols-2 gap-3">
              <ReassuranceItem
                icon={Truck}
                title="Livraison 24-48h"
                desc="Kankan & Haute-Guinée"
              />
              <ReassuranceItem
                icon={ShieldCheck}
                title="Pièce certifiée"
                desc="Origine constructeur"
              />
            </div>

            {/* ============================================================
                ONGLETS (Description / Compatibilité / Livraison)
                ============================================================ */}
            <ProductTabs
              product={productTabsData}
              finalPrice={finalPrice}
            />

            {/* Signaler une erreur */}
            <div className="pt-4 border-t border-white/5">
              <Link
                href={`/contact?subject=erreur-produit&product=${product.sku}`}
                className="inline-flex items-center gap-1.5 text-xs text-offwhite-100/40 hover:text-mechanic-400 transition-colors"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Signaler une erreur sur cette fiche
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================================
            PRODUITS LIÉS
            ============================================================ */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-24">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-mechanic-500/40" />
              <h2 className="font-display text-xl md:text-2xl font-bold text-white">
                Vous aimerez aussi
              </h2>
              <span className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-mechanic-500/40" />
            </div>
            <RelatedProducts products={relatedProducts} customerType={customerType} />
          </section>
        )}
      </div>
    </main>
  );
}

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

function ReassuranceItem({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <Icon className="h-4 w-4 text-mechanic-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-white">{title}</p>
        <p className="text-[11px] text-offwhite-100/50">{desc}</p>
      </div>
    </div>
  );
}
