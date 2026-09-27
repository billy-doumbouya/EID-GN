export function PromotionsJsonLd({ products, customerType }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Promotions EID-MULTISERVICE",
    description: "Offres en cours sur motos, tricycles et pièces détachées",
    itemListElement: products.map((product, i) => {
      const price =
        customerType === "GROS"
          ? Number(product.priceGros)
          : Number(product.priceDetail);
      const finalPrice = product._discount?.finalPrice || price;

      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: product.name,
          sku: product.sku,
          image: product.images?.map((img) => img.url) || [],
          offers: {
            "@type": "Offer",
            priceCurrency: "GNF",
            price: Math.round(finalPrice),
            availability:
              product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        },
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
