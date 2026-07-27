import { prisma } from "@/lib/prisma";
import { PromotionForm } from "@/components/admin/PromotionForm";

export const metadata = { title: "Nouvelle promotion" };

export default async function NewPromotionPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Nouvelle promotion
      </h1>
      <PromotionForm mode="create" products={products} categories={categories} />
    </div>
  );
}
