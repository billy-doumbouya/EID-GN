// src/lib/utils.js  (si tu ne l'as pas déjà — nécessaire pour shadcn/cva)
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}