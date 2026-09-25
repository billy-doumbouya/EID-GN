// src/app/(admin)/admin/promotions/nouvelle/page.js
import { prisma } from "@/lib/prisma";
import { PromotionForm } from "@/components/admin/PromotionForm";

export const metadata = { title: "Nouvelle promotion" };

export default async function NewPromotionPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true },
      select: { id: true, name: true, sku: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <PromotionForm mode="create" products={products} categories={categories} />;
}
