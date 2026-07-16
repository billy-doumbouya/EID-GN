// src/lib/queries/categories.js
import { prisma } from "@/lib/prisma";

export async function getCategoriesByType(type) {
  const categories = await prisma.category.findMany({
    where: {
      products: {
        some: { type, isPublished: true },
      },
    },
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });

  return categories.map((c) => ({ slug: c.slug, label: c.name }));
}