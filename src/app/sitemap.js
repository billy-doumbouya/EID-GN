import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const staticRoutes = ["", "/motos", "/tricycles", "/pieces", "/mentions-legales", "/confidentialite", "/retours"].map(
    (route) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}${route}`,
      lastModified: new Date(),
    })
  );

  const productRoutes = products.map((p) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  return [...staticRoutes, ...productRoutes];
}
