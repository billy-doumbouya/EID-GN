// src/app/api/products/import/route.js
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";



function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Extrait un message d'erreur lisible depuis le premier probleme Zod,
// pour correspondre au format attendu par ImportProductsPage (line, sku, message).
function firstZodMessage(error) {
  return error.errors[0]?.message || "Donnees invalides";
}

// Import en masse du catalogue (CSV parse cote client avec papaparse, envoye
// ici comme JSON deja structure). Chaque ligne est traitee independamment :
// une ligne invalide ou une erreur Prisma sur une ligne ne bloque jamais le
// traitement des suivantes.
export async function POST(request) {
  const { rows } = await request.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: "Aucune ligne a importer" },
      { status: 400 },
    );
  }

  const results = { created: 0, updated: 0, errors: [] };

  for (const [index, row] of rows.entries()) {
    const line = index + 2; // +2 = ligne humaine (header + 1-index)

    const parsed = productSchema.safeParse(row);
    if (!parsed.success) {
      results.errors.push({
        line,
        sku: row.sku || undefined,
        message: firstZodMessage(parsed.error),
      });
      continue;
    }

    const data = parsed.data;

    try {
      if (data.categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: data.categoryId },
          select: { id: true },
        });
        if (!categoryExists) {
          results.errors.push({
            line,
            sku: data.sku,
            message: `categoryId "${data.categoryId}" introuvable`,
          });
          continue;
        }
      }

      const existing = await prisma.product.findUnique({
        where: { sku: data.sku },
        select: { id: true },
      });

      if (existing) {
        // On ne regenere jamais le slug d'un produit existant : si l'admin
        // a modifie le nom via CSV, changer le slug casserait les liens
        // deja partages/indexes. Le slug n'est fixe qu'a la creation.
        await prisma.product.update({
          where: { id: existing.id },
          data,
        });
        results.updated++;
      } else {
        await prisma.product.create({
          data: { ...data, slug: generateSlug(data.name) },
        });
        results.created++;
      }
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        results.errors.push({
          line,
          sku: data.sku,
          message: "SKU ou slug deja existant (conflit)",
        });
      } else {
        console.error(`Erreur import ligne ${line} (${data.sku}):`, err);
        results.errors.push({
          line,
          sku: data.sku,
          message: "Erreur serveur lors de l'enregistrement",
        });
      }
    }
  }

  return NextResponse.json(results);
}
