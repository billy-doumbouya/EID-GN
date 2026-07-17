const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Images produit — vraies photos Unsplash (licence libre, usage commercial
// autorisé, aucune attribution requise), réparties par catégorie.
// Remplace l'ancien placeholderImages() basé sur Picsum.
//
// Chaque run de seed FAIT UN RESET des images : les anciennes lignes
// ProductImage du produit sont supprimées puis recréées avec ces URLs.
// C'est la "commande de reset" demandée : `npm run db:seed` (ou
// `node prisma/seed.js`) réapplique toujours les bonnes images, même sur
// une base déjà peuplée avec les anciens placeholders Picsum.
// ---------------------------------------------------------------------------

const UNSPLASH_IDS = {
  motos: [
    "1609630875171-b1321377ee65",
    "1591637333184-19aa84b3e01f",
    "1568772585407-9361f9bf3a87",
    "1558981403-c5f9899a28bc",
    "1449426468159-d96dbf08f19f",
    "1558981806-ec527fa84c39",
    "1572452571879-3d67d5b2a39f",
    "1588627541420-fce3f661b779",
    "1606907568152-58fcb0a0a4e5",
    "1596687760372-4c0d266059a7",
    "1590506995460-d0d9892b54da",
    "1588756681780-9d5859fc2ca0",
    "1531327431456-837da4b1d562",
    "1559289431-9f12ee08f8b6",
    "1506424482693-1f123321fa53",
    "1554223789-df81106a45ed",
    "1597260491619-bab87197869f",
    "1503434396599-58ba8a18d932",
    "1519750292352-c9fc17322ed7",
    "1623079478319-945f25f0a97b",
    "1597755269789-89407cf1a199",
    "1538895490524-0ded232a96d8",
    "1657008846502-e03a84f49baa",
    "1478340168842-7e6b25ed6510",
  ],
  tricycles: [
    "1626149637281-4e227308da18",
    "1564497631167-ffc10306af7b",
    "1582186484574-5f740083b07e",
    "1649055729600-e39807d0269a",
    "1677981316525-53d7d56d7a04",
    "1639919397870-cc2c183be021",
    "1626491058156-2daaeea7f578",
    "1693716542403-0cec45ac5d3b",
    "1564291886459-a39ad7415125",
    "1519687335474-c85fb3a50ca3",
    "1662718552505-ee99195e0dec",
    "1691126770116-d0eb6e7c3607",
    "1751945497058-4cd9d0346e73",
    "1580572429716-ef73497518b9",
    "1620415598391-aa5ac16ef567",
    "1562655316-07a3bc418252",
    "1778568773666-47f506d93891",
    "1763835996160-a6e15ba419be",
    "1771098979388-5de6d406ea86",
    "1494094957169-98a78486526e",
  ],
  // slug reel de la categorie dans le seed : "pieces-detachees"
  "pieces-detachees": [
    "1486262715619-67b85e0b08d3",
    "1611633235555-45e252fe48c8",
    "1522598140461-ec9911e01c53",
    "1632496497047-706290273235",
    "1720796112186-91995737c017",
    "1513310285890-06d9ac313835",
    "1641243271458-20e959e25c7a",
    "1632496498058-a3bb5998a4f6",
    "1649399337535-afbf61e74cab",
    "1609192492693-15c6b06abfb0",
    "1723365316514-8509dea457f2",
    "1687858477667-d5dc55100409",
    "1520500374161-c2f4f955fda5",
    "1502744688674-c619d1586c9e",
    "1525013066836-c6090f0ad9d8",
  ],
};

// Compteur global par categorie pour ne pas repartir de zero a chaque appel
// et repartir les images sur plusieurs produits sans repetition immediate.
const cursors = { motos: 0, tricycles: 0, "pieces-detachees": 0 };

function unsplashUrl(id, { w = 1200, q = 80 } = {}) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

function nextUnsplashIds(categorySlug, count) {
  const pool = UNSPLASH_IDS[categorySlug];
  if (!pool) {
    throw new Error(
      `Aucune pool d'images Unsplash definie pour la categorie "${categorySlug}". ` +
        `Ajoutez-la dans UNSPLASH_IDS.`,
    );
  }
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(pool[cursors[categorySlug] % pool.length]);
    cursors[categorySlug]++;
  }
  return ids;
}

