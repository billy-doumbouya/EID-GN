import { prisma } from "@/lib/prisma";
import { CreateProductForm } from "@/components/admin/CreateProductForm";

export const metadata = { 
  title: "Nouveau Produit | Backoffice",
  description: "Création d'un nouveau produit au catalogue (Gros & Détail)"
};

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-50/50 pb-12 transition-all duration-300 ">
      {/* Conteneur fluide occupant toute la largeur disponible sans restriction de max-w */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-6">
        <CreateProductForm categories={categories} />
      </div>
    </main>
  );
}