import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// src/app/api/stats/route.js
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    revenueByDay,
    topProductsRaw,
    byType,
    lowStock,
    totalProducts,
    totalOrdersAgg,
  ] = await Promise.all([
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, SUM(total) as revenue
      FROM "Order"
      WHERE status = 'PAYEE' AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.product.groupBy({ by: ["type"], _count: { id: true } }),
    prisma.$queryRaw`
      SELECT id, name, stock, "lowStockAlert" FROM "Product"
      WHERE stock <= "lowStockAlert" AND "isPublished" = true
      LIMIT 10
    `,
    prisma.product.count({ where: { isPublished: true } }),
    prisma.order.aggregate({
      where: { status: "PAYEE", createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      _sum: { total: true },
    }),
  ]);

  // groupBy ne fait pas de jointure — on enrichit avec le nom du produit
  const productNames = await prisma.product.findMany({
    where: { id: { in: topProductsRaw.map((p) => p.productId) } },
    select: { id: true, name: true },
  });
  const nameById = Object.fromEntries(productNames.map((p) => [p.id, p.name]));

  const topProducts = topProductsRaw.map((p) => ({
    productId: p.productId,
    name: nameById[p.productId] || "Produit supprime",
    quantity: p._sum.quantity,
  }));

  return NextResponse.json({
    revenueByDay,
    topProducts,
    byType,
    lowStock,
    totalProducts,
    totalOrders: totalOrdersAgg._count.id,
    totalRevenue: Number(totalOrdersAgg._sum.total || 0),
  });
}