import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Genere une signature d'upload cote serveur (uploads signes = plus surs que
// les uploads non signes) consommee par le widget Cloudinary cote dashboard admin.
export function generateUploadSignature(paramsToSign) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { ...paramsToSign, timestamp },
    process.env.CLOUDINARY_API_SECRET
  );
  return { timestamp, signature, apiKey: process.env.CLOUDINARY_API_KEY };
}

export { cloudinary };
