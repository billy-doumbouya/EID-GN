import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { productUpdateSchema } from "@/lib/validations/product";
import { revalidateTag } from "next/cache";

// ============================================================
// GET — Produit avec images (public, fallback géré côté composant)
// ============================================================
export async function GET(request, { params }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        priceDetail: true,
        priceGros: true,
        minQtyGros: true,
        stock: true,
        reservedStock: true,
        lowStockAlert: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        images: {
          orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
        },
        compatibility: {
          include: { vehicleModel: true },
        },
        discounts: {
          where: {
            validFrom: { lte: new Date() },
            validTo: { gte: new Date() },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Cache public 60s (CDN + browser)
    const response = NextResponse.json(product);
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
    return response;
  } catch (error) {
    console.error("[GET /api/admin/products/[id]]", {
      productId: params.id,
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Erreur lecture produit" },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT — Mise à jour (admin only, validated, audited)
// ============================================================
export async function PUT(request, { params }) {
  // 1. Auth + rate limit
  const limited = await rateLimit(request, "product-update", {
    window: 60,
    max: 20,
  });
  if (limited) return limited;

  const session = await requireAdmin(request);
  if (session instanceof NextResponse) return session;

  try {
    // 2. Validation zod
    const body = await request.json();
    const validated = productUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // 3. Vérifier que le produit existe
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true, slug: true, sku: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // 4. Update transactionnel avec audit log
    const updated = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: params.id },
        data: {
          ...(data.sku !== undefined && { sku: data.sku }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.priceDetail !== undefined && {
            priceDetail: data.priceDetail,
          }),
          ...(data.priceGros !== undefined && {
            priceGros: data.priceGros,
          }),
          ...(data.minQtyGros !== undefined && { minQtyGros: data.minQtyGros }),
          ...(data.stock !== undefined && { stock: data.stock }),
          ...(data.lowStockAlert !== undefined && {
            lowStockAlert: data.lowStockAlert,
          }),
          ...(data.isPublished !== undefined && {
            isPublished: data.isPublished,
          }),
          ...(data.categoryId !== undefined && {
            categoryId: data.categoryId || null,
          }),
        },
        include: { images: true, category: true },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: session.sub,
          action: "PRODUCT_UPDATE",
          entityType: "Product",
          entityId: params.id,
          before: existing,
          after: { slug: data.slug, sku: data.sku, stock: data.stock },
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });

      return product;
    });

    // 5. Invalider les caches ISR
    revalidateTag("products");
    revalidateTag(`product-${params.id}`);
    revalidateTag(`product-${updated.slug}`);

    return NextResponse.json(updated);
  } catch (error) {
    // 6. Gestion explicite des erreurs Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const field = error.meta?.target?.[0] || "champ";
        return NextResponse.json(
          { error: `${field} déjà utilisé par un autre produit` },
          { status: 409 }
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Produit non trouvé" },
          { status: 404 }
        );
      }
    }

    console.error("[PUT /api/admin/products/[id]]", {
      productId: params.id,
      userId: session.sub,
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Erreur mise à jour produit" },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE — Soft-delete avec vérification commandes actives
// ============================================================
export async function DELETE(request, { params }) {
  const limited = await rateLimit(request, "product-delete", {
    window: 60,
    max: 10,
  });
  if (limited) return limited;

  const session = await requireAdmin(request);
  if (session instanceof NextResponse) return session;

  try {
    // 1. Vérifier existence + commandes actives liées
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orderItems: {
              where: {
                order: {
                  status: {
                    in: ["EN_ATTENTE", "PAYEE", "EN_PREPARATION", "EXPEDIEE"],
                  },
                },
              },
            },
          },
        },
      },
    });

    // Idempotent : si déjà supprimé, retourner 204
    if (!product) {
      return new NextResponse(null, { status: 204 });
    }

    // 2. Bloquer si commandes actives
    if (product._count.orderItems > 0) {
      return NextResponse.json(
        {
          error: "Impossible de supprimer",
          reason: `${product._count.orderItems} commande(s) active(s) référencent ce produit. Dépubliez-le plutôt.`,
          action: "unpublish",
        },
        { status: 409 }
      );
    }

    // 3. Transaction : soft-delete + audit + cleanup Cloudinary
    await prisma.$transaction(async (tx) => {
      // Soft-delete : on dépublie + marque comme supprimé
      await tx.product.update({
        where: { id: params.id },
        data: {
          isPublished: false,
          slug: `${product.slug}-deleted-${Date.now()}`,
          sku: `${product.sku}-DEL-${Date.now()}`,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: session.sub,
          action: "PRODUCT_DELETE",
          entityType: "Product",
          entityId: params.id,
          before: {
            name: product.name,
            slug: product.slug,
            sku: product.sku,
          },
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    });

    // 4. Cleanup Cloudinary (hors transaction, best-effort)
    const images = await prisma.productImage.findMany({
      where: { productId: params.id },
      select: { cloudinaryPublicId: true, id: true },
    });

    await Promise.allSettled(
      images
        .filter((img) => img.cloudinaryPublicId)
        .map((img) =>
          cloudinary.uploader
            .destroy(img.cloudinaryPublicId)
            .catch((err) =>
              console.warn(
                `[Cloudinary] Échec suppression ${img.cloudinaryPublicId}:`,
                err.message
              )
            )
        )
    );

    // Supprimer les images en BDD (le produit est soft-deleted, pas les images)
    await prisma.productImage.deleteMany({
      where: { productId: params.id },
    });

    // 5. Invalider les caches
    revalidateTag("products");
    revalidateTag(`product-${params.id}`);
    revalidateTag(`product-${product.slug}`);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", {
      productId: params.id,
      userId: session.sub,
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Erreur suppression produit" },
      { status: 500 }
    );
  }
}