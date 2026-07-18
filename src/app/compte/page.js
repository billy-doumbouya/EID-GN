import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  Package,
  Truck,
  Receipt,
  Heart,
  ChevronRight,
  ShoppingBag,
  Wallet,
} from "lucide-react";

export const metadata = { title: "Mon tableau de bord" };

const IN_PROGRESS_STATUSES = ["PAYEE", "EN_PREPARATION", "EXPEDIEE"];
const COUNTS_TOWARD_SPENDING = [
  "PAYEE",
  "EN_PREPARATION",
  "EXPEDIEE",
  "LIVREE",
];

const STATUS_LABELS = {
  EN_ATTENTE: "En attente de paiement",
  PAYEE: "Confirmee",
  EN_PREPARATION: "En preparation",
  EXPEDIEE: "Expediee",
  LIVREE: "Livree",
  ANNULEE: "Annulee",
};

export default async function ComptePage() {
  const session = await getCurrentUser();
  if (!session) redirect("/connexion?next=/compte");

  const [user, orders, favoritesCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: { fullName: true },
    }),
    prisma.order.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      select: { id: true, orderNumber: true, status: true, total: true },
    }),
    prisma.favorite.count({ where: { userId: session.sub } }),
  ]);

  const activeOrder = orders.find((o) =>
    IN_PROGRESS_STATUSES.includes(o.status),
  );
  const totalSpent = orders
    .filter((o) => COUNTS_TOWARD_SPENDING.includes(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0);
  const firstName = user?.fullName?.split(" ")[0] || "";

  const shortcuts = [
    {
      href: "/compte/commandes",
      label: "Mes commandes",
      icon: Package,
      count: orders.length,
    },
    { href: "/compte/suivi", label: "Suivi livraison", icon: Truck },
    { href: "/compte/recus", label: "Mes recus", icon: Receipt },
    {
      href: "/compte/favoris",
      label: "Favoris",
      icon: Heart,
      count: favoritesCount,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-navy-900">
          Bonjour{firstName ? ` ${firstName}` : ""} 👋
        </h2>
        <p className="text-sm text-navy-800/60">
          Voici un apercu de votre compte.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-navy-800/10 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-mechanic-500/10 p-2.5">
              <ShoppingBag size={18} className="text-mechanic-500" />
            </div>
            <div>
              <p className="text-xs text-navy-800/50">Commandes</p>
              <p className="text-lg font-semibold text-navy-900">
                {orders.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-navy-800/10 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-success/10 p-2.5">
              <Wallet size={18} className="text-success" />
            </div>
            <div>
              <p className="text-xs text-navy-800/50">Total depense</p>
              <p className="text-lg font-semibold text-navy-900">
                {totalSpent.toLocaleString("fr-FR")} GNF
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-navy-800/10 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-danger/10 p-2.5">
              <Heart size={18} className="text-danger" />
            </div>
            <div>
              <p className="text-xs text-navy-800/50">Favoris</p>
              <p className="text-lg font-semibold text-navy-900">
                {favoritesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Commande en cours */}
      {activeOrder && (
        <div className="rounded-xl border border-mechanic-500/20 bg-mechanic-500/5 p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-navy-900">
              Commande en cours
            </p>
            <Link
              href="/compte/suivi"
              className="text-xs font-medium text-mechanic-500 hover:underline"
            >
              Suivre la livraison
            </Link>
          </div>
          <p className="text-sm text-navy-800/70">
            {activeOrder.orderNumber} — {STATUS_LABELS[activeOrder.status]}
          </p>
        </div>
      )}

      {/* Raccourcis */}
      <div>
        <p className="mb-3 text-sm font-semibold text-navy-900">Acces rapide</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {shortcuts.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-center justify-between rounded-xl border border-navy-800/10 bg-white p-4 transition-colors hover:border-mechanic-500/40"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-offwhite-200 p-2">
                  <s.icon size={16} className="text-navy-800/70" />
                </div>
                <span className="text-sm font-medium text-navy-900">
                  {s.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {s.count !== undefined && (
                  <span className="text-xs text-navy-800/50">{s.count}</span>
                )}
                <ChevronRight size={16} className="text-navy-800/30" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
