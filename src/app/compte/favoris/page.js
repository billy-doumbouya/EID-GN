// src/app/compte/favoris/page.js
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProductCard } from "@/components/ProductCard";

export const metadata = { title: "Mes Favoris | EID-GN" };

export default async function FavoritesPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/connexion?next=/compte/favoris");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
  });

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Hero Header Favoris */}
      <div className="relative overflow-hidden rounded-2xl border border-navy-800/10 bg-white p-6 md:p-8 shadow-sm">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center sm:flex-row sm:text-left sm:gap-6">
          <div className="relative mb-4 sm:mb-0">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 text-rose-500 ring-4 ring-white shadow-xs">
              <Heart size={36} className="fill-rose-500/20 stroke-rose-500" />
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display text-2xl font-bold text-navy-900 md:text-3xl">
                Mes Favoris
              </h1>
              <span className="inline-flex items-center justify-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-500/20">
                {favorites.length}
              </span>
            </div>
            <p className="text-xs text-navy-800/60 max-w-md">
              Retrouvez l'ensemble des pièces et équipements que vous avez mis
              de côté pour vos futurs achats.
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-navy-800/10 bg-white p-12 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-offwhite-100 text-navy-800/30">
            <Heart size={32} />
          </div>
          <h2 className="text-base font-semibold text-navy-900">
            Votre liste de favoris est vide
          </h2>
          <p className="mt-1 text-xs text-navy-800/50 max-w-sm">
            Vous n'avez pas encore ajouté de produit. Parcourez notre catalogue
            et cliquez sur le cœur pour enregistrer vos articles préférés.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-xs font-medium text-white transition-all hover:bg-navy-800 shadow-sm"
          >
            <ShoppingBag size={15} />
            Découvrir le catalogue
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {favorites.map((fav) => (
              <ProductCard
                key={fav.id}
                product={{
                  ...fav.product,
                  price: Number(fav.product.priceDetail),
                  image:
                    fav.product.images[0]?.url || "/placeholder-product.jpg",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
