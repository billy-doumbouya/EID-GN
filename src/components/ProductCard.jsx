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
import { FavoriteButton } from "@/components/FavoriteButton";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const stockLabel = cva(
  "inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-xl shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]",
  {
    variants: {
      status: {
        out: "text-rose-600 bg-[#e6eef8]",
        low: "text-amber-600 bg-[#e6eef8]",
        in: "text-emerald-600 bg-[#e6eef8]",
      },
    },
  },
);

const addButton = cva(
  "mt-3 w-full rounded-2xl py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98]",
  {
    variants: {
      status: {
        out: "cursor-not-allowed bg-[#e6eef8] text-slate-400 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff] opacity-70",
        low: "bg-[#e6eef8] text-mechanic-500 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff] hover:shadow-[3px_3px_6px_#c3cad3,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]",
        in: "bg-[#e6eef8] text-mechanic-500 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff] hover:shadow-[3px_3px_6px_#c3cad3,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]",
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

export function ProductCard({ product, isFavorited = false }) {
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
        "group relative flex flex-col overflow-hidden rounded-3xl bg-[#e6eef8] p-3.5",
        "shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff]",
        "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[12px_12px_24px_#c3cad3,-12px_-12px_24px_#ffffff]",
      )}
    >
      {/* ZONE IMAGE / CARROUSEL */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-[#e6eef8] shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff]"
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
              delay: 1500,
              disableOnInteraction: false,
              enabled: false,
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

        {/* Badge réduction Soft UI */}
        {compareAtPrice && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-xl bg-[#e6eef8] px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-rose-600 shadow-[3px_3px_6px_#c3cad3,-3px_-3px_6px_#ffffff]">
            -{Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
          </span>
        )}

        {/* Bouton favori */}
        <div className="absolute right-2.5 top-2.5 z-10">
          <FavoriteButton
            productId={product.id}
            initialFavorited={isFavorited}
          />
        </div>
      </Link>

      {/* CONTENU & INFORMATIONS */}
      <div className="flex flex-1 flex-col pt-3.5 px-1">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={stockLabel({ status })}>
            {status === "out" && "Rupture"}
            {status === "low" && `Reste ${product.stock}`}
            {status === "in" && "En stock"}
          </span>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="text-xs font-bold text-slate-800 transition-colors group-hover:text-mechanic-500 line-clamp-2 leading-relaxed"
        >
          {product.name}
        </Link>

        {/* PIED DU CARD : PRIX ET BOUTON */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-900">
              {price.toLocaleString("fr-FR")} GNF
            </span>
            {compareAtPrice && (
              <span className="text-[11px] text-slate-400 line-through font-medium">
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
          background: #e6eef8;
          opacity: 0.7;
          margin: 0 3px !important;
          box-shadow:
            1px 1px 3px #c3cad3,
            -1px -1px 3px #ffffff;
        }
        .product-card-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #ea580c;
          width: 14px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
