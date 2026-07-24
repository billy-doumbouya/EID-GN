// src/components/ProductCard.jsx
"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { toast } from "sonner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { useCartStore } from "@/lib/cartStore";
import { cn } from "@/lib/utiles";
import { computePrice } from "@/lib/pricing/computePrice";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const stockLabel = cva("text-[11px] font-semibold tracking-wide uppercase", {
  variants: {
    status: {
      out: "text-rose-600 bg-rose-50 px-2 py-0.5 rounded",
      low: "text-amber-600 bg-amber-50 px-2 py-0.5 rounded",
      in: "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded",
    },
  },
});

const addButton = cva(
  "mt-3 w-full rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-[0.98]",
  {
    variants: {
      status: {
        out: "cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200",
        low: "bg-navy-900 text-white hover:bg-mechanic-500 shadow-sm hover:shadow",
        in: "bg-navy-900 text-white hover:bg-mechanic-500 shadow-sm hover:shadow",
      },
    },
  },
);

function getStockStatus(product) {
  if (product.stock <= 0) return "out";
  if (product.stock <= product.lowStockAlert) return "low";
  return "in";
}

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
  const coverImageUrl = images[0].url;

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
    toast.success(`${product.name} ajouté au panier`);
  }

  // Activer l'autoplay uniquement au survol de cette carte spécifique
  function handleMouseEnter() {
    if (!swiperRef.current) return;
    swiperRef.current.autoplay.start();
  }

  function handleMouseLeave() {
    if (!swiperRef.current) return;
    swiperRef.current.autoplay.stop();
    swiperRef.current.slideTo(0, 300);
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-navy-900/5",
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-slate-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {hasMultipleImages ? (
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            onSwiper={(s) => (swiperRef.current = s)}
            autoplay={{
              delay: 1500, // Délai fixé à 1.5s
              disableOnInteraction: false,
              enabled: false, // Désactivé par défaut au démarrage
            }}
            loop
            pagination={{ clickable: true }}
            className="product-card-swiper h-full w-full"
          >
            {images.map((img, i) => (
              <SwiperSlide key={img.id ?? i}>
                <div className="relative h-full w-full">
                  <Image
                    src={img.url}
                    alt={img.alt || product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={i === 0}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="h-full w-full">
            <Image
              src={coverImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Badge réduction */}
        {compareAtPrice && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-rose-600 px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-white shadow-sm">
            -{Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={stockLabel({ status })}>
            {status === "out" && "Rupture"}
            {status === "low" && `Reste ${product.stock}`}
            {status === "in" && "En stock"}
          </span>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-semibold text-navy-900 transition-colors group-hover:text-mechanic-500 line-clamp-2"
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-navy-900">
              {price.toLocaleString("fr-FR")} GNF
            </span>
            {compareAtPrice && (
              <span className="text-xs text-slate-400 line-through">
                {compareAtPrice.toLocaleString("fr-FR")} GNF
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={addButton({ status })}
          >
            {isOutOfStock ? "Indisponible" : "Ajouter au panier"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .product-card-swiper .swiper-pagination {
          bottom: 8px !important;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .group:hover .product-card-swiper .swiper-pagination {
          opacity: 1;
        }
        .product-card-swiper .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          background: #ffffff;
          opacity: 0.6;
          margin: 0 3px !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        .product-card-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #ea580c;
          width: 14px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
