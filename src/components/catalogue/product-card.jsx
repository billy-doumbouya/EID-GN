"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useCartStore } from "@/lib/cartStore";
import { computePrice } from "@/lib/pricing/computePrice";

function getStockStatus(product) {
  if (product.stock <= 0) return { label: "Rupture", variant: "danger", isOut: true };
  if (product.stock <= (product.lowStockAlert || 3)) {
    return { label: `Reste ${product.stock}`, variant: "warning", isOut: false };
  }
  return { label: "En stock", variant: "success", isOut: false };
}

export function ProductCard({
  product,
  isFavorited = false,
  discount,
  customerType = "DETAIL",
}) {
  const addItem = useCartStore((s) => s.addItem);
  const stockInfo = getStockStatus(product);

  const images = product.images || [];
  const primaryImage =
    images.find((img) => img.isPrimary) || images[0] || null;
  const slideshowImages = primaryImage
    ? [primaryImage, ...images.filter((img) => img !== primaryImage)]
    : [];
  const coverUrl = primaryImage?.url || "/placeholder-product.jpg";
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const updateInputMode = () => setIsTouchDevice(mediaQuery.matches);

    updateInputMode();
    mediaQuery.addEventListener("change", updateInputMode);
    return () => mediaQuery.removeEventListener("change", updateInputMode);
  }, []);

  useEffect(() => {
    if (slideshowImages.length < 2 || (!isTouchDevice && !isHovered)) return;

    const interval = window.setInterval(() => {
      setActiveImageIndex((currentIndex) =>
        (currentIndex + 1) % slideshowImages.length,
      );
    }, 2200);

    return () => window.clearInterval(interval);
  }, [isHovered, isTouchDevice, slideshowImages.length]);

  const activeImage = slideshowImages[activeImageIndex] || primaryImage;

  // Calcul du prix et des promos actives
  const { unitPrice, originalPrice } = computePrice(product, 1);
  const price = unitPrice;
  const compareAtPrice = originalPrice > unitPrice ? originalPrice : null;
  const discountPercent = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  const effectivePrice = discount ? discount.finalPrice : price;

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();

    if (stockInfo.isOut) return;

    addItem(
      {
        id: product.id,
        name: product.name,
        price: effectivePrice,
        image: coverUrl,
        stock: product.stock,
      },
      1
    );

    toast.success(`${product.name} ajouté au panier`);
  }

  // Support des deux conventions de liens (/products/[slug] existant et /produit/[slug] cible)
  const productHref = `/products/${product.slug}`;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-navy-900/5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-3 sm:p-4">
      {/* Zone Image 1:1 responsive */}
      <Link
        href={productHref}
        className="relative block aspect-square w-full overflow-hidden rounded-xl bg-offwhite-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          if (!isTouchDevice) setActiveImageIndex(0);
        }}
      >
        <Image
          src={activeImage?.url || coverUrl}
          alt={activeImage?.alt || product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {slideshowImages.length > 1 && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-2.5 z-10 flex justify-center gap-1.5"
            aria-hidden="true"
          >
            {slideshowImages.map((image, index) => (
              <span
                key={image.id ?? image.url ?? index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeImageIndex
                    ? "w-4 bg-white shadow-sm"
                    : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        {/* Badge réduction si applicable */}
        {discount ? (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-mechanic-500 text-white text-xs font-bold shadow-glow-mechanic">
            −{discount.percentage}%
          </div>
        ) : discountPercent ? (
          <Badge
            variant="promo"
            className="absolute top-2.5 left-2.5 z-10 text-[10px] uppercase font-bold"
          >
            -{discountPercent}%
          </Badge>
        ) : null}

        {/* Bouton favori discret */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <FavoriteButton
            productId={product.id}
            initialFavorited={isFavorited}
          />
        </div>
      </Link>

      {/* Détails du produit */}
      <div className="flex flex-col flex-1 pt-3.5">
        {/* Statut de stock */}
        <div className="mb-1.5 flex items-center justify-between">
          <Badge variant={stockInfo.variant} className="text-[10px] px-2 py-0.5">
            {stockInfo.label}
          </Badge>
          {product.category?.name && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-navy-800/40 truncate max-w-30">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Nom du produit */}
        <Link
          href={productHref}
          className="font-sans text-xs sm:text-sm font-bold text-navy-900 line-clamp-2 leading-snug group-hover:text-mechanic-500 transition-colors"
        >
          {product.name}
        </Link>

        {/* Prix & Bouton Ajouter */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2 mb-2.5">
            {discount ? (
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold text-mechanic-400">
                  {Math.round(discount.finalPrice).toLocaleString("fr-FR")} GNF
                </span>
                <span className="text-xs text-navy-800/40 line-through">
                  {Math.round(discount.originalPrice).toLocaleString("fr-FR")}
                </span>
              </div>
            ) : compareAtPrice ? (
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold text-mechanic-400">
                  {Number(price).toLocaleString("fr-FR")} GNF
                </span>
                <span className="text-xs text-navy-800/40 line-through">
                  {Number(compareAtPrice).toLocaleString("fr-FR")} GNF
                </span>
              </div>
            ) : (
              <span className="font-display text-xl font-bold text-mechanic-400">
                {Number(
                  customerType === "GROS" ? product.priceGros : product.priceDetail
                ).toLocaleString("fr-FR")}{" "}
                GNF
              </span>
            )}
          </div>

          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={stockInfo.isOut}
            variant={stockInfo.isOut ? "secondary" : "primary"}
            size="sm"
            className="w-full text-xs font-semibold py-2.5 flex items-center justify-center gap-1.5"
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{stockInfo.isOut ? "Indisponible" : "Ajouter au panier"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
