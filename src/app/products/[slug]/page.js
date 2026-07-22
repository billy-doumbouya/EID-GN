import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "./AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";

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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  // JSON-LD schema.org Product pour le SEO (rich snippets Google : prix, dispo)
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
      price: product.priceDetail.toString(),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-navy-800/50">
            Reference : {product.sku}
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-mechanic-500">
              {Number(product.priceDetail).toLocaleString("fr-FR")} GNF
            </span>
          </div>

          <p className="mt-4 text-sm text-navy-800/80">{product.description}</p>

          {product.compatibility.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-navy-900">
                Compatible avec
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.compatibility.map((c) => (
                  <span
                    key={c.id}
                    className="rounded-full bg-offwhite-200 px-3 py-1 text-xs text-navy-800"
                  >
                    {c.vehicleModel.brand} {c.vehicleModel.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <AddToCartButton
            product={{
              ...product,
              price: Number(product.priceDetail),
              image: product.images[0]?.url,
            }}
          />
        </div>
      </div>
    </div>
  );
}
