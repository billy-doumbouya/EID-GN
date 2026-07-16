// src/app/api/products/route.js
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const UNSPLASH_FALLBACK_URLS = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
  "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&q=80",
  "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&q=80",
];

function getRandomUnsplashUrl() {
  return UNSPLASH_FALLBACK_URLS[
    Math.floor(Math.random() * UNSPLASH_FALLBACK_URLS.length)
  ];
}

function activeDiscountsFilter(now) {
  return { validFrom: { lte: now }, validTo: { gte: now } };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const categorySlug = searchParams.get("category");
  const vehicleModelId = searchParams.get("vehicleModelId");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "recent";
  const page = Number(searchParams.get("page") || 1);
  const perPage = 20;
  const now = new Date();

  const where = {
    isPublished: true,
    ...(type && { type }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(vehicleModelId && { compatibility: { some: { vehicleModelId } } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Tri sur le prix detail (prix public par defaut) — le prix gros n'a pas
  // vocation a servir de tri sur le catalogue grand public.
  const orderBy =
    sort === "prix_asc"
      ? { priceDetail: "asc" }
      : sort === "prix_desc"
        ? { priceDetail: "desc" }
        : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        images: true,
        discounts: { where: activeDiscountsFilter(now) },
        category: {
          include: { discounts: { where: activeDiscountsFilter(now) } },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const enrichedProducts = products.map((product) => ({
    ...product,
    images:
      product.images.length > 0
        ? product.images
        : [
            {
              id: `fallback-${product.id}`,
              url: getRandomUnsplashUrl(),
              isFallback: true,
            },
          ],
  }));

  return NextResponse.json({
    products: enrichedProducts,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
}

// POST : Creer un nouveau produit, avec promo de lancement facultative
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      sku,
      name,
      slug,
      description,
      type,
      priceDetail,
      priceGros,
      minQtyGros = 5,
      stock,
      lowStockAlert = 3,
      isPublished = true,
      categoryId,
      image,
      launchDiscount,
    } = body;

    if (!sku || !name || !slug || priceDetail == null || priceGros == null) {
      return NextResponse.json(
        {
          error: "sku, name, slug, priceDetail et priceGros sont obligatoires",
        },
        { status: 400 },
      );
    }

    const detail = parseFloat(priceDetail);
    const gros = parseFloat(priceGros);

    if (
      !Number.isFinite(detail) ||
      !Number.isFinite(gros) ||
      detail < 0 ||
      gros < 0
    ) {
      return NextResponse.json({ error: "Prix invalides" }, { status: 400 });
    }

    if (gros > detail) {
      return NextResponse.json(
        { error: "Le prix de gros ne peut pas depasser le prix detail" },
        { status: 400 },
      );
    }

    if (launchDiscount) {
      const {
        name: discName,
        type: discType,
        value,
        validFrom,
        validTo,
      } = launchDiscount;
      if (!discName || !discType || value == null || !validFrom || !validTo) {
        return NextResponse.json(
          { error: "Promotion de lancement incomplete" },
          { status: 400 },
        );
      }
      if (new Date(validTo) <= new Date(validFrom)) {
        return NextResponse.json(
          {
            error:
              "La date de fin de promotion doit etre apres la date de debut",
          },
          { status: 400 },
        );
      }
      if (discType === "POURCENTAGE" && parseFloat(value) > 100) {
        return NextResponse.json(
          { error: "Un pourcentage de reduction ne peut pas depasser 100" },
          { status: 400 },
        );
      }
    }

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          sku,
          name,
          slug,
          description,
          type,
          priceDetail: detail,
          priceGros: gros,
          minQtyGros: parseInt(minQtyGros, 10) || 5,
          stock: parseInt(stock || 0, 10),
          lowStockAlert: parseInt(lowStockAlert, 10),
          isPublished,
          categoryId: categoryId || null,
          images: image
            ? {
                create: [
                  {
                    url: image.url,
                    cloudinaryPublicId: image.cloudinaryPublicId || null,
                    position: 0,
                    isPrimary: true,
                  },
                ],
              }
            : undefined,
        },
        include: { images: true },
      });

      if (launchDiscount) {
        await tx.discount.create({
          data: {
            name: launchDiscount.name,
            type: launchDiscount.type,
            value: parseFloat(launchDiscount.value),
            validFrom: new Date(launchDiscount.validFrom),
            validTo: new Date(launchDiscount.validTo),
            applyToDetail: launchDiscount.applyToDetail ?? true,
            applyToGros: launchDiscount.applyToGros ?? false,
            productId: created.id,
          },
        });
      }

      return created;
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    // P2002 = violation de contrainte unique (SKU ou slug deja pris),
    // filet de securite en plus du check applicatif eventuel en amont.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "SKU ou slug deja existant" },
        { status: 409 },
      );
    }
    console.error("Erreur POST produit:", error);
    return NextResponse.json(
      { error: "Erreur creation produit" },
      { status: 500 },
    );
  }
}
