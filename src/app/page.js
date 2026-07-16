// app/page.jsx (ou src/app/page.jsx)
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { ZigzagDivider } from "@/components/ZigzagDivider";
import { AnimatedHero } from "@/components/homePage/AnimatedHero";
import { PageTransition } from "@/components/motion/PageTransition";
import { CategoryCard } from "@/components/homePage/CategoryCard";
import { TrustBadge } from "@/components/homePage/TrustBadge";
import { FloatingCTA } from "@/components/homePage/FloatingCTA";

// Nouveaux composants importés


async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    stock: p.stock,
    lowStockAlert: p.lowStockAlert,
    image: p.images[0]?.url || "/placeholder-product.jpg",
  }));
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <PageTransition>
      {/* Hero avec animations complexes */}
      <AnimatedHero />

      <ZigzagDivider color="var(--color-offwhite-100)" />

      {/* Catégories interactives 3D */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Reveal>
          <h2 className="font-display text-3xl font-bold text-navy-900 text-center mb-8">
            Explorez nos gammes
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              href: "/motos",
              label: "Motos",
              desc: "Neuves et occasions vérifiées",
              icon: "Bike",
            },
            {
              href: "/tricycles",
              label: "Tricycles",
              desc: "Transport et marchandises",
              icon: "Truck",
            },
            {
              href: "/pieces",
              label: "Pièces détachées",
              desc: "Filtrable par modèle compatible",
              icon: "Wrench",
            },
          ].map((cat, i) => (
            <CategoryCard key={cat.href} {...cat} delay={i * 0.1} />
          ))}
        </div>
      </section>

      <ZigzagDivider color="var(--color-navy-900)" flip />

      {/* Produits vedettes avec animations au scroll */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-navy-900">
              🔥 Nouveautés
            </h2>
          </Reveal>
          <Link
            href="/pieces"
            className="text-sm font-medium text-mechanic-500 hover:underline transition-all hover:scale-105"
          >
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product, i) => (
            <Reveal
              key={product.id}
              delay={Math.min(i * 0.06, 0.4)}
              className="h-full"
            >
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      <ZigzagDivider color="var(--color-navy-900)" flip />

      {/* Bandeau de confiance animé */}
      <TrustBadge />

      {/* CTA flottant (apparaît au scroll) */}
      <FloatingCTA />
    </PageTransition>
  );
}
