// src/app/(shop)/motos/page.js
import { CatalogGrid } from "@/components/CatalogGrid";
import { getCategoriesByType } from "@/lib/queries/categories";

export const metadata = { title: "Motos" };
export const revalidate = 3600;

export default async function MotosPage() {
  const categories = await getCategoriesByType("MOTO");

  return <CatalogGrid type="MOTO" title="Motos" categories={categories} />;
}
