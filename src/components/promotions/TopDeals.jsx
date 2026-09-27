import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

export function TopDeals({ products }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {products.map((product, i) => {
        const discount = product._discount;
        const primaryImage = product.images?.[0];

        return (
          <Reveal key={product.id} delay={i * 0.1}>
            <Link
              href={`/products/${product.slug}`}
              className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:border-mechanic-500/40 hover:-translate-y-1.5"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
                {primaryImage ? (
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.alt || product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-navy-800" />
                )}

                <div className="absolute top-4 right-4 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-mechanic-500 text-white shadow-glow-mechanic">
                  <span className="font-display text-xl font-bold leading-none">
                    −{discount.percentage}%
                  </span>
                </div>

                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-mechanic-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-white line-clamp-1">
                  {product.name}
                </h3>
                <p className="mt-0.5 font-mono text-xs text-offwhite-100/40">
                  {product.sku}
                </p>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-mechanic-400">
                    {Math.round(discount.finalPrice).toLocaleString("fr-FR")} GNF
                  </span>
                  <span className="text-sm text-offwhite-100/40 line-through">
                    {Math.round(discount.originalPrice).toLocaleString("fr-FR")}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-mechanic-400 font-medium">
                    Vous économisez{" "}
                    {Math.round(discount.savings).toLocaleString("fr-FR")} GNF
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-offwhite-100/40">
                    <Clock className="w-3 h-3" />
                    <CountdownBadge validTo={discount.validTo} />
                  </span>
                </div>

                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  Voir l'offre
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

function CountdownBadge({ validTo }) {
  if (!validTo) return <span>Expire bientôt</span>;
  const days = Math.ceil(
    (new Date(validTo) - new Date()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 0) return <span>Expire bientôt</span>;
  if (days === 1) return <span>Expire demain</span>;
  return <span>{days} jours restants</span>;
}
