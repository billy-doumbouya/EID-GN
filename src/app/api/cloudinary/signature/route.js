import { NextResponse } from "next/server";
import { generateUploadSignature } from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";

// Signature d'upload cote serveur - uniquement pour l'admin. Sans cette
// verification, n'importe qui pourrait uploader des fichiers sur le compte
// Cloudinary du commerçant.
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const body = await request.json();
  const signatureData = generateUploadSignature({ folder: body.folder || "products" });

  return NextResponse.json({
    ...signatureData,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
