// src/app/(shop)/pieces/page.js
import { CatalogGrid } from "@/components/CatalogGrid";
import { getCategoriesByType } from "@/lib/queries/categories";

export const metadata = { title: "Pieces detachees" };
export const revalidate = 3600;

export default async function PiecesPage() {
  const categories = await getCategoriesByType("PIECE");

  return (
    <CatalogGrid
      type="PIECE"
      title="Pieces detachees"
      categories={categories}
    />
  );
}
