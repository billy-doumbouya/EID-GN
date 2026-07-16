// src/app/(admin)/admin/clients/page.js
import { prisma } from "@/lib/prisma";
import { cva } from "class-variance-authority";
import { Mail, MessageCircle } from "lucide-react";

export const metadata = { title: "Clients" };

const optinBadge = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      active: {
        true: "bg-success/10 text-success",
        false: "bg-navy-800/5 text-navy-800/30",
      },
    },
  },
);

async function getClients(query) {
  return prisma.user.findMany({
    where: {
      role: "CLIENT",
      ...(query
        ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { orders: true } } },
  });
}

function OptinBadges({ email, whatsapp }) {
  if (!email && !whatsapp) {
    return <span className="text-xs text-navy-800/30">Aucun</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className={optinBadge({ active: email })}>
        <Mail size={12} /> Email
      </span>
      <span className={optinBadge({ active: whatsapp })}>
        <MessageCircle size={12} /> WhatsApp
      </span>
    </div>
  );
}

export default async function AdminClientsPage({ searchParams }) {
  const query = (await searchParams)?.q?.trim() || "";
  const clients = await getClients(query);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Clients
        </h1>

        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Nom, email ou telephone..."
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500 sm:w-64"
          />
          <button
            type="submit"
            className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-mechanic-500"
          >
            Rechercher
          </button>
        </form>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-navy-800/10 bg-white py-16 text-center">
          <p className="text-sm text-navy-800/60">
            {query
              ? `Aucun client ne correspond a "${query}".`
              : "Aucun client pour le moment."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop : table */}
          <div className="hidden overflow-x-auto rounded-xl border border-navy-800/10 bg-white md:block">
            <table className="w-full text-sm">
              <thead className="bg-offwhite-200 text-left text-navy-800/70">
                <tr>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Telephone</th>
                  <th className="px-4 py-2">Commandes</th>
                  <th className="px-4 py-2">Opt-in</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-t border-navy-800/5">
                    <td className="px-4 py-2 font-medium text-navy-900">
                      {c.fullName}
                    </td>
                    <td className="px-4 py-2 text-navy-800/70">{c.email}</td>
                    <td className="px-4 py-2 text-navy-800/70">
                      {c.phone || "—"}
                    </td>
                    <td className="px-4 py-2">{c._count.orders}</td>
                    <td className="px-4 py-2">
                      <OptinBadges
                        email={c.optInEmail}
                        whatsapp={c.optInWhatsapp}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile : cards empilees */}
          <div className="space-y-3 md:hidden">
            {clients.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-navy-800/10 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-navy-900">{c.fullName}</p>
                    <p className="mt-0.5 text-xs text-navy-800/60">{c.email}</p>
                    <p className="text-xs text-navy-800/60">{c.phone || "—"}</p>
                  </div>
                  <span className="rounded-full bg-offwhite-200 px-2 py-1 text-xs font-medium text-navy-900">
                    {c._count.orders} cmd
                  </span>
                </div>
                <div className="mt-3">
                  <OptinBadges
                    email={c.optInEmail}
                    whatsapp={c.optInWhatsapp}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
