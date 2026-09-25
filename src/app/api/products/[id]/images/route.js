import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST : Ajouter une nouvelle image a un produit
// Cette route recoit directement l'URL (et optionnellement le publicId) apres l'upload reussi cote client (ex: via CldUploadWidget)
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { url, publicId, alt } = body;

    if (!url) {
      return NextResponse.json({ error: "L'URL de l'image est requise" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Produit non trouve" }, { status: 404 });
    }

    const isFirstImage = product.images.length === 0;

    const newImage = await prisma.productImage.create({
      data: {
        productId: id,
        url,
        cloudinaryPublicId: publicId || null,
        alt: alt || product.name,
        isPrimary: isFirstImage,
        position: product.images.length,
      },
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Erreur POST image:", error);
    return NextResponse.json({ error: "Erreur lors de l'ajout de l'image" }, { status: 500 });
  }
}
