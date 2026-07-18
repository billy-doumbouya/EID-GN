import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductEditForm } from "@/components/admin/ProductEditForm";
import { ProductImageManager } from "@/components/admin/ProductImageManager";

export const metadata = { title: "Modifier un produit" };

export default async function AdminProductEditPage({ params }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  // Les Decimal Prisma ne sont pas serialisables tels quels vers un
  // Client Component : on les convertit en number avant de passer les
  // props (idem pattern que ProductCard cote catalogue public).
  const serialized = {
    ...product,
    priceDetail: Number(product.priceDetail),
    priceGros: Number(product.priceGros),
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Modifier « {product.name} »
      </h1>

      <ProductEditForm product={serialized} categories={categories} />

      <ProductImageManager
        productId={product.id}
        initialImages={product.images}
      />
    </div>
  );
}
