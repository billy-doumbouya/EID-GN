import { z } from "zod";

// Filet de securite runtime puisque le projet est en JS pur (pas de TS).
// Toute donnee qui entre (formulaire, webhook, import CSV) doit passer par un schema zod.

export const registerSchema = z.object({
  fullName: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numero invalide"),
  password: z.string().min(8, "8 caracteres minimum"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const resetRequestSchema = z.object({
  email: z.string().email(),
});

export const resetConfirmSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

// src/lib/validators.js
export const productSchema = z
  .object({
    sku: z.string().min(1),
    name: z.string().min(2),
    description: z.string().min(1),
    type: z.enum(["MOTO", "TRICYCLE", "PIECE"]),
    priceDetail: z.number().positive(),
    priceGros: z.number().positive(),
    minQtyGros: z.number().int().positive().default(5),
    stock: z.number().int().min(0),
    lowStockAlert: z.number().int().min(0).default(3),
    categoryId: z.string().optional().nullable(),
  })
  .refine((data) => data.priceGros <= data.priceDetail, {
    message: "Le prix de gros ne peut pas depasser le prix detail",
    path: ["priceGros"],
  });
export const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Le panier est vide"),
  addressId: z.string().optional(),
  guestFullName: z.string().optional(),
  guestPhone: z.string().optional(),
  guestEmail: z.string().email().optional(),
  paymentProvider: z.enum(["LENGOPAY", "DJOMY"]),
});

// Important : LengoPay attend un "amount" en string, pas en number (source d'erreurs 400).
export const lengopayWebhookSchema = z.object({
  pay_id: z.string(),
  status: z.string(),
  amount: z.union([z.string(), z.number()]),
  client: z.string().optional(),
});

export const djomyWebhookSchema = z.object({
  transactionId: z.string(),
  status: z.string(),
  amount: z.union([z.string(), z.number()]),
});







// ... vos schémas existants (registerSchema, productSchema, etc.)

export const promotionSchema = z
  .object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    type: z.enum(["POURCENTAGE", "MONTANT_FIXE"]),
    value: z.coerce
      .number({ invalid_type_error: "Saisissez un nombre valide" })
      .positive("La valeur doit être supérieure à 0"),
    validFrom: z.string().min(1, "La date de début est requise"),
    validTo: z.string().min(1, "La date de fin est requise"),
    applyToDetail: z.boolean(),
    applyToGros: z.boolean(),
    targetType: z.enum(["product", "category"]),
    targetId: z.string().min(1, "Veuillez sélectionner un produit ou une catégorie"),
  })
  .refine((data) => data.applyToDetail || data.applyToGros, {
    message: "La promotion doit s'appliquer au moins au prix détail ou gros",
    path: ["applyToDetail"],
  })
  .refine(
    (data) => {
      if (data.type === "POURCENTAGE") {
        return data.value <= 100;
      }
      return true;
    },
    {
      message: "Un pourcentage ne peut pas dépasser 100%",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      if (data.validFrom && data.validTo) {
        return new Date(data.validTo) >= new Date(data.validFrom);
      }
      return true;
    },
    {
      message: "La date de fin doit être postérieure à la date de début",
      path: ["validTo"],
    }
  );