export function ProductJsonLd({ product, finalPrice, categoryPath = [] }) {
  if (!product) return null;

  // Breadcrumb JSON-LD
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name:
          product.type === "MOTO"
            ? "Motos"
            : product.type === "TRICYCLE"
            ? "Tricycles"
            : "Pièces",
        item: `/catalogue?type=${product.type}`,
      },
      ...categoryPath.map((cat, i) => ({
        "@type": "ListItem",
        position: 3 + i,
        name: cat.name,
        item: `/catalogue?category=${cat.slug}`,
      })),
      {
        "@type": "ListItem",
        position: 3 + categoryPath.length,
        name: product.name,
        item: `/produit/${product.slug}`,
      },
    ],
  };

  // Product JSON-LD
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images?.map((img) => img.url) || [],
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "GNF",
      price: Math.round(finalPrice).toString(),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "EID-GN",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
    </>
  );
}
