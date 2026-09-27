import { z } from "zod";

// Téléphone guinéen : +224 6XX XXX XXX ou 6XX XXX XXX
const phoneRegex = /^(\+224)?\s*6\d{2}\s*\d{3}\s*\d{3}$/;

export const checkoutSchema = z.object({
  guestFullName: z
    .string()
    .min(3, "Nom complet requis (min. 3 caractères)")
    .max(100, "Nom trop long"),

  guestPhone: z
    .string()
    .regex(phoneRegex, "Format invalide. Ex : 622 000 000 ou +224 622 000 000"),

  guestEmail: z
    .string()
    .email("Email invalide")
    .optional()
    .or(z.literal("")),

  // Adresse de livraison (obligatoire)
  addressLabel: z
    .string()
    .min(3, "Nom de l'adresse requis (ex : Domicile, Boutique)")
    .max(50),

  addressQuartier: z
    .string()
    .min(3, "Quartier requis")
    .max(100),

  addressVille: z
    .string()
    .min(2, "Ville requise")
    .max(50)
    .default("Kankan"),

  addressReperes: z
    .string()
    .max(300, "Trop long (max 300 caractères)")
    .optional()
    .or(z.literal("")),

  addressTelephone: z
    .string()
    .regex(phoneRegex, "Format invalide")
    .optional()
    .or(z.literal("")),

  paymentProvider: z.enum(["DJOMY", "LENGOPAY", "A_LA_LIVRAISON"]),

  createAccount: z.boolean().default(false),
});
