import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PromotionForm } from "@/components/admin/PromotionForm";

export const metadata = { title: "Modifier la promotion" };

export default async function EditPromotionPage({ params }) {
  const { id } = params;

  const [discount, products, categories] = await Promise.all([
    prisma.discount.findUnique({ where: { id } }),
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

  if (!discount) {
    notFound();
  }

  return (
    <PromotionForm
      mode="edit"
      discount={discount}
      products={products}
      categories={categories}
    />
  );
}
