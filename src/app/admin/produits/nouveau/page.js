import { prisma } from "@/lib/prisma";
import { CreateProductForm } from "@/components/admin/CreateProductForm";

export const metadata = { title: "Nouveau Produit" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="lg:ml-64">
      <div className="p-6">
        <CreateProductForm categories={categories} />
      </div>
    </div>
  );
}