function unsplashImages(categorySlug, altBase, count = 2) {
  return nextUnsplashIds(categorySlug, count).map((id, i) => ({
    url: unsplashUrl(id),
    alt: `${altBase} — photo ${i + 1}`,
    position: i,
  }));
}

// RESET explicite des images d'un produit : supprime tout ce qui existe deja
// (anciens placeholders Picsum ou anciennes photos Unsplash) puis recree la
// liste fournie. Appele apres chaque upsert de produit, donc le seed reste
// idempotent ET remplace systematiquement les vieilles images a chaque run.
async function resetProductImages(productId, images) {
  await prisma.productImage.deleteMany({ where: { productId } });
  if (images.length > 0) {
    await prisma.productImage.createMany({
      data: images.map((img) => ({ ...img, productId })),
    });
  }
}

async function main() {
  // ---------------------------------------------
  // Compte admin de demo - A CHANGER en production
  // ---------------------------------------------
  const adminPasswordHash = await bcrypt.hash("adminEID", 10);
  await prisma.user.upsert({
    where: { email: "admin@eig.gn" },
    update: {},
    create: {
      email: "admin@eig.gn",
      fullName: "Administrateur EID-GN",
      phone: "224623952011",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // ---------------------------------------------
  // Categories
  // ---------------------------------------------
  const categoriePieces = await prisma.category.upsert({
    where: { slug: "pieces-detachees" },
    update: {},
    create: { name: "Pieces detachees", slug: "pieces-detachees" },
  });

  const categorieMotos = await prisma.category.upsert({
    where: { slug: "motos" },
    update: {},
    create: { name: "Motos", slug: "motos" },
  });

  const categorieTricycles = await prisma.category.upsert({
    where: { slug: "tricycles" },
    update: {},
    create: { name: "Tricycles", slug: "tricycles" },
  });

  // ---------------------------------------------
  // Modeles de vehicules
  // ---------------------------------------------
  const cg125 = await prisma.vehicleModel.upsert({
    where: { brand_name: { brand: "Haojue", name: "CG125" } },
    update: {},
    create: { brand: "Haojue", name: "CG125", type: "MOTO" },
  });

  const boxer150 = await prisma.vehicleModel.upsert({
    where: { brand_name: { brand: "Bajaj", name: "Boxer 150" } },
    update: {},
    create: { brand: "Bajaj", name: "Boxer 150", type: "MOTO" },
  });

  const kingTricycle = await prisma.vehicleModel.upsert({
    where: { brand_name: { brand: "TVS", name: "King" } },
    update: {},
    create: { brand: "TVS", name: "King", type: "TRICYCLE" },
  });

  // ---------------------------------------------
  // Produits (tous les champs du schema renseignes)
  // Note : le bloc `images: { create: [...] }` est retire du create() car il
  // ne s'appliquerait qu'a la toute premiere insertion (upsert -> branche
  // create uniquement). Les images sont maintenant geres par
  // resetProductImages() juste apres, pour etre reappliquees a CHAQUE run.
  // ---------------------------------------------

  // 1. Piece detachee : batterie
  const batterie = await prisma.product.upsert({
    where: { sku: "BAT-CG125-001" },
    update: {},
    create: {
      sku: "BAT-CG125-001",
      name: "Batterie 12V pour CG125",
      slug: "batterie-12v-cg125",
      description:
        "Batterie 12V compatible avec les modeles CG125, longue duree de vie.",
      type: "PIECE",
      priceDetail: 250000,
      priceGros: 210000,
      minQtyGros: 5,
      stock: 15,
      lowStockAlert: 3,
      isPublished: true,
      categoryId: categoriePieces.id,
      compatibility: {
        create: [{ vehicleModelId: cg125.id }],
      },
    },
  });
  await resetProductImages(
    batterie.id,
    unsplashImages("pieces-detachees", batterie.name, 2),
  );

  // 2. Piece detachee : chaine de transmission (compatible 2 modeles)
  const chaine = await prisma.product.upsert({
    where: { sku: "CHN-UNIV-001" },
    update: {},
    create: {
      sku: "CHN-UNIV-001",
      name: "Chaine de transmission renforcee",
      slug: "chaine-transmission-renforcee",
      description:
        "Chaine renforcee haute resistance, compatible plusieurs modeles de motos 125-150cc.",
      type: "PIECE",
      priceDetail: 120000,
      priceGros: 95000,
      minQtyGros: 10,
      stock: 40,
      lowStockAlert: 8,
      isPublished: true,
      categoryId: categoriePieces.id,
      compatibility: {
        create: [{ vehicleModelId: cg125.id }, { vehicleModelId: boxer150.id }],
      },
    },
  });
  await resetProductImages(
    chaine.id,
    unsplashImages("pieces-detachees", chaine.name, 2),
  );

  // 3. Moto complete
  const moto = await prisma.product.upsert({
    where: { sku: "MOTO-BOXER150-001" },
    update: {},
    create: {
      sku: "MOTO-BOXER150-001",
      name: "Bajaj Boxer 150",
      slug: "bajaj-boxer-150",
      description:
        "Moto robuste et economique, ideale pour le transport urbain et interurbain.",
      type: "MOTO",
      priceDetail: 12500000,
      priceGros: 11800000,
      minQtyGros: 3,
      stock: 8,
      lowStockAlert: 2,
      isPublished: true,
      categoryId: categorieMotos.id,
      compatibility: {
        create: [{ vehicleModelId: boxer150.id }],
      },
    },
  });
  await resetProductImages(moto.id, unsplashImages("motos", moto.name, 3));

  // 4. Tricycle complet
  const tricycle = await prisma.product.upsert({
    where: { sku: "TRI-TVSKING-001" },
    update: {},
    create: {
      sku: "TRI-TVSKING-001",
      name: "TVS King",
      slug: "tvs-king",
      description:
        "Tricycle utilitaire, grande capacite de chargement, ideal pour le commerce.",
      type: "TRICYCLE",
      priceDetail: 28000000,
      priceGros: 26500000,
      minQtyGros: 2,
      stock: 4,
      lowStockAlert: 1,
      isPublished: true,
      categoryId: categorieTricycles.id,
      compatibility: {
        create: [{ vehicleModelId: kingTricycle.id }],
      },
    },
  });
  await resetProductImages(
    tricycle.id,
    unsplashImages("tricycles", tricycle.name, 3),
  );

  // ---------------------------------------------
  // Promotion de demo
  // ---------------------------------------------
  const now = new Date();
  const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inOneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.discount.upsert({
    where: { id: "seed-promo-batterie" }, // id fixe pour rendre le seed idempotent
    update: {},
    create: {
      id: "seed-promo-batterie",
      name: "Promo lancement batterie",
      type: "POURCENTAGE",
      value: 10,
      applyToDetail: true,
      applyToGros: false,
      validFrom: now,
      validTo: inOneWeek,
      productId: batterie.id,
    },
  });

  await prisma.discount.upsert({
    where: { id: "seed-promo-pieces" },
    update: {},
    create: {
      id: "seed-promo-pieces",
      name: "Promo categorie pieces detachees",
      type: "MONTANT_FIXE",
      value: 15000,
      applyToDetail: true,
      applyToGros: true,
      validFrom: now,
      validTo: inOneMonth,
      categoryId: categoriePieces.id,
    },
  });

  console.log(
    "Seed termine (images reinitialisees avec de vraies photos Unsplash) :",
    {
      produits: [batterie.name, chaine.name, moto.name, tricycle.name],
    },
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
