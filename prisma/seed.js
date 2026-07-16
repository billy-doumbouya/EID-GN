const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Compte admin de demo - A CHANGER en production
  const adminPasswordHash = await bcrypt.hash("ChangeMoi123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@motoshop.gn" },
    update: {},
    create: {
      email: "admin@motoshop.gn",
      fullName: "Administrateur MotoShop",
      phone: "224620000000",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const categoriePieces = await prisma.category.upsert({
    where: { slug: "pieces-detachees" },
    update: {},
    create: { name: "Pieces detachees", slug: "pieces-detachees" },
  });

  const cg125 = await prisma.vehicleModel.upsert({
    where: { brand_name: { brand: "Haojue", name: "CG125" } },
    update: {},
    create: { brand: "Haojue", name: "CG125", type: "MOTO" },
  });

  const product = await prisma.product.upsert({
    where: { sku: "BAT-CG125-001" },
    update: {},
    create: {
      sku: "BAT-CG125-001",
      name: "Batterie 12V pour CG125",
      slug: "batterie-12v-cg125",
      description: "Batterie 12V compatible avec les modeles CG125, longue duree de vie.",
      type: "PIECE",
      price: 250000,
      stock: 15,
      lowStockAlert: 3,
      categoryId: categoriePieces.id,
      compatibility: { create: [{ vehicleModelId: cg125.id }] },
    },
  });

  console.log("Seed termine :", { product: product.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
