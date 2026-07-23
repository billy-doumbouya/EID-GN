import { PrismaClient } from "@prisma/client";

// Evite de recreer une nouvelle instance Prisma a chaque hot-reload en dev
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Client dedie aux transactions interactives (prisma.$transaction(async (tx) => {...})),
// ex: creation de commande. Le pooler Neon (DATABASE_URL, PgBouncer en mode
// "transaction") multiplexe les connexions par requete individuelle et ne
// supporte pas qu'une transaction interactive garde la meme connexion
// ouverte du debut a la fin -> erreur P2028 "Unable to start a transaction
// in the given time". DIRECT_URL contourne le pooler pour ces cas precis.
export const prismaDirect =
  globalForPrisma.prismaDirect ??
  new PrismaClient({
    datasourceUrl: process.env.DIRECT_URL,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaDirect = prismaDirect;
}
