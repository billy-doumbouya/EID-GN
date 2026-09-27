import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getFeaturedProducts = unstable_cache(
  async (limit = 8) => {
    const now = new Date();
    const activeWindow = { validFrom: { lte: now }, validTo: { gte: now } };

    const products = await prisma.product.findMany({
      where: { isPublished: true },
      include: {
        images: { orderBy: { position: "asc" } },
        category: {
          include: {
            discounts: { where: activeWindow },
          },
        },
        discounts: { where: activeWindow },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Sérialisation propre des objets Decimal Prisma pour les composants React
    return JSON.parse(JSON.stringify(products));
  },
  ["featured-products"],
  { revalidate: 60, tags: ["products"] }
);
