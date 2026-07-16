// src/app/(shop)/tricycles/page.js
import { CatalogGrid } from "@/components/CatalogGrid";
import { getCategoriesByType } from "@/lib/queries/categories";

export const metadata = { title: "Tricycles" };
export const revalidate = 3600;

export default async function TricyclesPage() {
  const categories = await getCategoriesByType("TRICYCLE");

  return (
    <CatalogGrid type="TRICYCLE" title="Tricycles" categories={categories} />
  );
}
