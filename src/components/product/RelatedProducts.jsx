import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { computeEffectiveDiscount } from "@/lib/pricing";

export function RelatedProducts({ products, customerType }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => {
        const discount = computeEffectiveDiscount(product, customerType);
        const basePrice =
          customerType === "GROS"
            ? Number(product.priceGros)
            : Number(product.priceDetail);
        const finalPrice = discount ? discount.finalPrice : basePrice;
        const primaryImage = product.images?.[0];

        return (
          <Link
            key={product.id}
            href={`/produit/${product.slug}`}
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-mechanic-500/30"
          >
            <div className="relative aspect-square bg-navy-800 overflow-hidden">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt || product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-offwhite-100/20">
                  <Package className="h-10 w-10" />
                </div>
              )}

              {discount && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-mechanic-500 text-white text-[10px] font-bold">
                  −{discount.percentage}%
                </span>
              )}
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between">
              <p className="text-xs font-medium text-white line-clamp-2 mb-2 group-hover:text-mechanic-400 transition-colors">
                {product.name}
              </p>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-display text-sm font-bold text-mechanic-400">
                  {Math.round(finalPrice).toLocaleString("fr-FR")}
                </span>
                <span className="text-[10px] text-offwhite-100/40">GNF</span>
                {discount && (
                  <span className="text-[10px] text-offwhite-100/30 line-through ml-auto">
                    {Math.round(basePrice).toLocaleString("fr-FR")}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
