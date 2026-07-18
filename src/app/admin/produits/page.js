import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Upload, Plus, Pencil } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const metadata = { title: "Produits" };

const TYPE_LABELS = { MOTO: "Moto", TRICYCLE: "Tricycle", PIECE: "Piece" };

async function getProducts({ query, type }) {
  return prisma.product.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(query
        ? {
            OR: [
              { sku: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      category: true,
      // Une seule image : la primaire si elle existe, sinon la premiere
      // par position. Suffisant pour une vignette de liste.
      images: {
        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
        take: 1,
      },
    },
  });
}

function StockCell({ stock, lowStockAlert }) {
  const low = stock <= lowStockAlert;
  return (
    <span className={low ? "font-medium text-danger" : "text-navy-800/80"}>
      {stock}
    </span>
  );
}

function StatusBadge({ isPublished }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        isPublished
          ? "bg-success/10 text-success"
          : "bg-navy-800/10 text-navy-800/60"
      }`}
    >
      {isPublished ? "Publie" : "Brouillon"}
    </span>
  );
}

function Thumbnail({ product }) {
  const url = product.images[0]?.url || "/placeholder-product.jpg";
  return (
    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-offwhite-200">
      <Image
        src={url}
        alt={product.name}
        fill
        className="object-cover"
        sizes="40px"
      />
    </div>
  );
}

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q?.trim() || "";
  const type = params?.type || "";

  const products = await getProducts({ query, type });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Produits
        </h1>
        <div className="flex gap-2">
          <Link
            href="/admin/produits/nouveau"
            className="flex items-center gap-2 rounded-lg bg-mechanic-500 px-4 py-2 text-sm font-medium text-white hover:bg-mechanic-600"
          >
            <Plus size={16} /> Nouveau produit
          </Link>
          <Link
            href="/admin/produits/import"
            className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-900/80"
          >
            <Upload size={16} /> Importer un CSV
          </Link>
        </div>
      </div>

      <form className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="SKU ou nom..."
          className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500 sm:w-56"
        />
        <select
          name="type"
          defaultValue={type}
          className="rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="">Tous types</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-mechanic-500"
        >
          Filtrer
        </button>
      </form>

      {products.length === 0 ? (
        <div className="rounded-xl border border-navy-800/10 bg-white py-16 text-center">
          <p className="text-sm text-navy-800/60">
            {query || type
              ? "Aucun produit ne correspond a ces criteres."
              : "Aucun produit pour le moment."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop : table */}
          <div className="hidden overflow-x-auto rounded-xl border border-navy-800/10 bg-white md:block">
            <table className="w-full text-sm">
              <thead className="bg-offwhite-200 text-left text-navy-800/70">
                <tr>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2">SKU</th>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Prix detail</th>
                  <th className="px-4 py-2">Prix gros</th>
                  <th className="px-4 py-2">Stock</th>
                  <th className="px-4 py-2">Statut</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-navy-800/5">
                    <td className="px-4 py-2">
                      <Thumbnail product={p} />
                    </td>
                    <td className="px-4 py-2 text-navy-800/70">{p.sku}</td>
                    <td className="px-4 py-2 font-medium text-navy-900">
                      {p.name}
                    </td>
                    <td className="px-4 py-2 text-navy-800/70">
                      {TYPE_LABELS[p.type] || p.type}
                    </td>
                    <td className="px-4 py-2">
                      {Number(p.priceDetail).toLocaleString("fr-FR")} GNF
                    </td>
                    <td className="px-4 py-2 text-navy-800/70">
                      {Number(p.priceGros).toLocaleString("fr-FR")} GNF
                      <span className="ml-1 text-xs text-navy-800/40">
                        (≥{p.minQtyGros})
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <StockCell
                        stock={p.stock}
                        lowStockAlert={p.lowStockAlert}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge isPublished={p.isPublished} />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/produits/${p.id}`}
                          title="Modifier"
                          className="rounded-lg p-2 text-navy-800/70 hover:bg-navy-800/5"
                        >
                          <Pencil size={16} />
                        </Link>
                        <DeleteProductButton
                          productId={p.id}
                          productName={p.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile : cards */}
          <div className="space-y-3 md:hidden">
            {products.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-navy-800/10 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Thumbnail product={p} />
                    <div>
                      <p className="font-medium text-navy-900">{p.name}</p>
                      <p className="mt-0.5 text-xs text-navy-800/60">
                        {p.sku} · {TYPE_LABELS[p.type] || p.type}
                      </p>
                    </div>
                  </div>
                  <StatusBadge isPublished={p.isPublished} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-navy-800/70">
                  <div>
                    <p className="text-navy-800/40">Detail</p>
                    <p className="font-medium text-navy-900">
                      {Number(p.priceDetail).toLocaleString("fr-FR")} GNF
                    </p>
                  </div>
                  <div>
                    <p className="text-navy-800/40">Gros (≥{p.minQtyGros})</p>
                    <p className="font-medium text-navy-900">
                      {Number(p.priceGros).toLocaleString("fr-FR")} GNF
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span>
                    Stock :{" "}
                    <StockCell
                      stock={p.stock}
                      lowStockAlert={p.lowStockAlert}
                    />
                  </span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/produits/${p.id}`}
                      className="rounded-lg p-2 text-navy-800/70 hover:bg-navy-800/5"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteProductButton
                      productId={p.id}
                      productName={p.name}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
