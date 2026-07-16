import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

// POST : Uploader et ajouter une image a un produit
// Body: { imageUrl: string } ou { dataUrl: string } pour upload direct
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { imageUrl, dataUrl, position = 0, isPrimary = false } = body;

    // Verifier que le produit existe
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

    // Si dataUrl fourni, uploader vers Cloudinary
    let finalUrl = imageUrl;
    let cloudinaryPublicId = null;

    if (dataUrl) {
      try {
        const uploadResult = await cloudinary.uploader.upload(dataUrl, {
          folder: `moto-shop/products/${params.id}`,
          resource_type: "auto",
        });
        finalUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
      } catch (uploadError) {
        console.error("Erreur upload Cloudinary:", uploadError);
        return NextResponse.json(
          { error: "Erreur upload image" },
          { status: 500 }
        );
      }
    }

    if (!finalUrl) {
      return NextResponse.json(
        { error: "imageUrl ou dataUrl obligatoire" },
        { status: 400 }
      );
    }

    // Gerer position et isPrimary
    let actualPosition = position;
    let actualIsPrimary = isPrimary;

    if (isPrimary && product.images.length > 0) {
      // Enlever le flag isPrimary des autres images
      await prisma.productImage.updateMany({
        where: { productId: params.id },
        data: { isPrimary: false },
      });
    }

    // Si premiere image et aucune image primaire, la marquer comme primaire
    if (product.images.length === 0) {
      actualIsPrimary = true;
    }

    // Creer l'image
    const newImage = await prisma.productImage.create({
      data: {
        productId: params.id,
        url: finalUrl,
        cloudinaryPublicId,
        position: actualPosition || product.images.length,
        isPrimary: actualIsPrimary,
      },
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Erreur POST image:", error);
    return NextResponse.json(
      { error: "Erreur ajout image" },
      { status: 500 }
    );
  }
}

// GET : Lister les images d'un produit
export async function GET(request, { params }) {
  try {
    const images = await prisma.productImage.findMany({
      where: { productId: params.id },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Erreur GET images:", error);
    return NextResponse.json(
      { error: "Erreur lecture images" },
      { status: 500 }
    );
  }
}

// DELETE : Supprimer une image spécifique
export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "imageId obligatoire" },
        { status: 400 }
      );
    }

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json(
        { error: "Image non trouvee" },
        { status: 404 }
      );
    }

    // Supprimer de Cloudinary
    if (image.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(image.cloudinaryPublicId);
      } catch (err) {
        console.warn(`Erreur suppression Cloudinary ${image.cloudinaryPublicId}:`, err);
      }
    }

    // Supprimer de la BDD
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ message: "Image supprimee" });
  } catch (error) {
    console.error("Erreur DELETE image:", error);
    return NextResponse.json(
      { error: "Erreur suppression image" },
      { status: 500 }
    );
  }
}
