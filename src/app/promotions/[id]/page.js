import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PromotionForm } from "@/components/admin/PromotionForm";

export const metadata = { title: "Modifier une promotion" };

export default async function EditPromotionPage({ params }) {
  const { id } = await params;

  const [discount, products, categories] = await Promise.all([
    prisma.discount.findUnique({ where: { id } }),
    prisma.product.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!discount) notFound();

  // Decimal -> number pour pouvoir passer la prop a un Client Component
  const serialized = { ...discount, value: Number(discount.value) };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Modifier « {discount.name} »
      </h1>
      <PromotionForm
        mode="edit"
        discount={serialized}
        products={products}
        categories={categories}
      />
    </div>
  );
}
