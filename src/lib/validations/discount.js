import { z } from "zod";

export const discountSchema = z
  .object({
    name: z.string().min(1, "Le nom est obligatoire"),
    type: z.enum(["POURCENTAGE", "MONTANT_FIXE"], {
      errorMap: () => ({ message: "type doit etre POURCENTAGE ou MONTANT_FIXE" }),
    }),
    value: z.coerce.number().nonnegative("La valeur doit etre positive"),
    validFrom: z.coerce.date({ errorMap: () => ({ message: "validFrom invalide" }) }),
    validTo: z.coerce.date({ errorMap: () => ({ message: "validTo invalide" }) }),
    applyToDetail: z.boolean().optional().default(true),
    applyToGros: z.boolean().optional().default(false),
    targetType: z.enum(["product", "category"], {
      errorMap: () => ({ message: "targetType doit etre 'product' ou 'category'" }),
    }),
    targetId: z.string().min(1, "targetId est obligatoire"),
  })
  .refine((d) => d.validTo > d.validFrom, {
    message: "La date de fin doit etre apres la date de debut",
    path: ["validTo"],
  })
  .refine((d) => !(d.type === "POURCENTAGE" && d.value > 100), {
    message: "Un pourcentage ne peut pas depasser 100",
    path: ["value"],
  })
  .refine((d) => d.applyToDetail || d.applyToGros, {
    message: "La promotion doit s'appliquer au moins au prix detail ou gros",
    path: ["applyToDetail"],
  });
