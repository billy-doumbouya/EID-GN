import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

const UNSPLASH_FALLBACK =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";

const PRODUCT_TYPES = ["MOTO", "TRICYCLE", "PIECE"];

// GET : Recuperer un produit avec toutes ses images
// Fallback Unsplash si aucune image reelle
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] },
        category: true,
        compatibility: { include: { vehicleModel: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouve" },
        { status: 404 },
      );
    }

    if (product.images.length === 0) {
      product.images = [
        {
          id: `fallback-${product.id}`,
          url: UNSPLASH_FALLBACK,
          isFallback: true,
        },
      ];
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erreur GET produit:", error);
    return NextResponse.json(
      { error: "Erreur lecture produit" },
      { status: 500 },
    );
  }
}

// PUT : Mettre a jour les champs de base d'un produit.
// Le prix barre / les promotions ne se gerent pas ici : c'est le role du
// module Discount, expose via /admin/promotions (creation/desactivation
// de promos independamment de l'edition produit).
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      name,
      slug,
      description,
      type,
      priceDetail,
      priceGros,
      minQtyGros,
      stock,
      lowStockAlert,
      isPublished,
      categoryId,
    } = body;

    if (type !== undefined && !PRODUCT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type doit etre l'un de : ${PRODUCT_TYPES.join(", ")}` },
        { status: 400 },
      );
    }

    // Verifier unicite du slug si change
    if (slug) {
      const existing = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Slug deja existe" },
          { status: 400 },
        );
      }
    }

    // Validation des prix si fournis : meme regle que la creation
    // (le prix gros ne doit pas depasser le prix detail).
    let detail;
    let gros;

    if (priceDetail !== undefined) {
      detail = parseFloat(priceDetail);
      if (!Number.isFinite(detail) || detail < 0) {
        return NextResponse.json(
          { error: "priceDetail invalide" },
          { status: 400 },
        );
      }
    }

    if (priceGros !== undefined) {
      gros = parseFloat(priceGros);
      if (!Number.isFinite(gros) || gros < 0) {
        return NextResponse.json(
          { error: "priceGros invalide" },
          { status: 400 },
        );
      }
    }

    if (detail !== undefined && gros !== undefined && gros > detail) {
      return NextResponse.json(
        { error: "Le prix de gros ne peut pas depasser le prix detail" },
        { status: 400 },
      );
    }

    // Si un seul des deux prix est fourni, on doit comparer a la valeur
    // existante en base pour ne pas laisser passer une incoherence
    // (ex: on ne modifie que priceGros et il depasse le priceDetail actuel).
    if ((detail !== undefined) !== (gros !== undefined)) {
      const current = await prisma.product.findUnique({
        where: { id },
        select: { priceDetail: true, priceGros: true },
      });
      if (!current) {
        return NextResponse.json(
          { error: "Produit non trouve" },
          { status: 404 },
        );
      }
      const finalDetail = detail !== undefined ? detail : Number(current.priceDetail);
      const finalGros = gros !== undefined ? gros : Number(current.priceGros);
      if (finalGros > finalDetail) {
        return NextResponse.json(
          { error: "Le prix de gros ne peut pas depasser le prix detail" },
          { status: 400 },
        );
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(type !== undefined && { type }),
        ...(detail !== undefined && { priceDetail: detail }),
        ...(gros !== undefined && { priceGros: gros }),
        ...(minQtyGros !== undefined && {
          minQtyGros: parseInt(minQtyGros, 10),
        }),
        ...(stock !== undefined && { stock: parseInt(stock, 10) }),
        ...(lowStockAlert !== undefined && {
          lowStockAlert: parseInt(lowStockAlert, 10),
        }),
        ...(isPublished !== undefined && { isPublished }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
      },
      include: { images: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "SKU ou slug deja existant" },
        { status: 409 },
      );
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "categoryId invalide : categorie introuvable" },
        { status: 400 },
      );
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Produit non trouve" },
        { status: 404 },
      );
    }
    console.error("Erreur PUT produit:", error);
    return NextResponse.json(
      { error: "Erreur mise a jour produit" },
      { status: 500 },
    );
  }
}

// DELETE : Supprimer un produit et ses images Cloudinary.
// Regle metier : bloque si le produit a deja ete commande au moins une
// fois (on ne casse jamais l'historique de commande) ; dans ce cas,
// depublier le produit (isPublished: false) via PUT est la bonne
// alternative cote UI.
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        _count: { select: { orderItems: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouve" },
        { status: 404 },
      );
    }

    // Verification AVANT de toucher a Cloudinary : si la suppression BDD
    // doit echouer, on ne veut pas avoir deja detruit les images.
    if (product._count.orderItems > 0) {
      return NextResponse.json(
        {
          error:
            "Ce produit a deja ete commande et ne peut pas etre supprime. Depubliez-le a la place.",
          code: "PRODUCT_HAS_ORDERS",
        },
        { status: 409 },
      );
    }

    for (const image of product.images) {
      if (image.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(image.cloudinaryPublicId);
        } catch (err) {
          console.warn(
            `Erreur suppression image ${image.cloudinaryPublicId}:`,
            err,
          );
        }
      }
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Produit supprime" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      // Filet de securite si une contrainte FK bloque malgre le check ci-dessus
      return NextResponse.json(
        {
          error:
            "Ce produit est encore reference ailleurs (commandes, favoris...) et ne peut pas etre supprime.",
          code: "PRODUCT_HAS_ORDERS",
        },
        { status: 409 },
      );
    }
    console.error("Erreur DELETE produit:", error);
    return NextResponse.json(
      { error: "Erreur suppression produit" },
      { status: 500 },
    );
  }
}
