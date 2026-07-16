import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";

// Import en masse du catalogue (CSV parse cote client avec papaparse, envoye
// ici comme JSON deja structure). Chaque ligne est validee individuellement -
// les lignes invalides sont rapportees sans bloquer l'import des lignes valides.
export async function POST(request) {
  const { rows } = await request.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Aucune ligne a importer" }, { status: 400 });
  }

  const results = { created: 0, updated: 0, errors: [] };

  for (const [index, row] of rows.entries()) {
    const parsed = productSchema.safeParse({
      ...row,
      price: Number(row.price),
      stock: Number(row.stock),
    });

    if (!parsed.success) {
      results.errors.push({ line: index + 2, error: parsed.error.flatten() }); // +2 = ligne humaine (header + 1-index)
      continue;
    }

    const slug = parsed.data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });

    if (existing) {
      await prisma.product.update({ where: { sku: parsed.data.sku }, data: parsed.data });
      results.updated++;
    } else {
      await prisma.product.create({ data: { ...parsed.data, slug } });
      results.created++;
    }
  }

  return NextResponse.json(results);
}
