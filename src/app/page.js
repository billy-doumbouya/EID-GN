// app/page.jsx (ou src/app/page.jsx)
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { PageTransition } from "@/components/motion/PageTransition";
import { AnimatedHero } from "@/components/homePage/AnimatedHero";
import { CategoryCard } from "@/components/homePage/CategoryCard";
import { TrustBadge } from "@/components/homePage/TrustBadge";
import { FloatingCTA } from "@/components/homePage/FloatingCTA";
import { SectionMark } from "@/components/homePage/SectionMark";

const CATEGORIES = [
  {
    href: "/motos",
    label: "Motos",
    desc: "Neuves et occasions vérifiées",
    icon: "Bike",
    code: "CAT.01",
  },
  {
    href: "/tricycles",
    label: "Tricycles",
    desc: "Transport et marchandises",
    icon: "Truck",
    code: "CAT.02",
  },
  {
    href: "/pieces",
    label: "Pièces détachées",
    desc: "Filtrable par modèle compatible",
    icon: "Wrench",
    code: "CAT.03",
  },
];

async function getFeaturedProducts() {
  const now = new Date();
  const activeWindow = { validFrom: { lte: now }, validTo: { gte: now } };

  const products = await prisma.product.findMany({
    where: { isPublished: true },
    include: {
      images: true,
      discounts: { where: activeWindow },
      category: { include: { discounts: { where: activeWindow } } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // Serialisation obligatoire : les Decimal Prisma sont des instances de
  // classe, non transmissibles telles quelles d'un Server Component vers
  // un Client Component (ProductCard).
  return JSON.parse(JSON.stringify(products));
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <PageTransition>
      <AnimatedHero />

      <SectionMark label="EXPLORER LE CATALOGUE" />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.href} {...cat} delay={i * 0.08} />
          ))}
        </div>
      </section>

      <SectionMark label="ARRIVAGES RÉCENTS" />

      {/* Produits vedettes */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-navy-900">
              Nouveautés
            </h2>
          </Reveal>
          <Link
            href="/pieces"
            className="font-mono text-xs uppercase tracking-widest text-mechanic-500 hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i * 0.06, 0.4)} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      <TrustBadge />
      <FloatingCTA />
    </PageTransition>
  );
}