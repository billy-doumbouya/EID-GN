// src/components/ProductGallery.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

// Galerie de la fiche produit : slider principal (fleches + pagination),
// synchronise avec une rangee de miniatures cliquables en dessous.
// Si une seule image (ou fallback), on evite le poids de Swiper et on
// affiche simplement l'image statique, comme avant.
export function ProductGallery({ images, productName }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-xl bg-offwhite-200">
        <Image
          src={images[0].url}
          alt={images[0].alt || productName}
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Swiper
        modules={[Navigation, Pagination, Thumbs]}
        navigation
        pagination={{ clickable: true }}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        className="product-gallery-main aspect-square overflow-hidden rounded-xl bg-offwhite-200"
      >
        {images.map((img, i) => (
          <SwiperSlide key={img.id ?? i}>
            <div className="relative h-full w-full">
              <Image
                src={img.url}
                alt={img.alt || `${productName} — photo ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        onSwiper={setThumbsSwiper}
        modules={[Thumbs]}
        watchSlidesProgress
        slidesPerView={4.5}
        spaceBetween={10}
        className="product-gallery-thumbs"
      >
        {images.map((img, i) => (
          <SwiperSlide key={img.id ?? i} className="cursor-pointer">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-navy-800/10 opacity-60 transition-opacity [.swiper-slide-thumb-active_&]:border-mechanic-500 [.swiper-slide-thumb-active_&]:opacity-100">
              <Image src={img.url} alt="" fill className="object-cover" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Style des fleches/puces Swiper aux couleurs du site, scope a cette
          galerie uniquement (classes .swiper-* globales, non stylables via
          className Tailwind directement). */}
      <style jsx global>{`
        .product-gallery-main .swiper-button-next,
        .product-gallery-main .swiper-button-prev {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.85);
          border-radius: 9999px;
          backdrop-filter: blur(4px);
        }
        .product-gallery-main .swiper-button-next::after,
        .product-gallery-main .swiper-button-prev::after {
          font-size: 14px;
          font-weight: 700;
          color: #1a2332;
        }
        .product-gallery-main .swiper-pagination-bullet-active {
          background: #ea580c;
        }
      `}</style>
    </div>
  );
}
