// src/app/(admin)/admin/commandes/page.js
import { prisma } from "@/lib/prisma";
import { StatusControl } from "./StatusControl";

export const metadata = { title: "Commandes" };

// Labels seuls, pour peupler le filtre deroulant. Les styles/couleurs par
// statut vivent maintenant dans StatusControl.jsx, pas besoin de les
// dupliquer ici puisque ce select n'affiche que du texte.
const STATUS_FILTER_LABELS = {
  EN_ATTENTE: "En attente",
  PAYEE: "Payee",
  EN_PREPARATION: "En preparation",
  EXPEDIEE: "Expediee",
  LIVREE: "Livree",
  ANNULEE: "Annulee",
};

function getCustomerName(order) {
  return order.user?.fullName || order.guestFullName || "Client anonyme";
}

async function getOrders({ query, status }) {
  return prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(query
        ? {
            OR: [
              { orderNumber: { contains: query, mode: "insensitive" } },
              { guestFullName: { contains: query, mode: "insensitive" } },
              { guestPhone: { contains: query, mode: "insensitive" } },
              { user: { fullName: { contains: query, mode: "insensitive" } } },
              { user: { phone: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true, user: { select: { fullName: true } } },
  });
}

export default async function AdminOrdersPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q?.trim() || "";
  const status = params?.status || "";

  const orders = await getOrders({ query, status });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-100">
          Commandes
        </h1>

        <form className="flex flex-wrap gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Numéro, client, téléphone..."
            className="w-full rounded-none border border-zinc-800 bg-black px-3 py-2 text-sm text-emerald-400 outline-none focus-visible:border-emerald-500 sm:w-56"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-none border border-zinc-800 bg-black px-3 py-2 text-sm text-emerald-400 outline-none"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_FILTER_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-none border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all"
          >
            Filtrer
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-none border border-zinc-800 bg-black py-16 text-center shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
          <p className="text-sm text-zinc-500">
            {query || status
              ? "Aucune commande ne correspond à ces critères."
              : "Aucune commande pour le moment."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop : table */}
          <div className="hidden overflow-x-auto rounded-none border border-zinc-800 bg-black md:block shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
            <table className="w-full text-sm text-zinc-400">
              <thead className="bg-zinc-950 text-left text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Numéro</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Articles</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-300">
                      {o.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      {getCustomerName(o)}
                    </td>
                    <td className="px-4 py-3 text-emerald-500">
                      {o.items.length}
                    </td>
                    <td className="px-4 py-3">
                      {Number(o.total).toLocaleString("fr-FR")} GNF
                    </td>
                    <td className="px-4 py-3">
                      <StatusControl
                        orderNumber={o.orderNumber}
                        status={o.status}
                      />
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile : cards empilees */}
          <div className="space-y-3 md:hidden">
            {orders.map((o) => (
              <div
                key={o.id}
                className="rounded-none border border-zinc-800 bg-black p-4 shadow-[inset_0_0_20px_rgba(0,0,0,1)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-300">{o.orderNumber}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {getCustomerName(o)}
                    </p>
                  </div>
                  <StatusControl
                    orderNumber={o.orderNumber}
                    status={o.status}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-navy-800/60">
                  <span>
                    {o.items.length} article{o.items.length > 1 ? "s" : ""}
                  </span>
                  <span>
                    {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-mechanic-500">
                  {Number(o.total).toLocaleString("fr-FR")} GNF
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
