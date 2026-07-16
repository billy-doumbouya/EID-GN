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

export const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(2),
  description: z.string().min(1),
  type: z.enum(["MOTO", "TRICYCLE", "PIECE"]),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().optional().nullable(),
});

export const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
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
