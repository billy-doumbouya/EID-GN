import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProductCard } from "@/components/ProductCard";

export const metadata = { title: "Favoris" };

export default async function FavoritesPage() {
  const session = await getCurrentUser();
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.sub },
    include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
  });

  if (favorites.length === 0) {
    return <p className="text-navy-800/60">Aucun favori pour le moment.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {favorites.map((fav) => (
        <ProductCard
          key={fav.id}
          product={{
            ...fav.product,
            price: Number(fav.product.price),
            image: fav.product.images[0]?.url || "/placeholder-product.jpg",
          }}
        />
      ))}
    </div>
  );
}
