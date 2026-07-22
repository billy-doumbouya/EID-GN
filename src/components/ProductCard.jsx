// src/components/ProductCard.jsx
"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { toast } from "sonner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useCartStore } from "@/lib/cartStore";
import { cn } from "@/lib/utiles";
import { computePrice } from "@/lib/pricing/computePrice";

import "swiper/css";
import "swiper/css/pagination";

const stockLabel = cva("text-xs font-medium", {
  variants: {
    status: {
      out: "text-danger",
      low: "text-amber-500",
      in: "text-success",
    },
  },
});

const addButton = cva(
  "mt-3 w-full rounded-lg py-2 text-sm font-medium text-white transition-colors active:scale-95",
  {
    variants: {
      status: {
        out: "cursor-not-allowed bg-navy-800/20",
        low: "bg-navy-900 hover:bg-mechanic-500",
        in: "bg-navy-900 hover:bg-mechanic-500",
      },
    },
  },
);

function getStockStatus(product) {
  if (product.stock <= 0) return "out";
  if (product.stock <= product.lowStockAlert) return "low";
  return "in";
}

// Les Decimal Prisma arrivent comme des objets (ou des strings selon le
// serializer) cote client : on force la conversion avant tout affichage/calcul.
function toNumber(value) {
  return value == null ? 0 : Number(value);
}

// Toutes les images du produit, avec l'image isPrimary toujours en tete
// (c'est elle qui sert de couverture et de premier slide), les autres
// triees par position. Fallback local si le produit n'en a aucune.
// Remplace l'ancien getPrimaryImageUrl() qui ne renvoyait qu'une seule URL :
// on garde le tableau complet pour le slider, tout en respectant la meme
// notion d'image primaire que le reste de l'app (cf. CatalogGrid).
function getCardImages(product) {
  const images = product.images || [];
  if (images.length === 0) return [{ url: "/placeholder-product.jpg" }];

  const sorted = [...images].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );
  const primaryIndex = sorted.findIndex((img) => img.isPrimary);
  if (primaryIndex <= 0) return sorted;

  const [primary] = sorted.splice(primaryIndex, 1);
  return [primary, ...sorted];
}

export function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const status = getStockStatus(product);
  const isOutOfStock = status === "out";
  const swiperRef = useRef(null);

  const images = getCardImages(product);
  const hasMultipleImages = images.length > 1;
  // Image de couverture utilisee pour le panier : toujours la premiere
  // (position 0), independamment du slide affiche au moment du clic.
  const coverImageUrl = images[0].url;

  // Prix catalogue = quantite 1 (prix detail sauf promo active).
  // Necessite que la requete Prisma inclue product.discounts et
  // product.category.discounts, sinon computePrice ne verra aucune promo.
  const { unitPrice, originalPrice } = computePrice(product, 1);
  const price = unitPrice;
  const compareAtPrice = originalPrice > unitPrice ? originalPrice : null;

  function handleAdd() {
    addItem(
      {
        id: product.id,
        name: product.name,
        price,
        image: coverImageUrl,
        stock: product.stock,
      },
      1,
    );
    toast.success(`${product.name} ajoute au panier`);
  }

  // Cycle auto au survol (desktop) ; sur mobile il n'y a pas de hover donc
  // le swipe tactile natif de Swiper prend le relais tout seul.
  function handleMouseEnter() {
    swiperRef.current?.autoplay?.start();
  }

  function handleMouseLeave() {
    const s = swiperRef.current;
    if (!s) return;
    s.autoplay?.stop();
    s.slideTo(0, 200);
  }

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-navy-800/10 bg-white",
        "transition-[transform,box-shadow] duration-200 ease-out",
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-navy-900/5",
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-offwhite-200"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {hasMultipleImages ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            onSwiper={(s) => (swiperRef.current = s)}
            autoplay={{ delay: 900, disableOnInteraction: false }}
            loop
            pagination={{ clickable: false }}
            className="product-card-swiper h-full w-full"
          >
            {images.map((img, i) => (
              <SwiperSlide key={img.id ?? i}>
                <div className="relative h-full w-full">
                  <Image
                    src={img.url}
                    alt={img.alt || product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.06]">
            <Image
              src={coverImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        )}

        {compareAtPrice && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-amber-500 px-2 py-1 text-xs font-semibold text-navy-900">
            -{Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-navy-900 line-clamp-2"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-semibold text-mechanic-500">
            {price.toLocaleString("fr-FR")} GNF
          </span>
          {compareAtPrice && (
            <span className="text-xs text-navy-800/40 line-through">
              {compareAtPrice.toLocaleString("fr-FR")} GNF
            </span>
          )}
        </div>

        <div className="mt-1">
          <span className={stockLabel({ status })}>
            {status === "out" && "Rupture de stock"}
            {status === "low" && `Stock limite (${product.stock})`}
            {status === "in" && "En stock"}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={addButton({ status })}
        >
          {isOutOfStock ? "Indisponible" : "Ajouter au panier"}
        </button>
      </div>

      {/* Style des puces de pagination Swiper, scope a cette carte uniquement.
          Necessaire car les classes .swiper-pagination-* sont globales et
          non stylables directement via className Tailwind. */}
      <style jsx global>{`
        .product-card-swiper .swiper-pagination {
          bottom: 8px;
        }
        .product-card-swiper .swiper-pagination-bullet {
          width: 5px;
          height: 5px;
          background: #fff;
          opacity: 0.6;
        }
        .product-card-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #ea580c;
        }
      `}</style>
    </div>
  );
}
