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
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Commandes
        </h1>

        <form className="flex flex-wrap gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Numero, client, telephone..."
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500 sm:w-56"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Tous statuts</option>
            {Object.entries(STATUS_FILTER_LABELS).map(([value, label]) => (
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
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-navy-800/10 bg-white py-16 text-center">
          <p className="text-sm text-navy-800/60">
            {query || status
              ? "Aucune commande ne correspond a ces criteres."
              : "Aucune commande pour le moment."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop : table */}
          <div className="hidden overflow-x-auto rounded-xl border border-navy-800/10 bg-white md:block">
            <table className="w-full text-sm">
              <thead className="bg-offwhite-200 text-left text-navy-800/70">
                <tr>
                  <th className="px-4 py-2">Numero</th>
                  <th className="px-4 py-2">Client</th>
                  <th className="px-4 py-2">Articles</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Statut</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-navy-800/5">
                    <td className="px-4 py-2 font-medium text-navy-900">
                      {o.orderNumber}
                    </td>
                    <td className="px-4 py-2 text-navy-800/70">
                      {getCustomerName(o)}
                    </td>
                    <td className="px-4 py-2 text-navy-800/70">
                      {o.items.length}
                    </td>
                    <td className="px-4 py-2">
                      {Number(o.total).toLocaleString("fr-FR")} GNF
                    </td>
                    <td className="px-4 py-2">
                      <StatusControl
                        orderNumber={o.orderNumber}
                        status={o.status}
                      />
                    </td>
                    <td className="px-4 py-2 text-navy-800/50">
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
                className="rounded-xl border border-navy-800/10 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-navy-900">{o.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-navy-800/60">
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
