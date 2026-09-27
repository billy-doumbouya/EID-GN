import { z } from "zod";

export const productSchema = z
  .object({
    sku: z.string().min(1, "Le SKU est obligatoire"),
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    slug: z.string().min(1, "Le slug est obligatoire").optional(),
    description: z.string().optional().default(""),
    type: z.enum(["MOTO", "TRICYCLE", "PIECE"], {
      errorMap: () => ({ message: "Type invalide (MOTO, TRICYCLE ou PIECE)" }),
    }),
    priceDetail: z.coerce.number().positive("Le prix de détail doit être supérieur à 0"),
    priceGros: z.coerce.number().positive("Le prix de gros doit être supérieur à 0"),
    minQtyGros: z.coerce.number().int().positive().default(5),
    stock: z.coerce.number().int().min(0, "Le stock ne peut pas être négatif").default(0),
    lowStockAlert: z.coerce.number().int().min(0).default(3),
    categoryId: z.string().optional().nullable(),
    isPublished: z.boolean().optional().default(true),
  })
  .refine(
    (data) => {
      if (data.priceGros && data.priceDetail) {
        return data.priceGros <= data.priceDetail;
      }
      return true;
    },
    {
      message: "Le prix de gros ne peut pas dépasser le prix détail",
      path: ["priceGros"],
    }
  );

export const productCreateSchema = productSchema;

export const productUpdateSchema = z
  .object({
    sku: z.string().min(1).optional(),
    name: z.string().min(2).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().optional(),
    type: z.enum(["MOTO", "TRICYCLE", "PIECE"]).optional(),
    priceDetail: z.coerce.number().positive().optional(),
    priceGros: z.coerce.number().positive().optional(),
    minQtyGros: z.coerce.number().int().positive().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    lowStockAlert: z.coerce.number().int().min(0).optional(),
    categoryId: z.string().optional().nullable(),
    isPublished: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.priceGros !== undefined && data.priceDetail !== undefined) {
        return data.priceGros <= data.priceDetail;
      }
      return true;
    },
    {
      message: "Le prix de gros ne peut pas dépasser le prix détail",
      path: ["priceGros"],
    }
  );
