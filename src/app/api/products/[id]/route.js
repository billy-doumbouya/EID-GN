import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

// GET : Recuperer un produit avec toutes ses images
// Fallback Unsplash si aucune image reelle
export async function GET(request, { params }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true, category: true, compatibility: { include: { vehicleModel: true } } },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouve" },
        { status: 404 }
      );
    }

    // Ajouter fallback images si pas d'images reelles
    if (product.images.length === 0) {
      const UNSPLASH_FALLBACK = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";
      product.images = [{ id: `fallback-${product.id}`, url: UNSPLASH_FALLBACK, isFallback: true }];
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erreur GET produit:", error);
    return NextResponse.json(
      { error: "Erreur lecture produit" },
      { status: 500 }
    );
  }
}

// PUT : Mettre a jour un produit
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      stock,
      lowStockAlert,
      isPublished,
      categoryId,
    } = body;

    // Verifier unicite du slug si change
    if (slug) {
      const existing = await prisma.product.findFirst({
        where: { slug, id: { not: params.id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Slug deja existe" },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(compareAtPrice !== undefined && { compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(lowStockAlert !== undefined && { lowStockAlert: parseInt(lowStockAlert) }),
        ...(isPublished !== undefined && { isPublished }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: { images: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erreur PUT produit:", error);
    return NextResponse.json(
      { error: "Erreur mise a jour produit" },
      { status: 500 }
    );
  }
}

// DELETE : Supprimer un produit et ses images Cloudinary
export async function DELETE(request, { params }) {
  try {
    // Recuperer les images pour les supprimer de Cloudinary
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouve" },
        { status: 404 }
      );
    }

    // Supprimer les images Cloudinary
    for (const image of product.images) {
      if (image.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(image.cloudinaryPublicId);
        } catch (err) {
          console.warn(`Erreur suppression image ${image.cloudinaryPublicId}:`, err);
        }
      }
    }

    // Supprimer le produit (cascade suppression des images BDD)
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Produit supprime" });
  } catch (error) {
    console.error("Erreur DELETE produit:", error);
    return NextResponse.json(
      { error: "Erreur suppression produit" },
      { status: 500 }
    );
  }
}
