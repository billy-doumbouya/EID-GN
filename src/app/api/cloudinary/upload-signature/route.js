import { NextResponse } from "next/server";
import { generateUploadSignature } from "@/lib/cloudinary";

// POST : Generer une signature d'upload Cloudinary
// Consomme par le widget Cloudinary cote client pour uploads signes
// Body: { productId: string }
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId obligatoire" },
        { status: 400 }
      );
    }

    const signatureData = generateUploadSignature({
      folder: `moto-shop/products/${productId}`,
      resource_type: "auto",
    });

    return NextResponse.json(signatureData);
  } catch (error) {
    console.error("Erreur signature upload:", error);
    return NextResponse.json(
      { error: "Erreur generation signature" },
      { status: 500 }
    );
  }
}
