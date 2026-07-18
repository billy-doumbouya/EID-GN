import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

// POST : Upload d'une image (multipart/form-data, champ "file") et
// creation du ProductImage associe. La toute premiere image d'un
// produit devient automatiquement l'image primaire.
export async function POST(request, { params }) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, images: { select: { id: true, position: true } } },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouve" },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Aucun fichier recu (champ 'file' attendu)" },
        { status: 400 },
      );
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "L'image ne doit pas depasser 5 Mo" },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporte (jpeg, png, webp uniquement)" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "eid-gn/products",
    });

    const isFirstImage = product.images.length === 0;
    const nextPosition =
      product.images.length === 0
        ? 0
        : Math.max(...product.images.map((img) => img.position)) + 1;

    const image = await prisma.productImage.create({
      data: {
        productId: id,
        url: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        position: nextPosition,
        isPrimary: isFirstImage,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Erreur upload image produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload de l'image" },
      { status: 500 },
    );
  }
}
