// src/components/admin/StatsCharts.jsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, ShoppingBag, Package, AlertCircle } from "lucide-react";

// Palette élargie
const COLORS = [
  "#1a2332", // navy-800
  "#ea580c", // mechanic-500
  "#f5a623", // amber-500
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
];

const TYPE_LABELS = {
  MOTO: "Motos",
  TRICYCLE: "Tricycles",
  PIECE: "Pièces détachées",
};

// Variants des cartes. Le délai d'apparition est géré via `custom={i}`,
// donc pas besoin de staggerChildren sur un parent : chaque carte
// contrôle son propre timing indépendamment.
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.5,
      type: "spring",
      stiffness: 200,
    },
  }),
  hover: {
    opacity: 1,
    scale: 1.02,
    y: -6,
    boxShadow: "0 20px 40px -12px rgba(0,0,0,0.25)",
    transition: { duration: 0.2 },
  },
};

function ChartSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-navy-800/10 bg-white p-4 shadow-sm">
      <div className="mb-4 h-4 w-48 animate-pulse rounded bg-offwhite-200" />
      <div className="relative h-60 animate-pulse overflow-hidden rounded-lg bg-offwhite-200">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
    </div>
  );
}

// Tooltip personnalisé
const CustomTooltip = ({ active, payload, label, formatter, unit = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-navy-900/90 p-3 text-white backdrop-blur-md shadow-xl">
        <p className="text-xs font-medium text-white/60">{label}</p>
        {payload.map((entry, idx) => (
          <p
            key={idx}
            className="text-sm font-semibold"
            style={{ color: entry.color }}
          >
            {formatter ? formatter(entry.value) : `${entry.value} ${unit}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

async function fetchStats() {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Impossible de charger les statistiques");
  return res.json();
}

export function StatsCharts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchStats,
    staleTime: 60_000,
  });

  // IMPORTANT : ce ref doit être attaché à un élément monté dès le tout
  // premier rendu, quel que soit l'état (loading / error / succès).
  // Sinon useInView observe `null` au montage, et comme son
  // IntersectionObserver ne se réattache pas automatiquement à un
  // nouveau nœud DOM, `isInView` reste bloqué à `false` pour toujours
  // une fois que le vrai contenu est monté — les cartes restent alors
  // à opacity: 0 en permanence, et seul `whileHover` les rendait visibles.
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  if (isLoading) {
    return (
      <div ref={containerRef} className="grid gap-6 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
        <div className="md:col-span-2">
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        ref={containerRef}
        className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger"
      >
        <AlertCircle className="inline-block mr-2 h-4 w-4" />
        Erreur de chargement des statistiques. Réessayez dans quelques instants.
      </div>
    );
  }

  // Préparation des données
  const revenueData = (data.revenueByDay || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
    revenue: Number(d.revenue),
  }));

  const typeData = (data.byType || []).map((t) => ({
    name: TYPE_LABELS[t.type] || t.type,
    value: t._count.id,
  }));

  const topProductsData = (data.topProducts || []).map((p) => ({
    name: p.name.length > 18 ? `${p.name.slice(0, 18)}...` : p.name,
    quantity: p.quantity,
  }));

  const totalRevenue = data.totalRevenue || 0;
  const totalOrders = data.totalOrders || 0;
  const totalProducts = data.totalProducts || 0;

  const kpis = [
    {
      icon: TrendingUp,
      label: "Chiffre d'affaires",
      value: totalRevenue.toLocaleString("fr-FR") + " GNF",
      color: "text-mechanic-500",
      bg: "bg-mechanic-500/10",
    },
    {
      icon: ShoppingBag,
      label: "Commandes",
      value: totalOrders,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      icon: Package,
      label: "Produits en ligne",
      value: totalProducts,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            whileHover="hover"
            className="group relative overflow-hidden rounded-xl border border-navy-800/10 bg-white p-5 shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-navy-800/50">
                  {kpi.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-navy-900">
                  {kpi.value}
                </p>
              </div>
              <div className={`rounded-full ${kpi.bg} p-3`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-mechanic-500/0 via-mechanic-500/50 to-mechanic-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chiffre d'affaires */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          whileHover="hover"
          className="rounded-xl border border-navy-800/10 bg-white p-4 shadow-sm transition-all"
        >
          <h3 className="mb-4 text-sm font-semibold text-navy-900">
            Chiffre d'affaires (30 derniers jours)
          </h3>
          {revenueData.length === 0 ? (
            <p className="py-16 text-center text-sm text-navy-800/50">
              Pas encore de données sur cette période.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#f5a623" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={(v) => `${v.toLocaleString("fr-FR")} GNF`}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#ea580c" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Répartition du catalogue */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          whileHover="hover"
          className="rounded-xl border border-navy-800/10 bg-white p-4 shadow-sm transition-all"
        >
          <h3 className="mb-4 text-sm font-semibold text-navy-900">
            Répartition du catalogue
          </h3>
          {typeData.length === 0 ? (
            <p className="py-16 text-center text-sm text-navy-800/50">
              Aucun produit publié.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Top produits */}
        <motion.div
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          whileHover="hover"
          className="rounded-xl border border-navy-800/10 bg-white p-4 shadow-sm transition-all md:col-span-2"
        >
          <h3 className="mb-4 text-sm font-semibold text-navy-900">
            Top 5 produits vendus
          </h3>
          {topProductsData.length === 0 ? (
            <p className="py-16 text-center text-sm text-navy-800/50">
              Aucune vente enregistrée pour le moment.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={topProductsData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#f5a623" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e5e0"
                  horizontal={false}
                />
                <XAxis type="number" fontSize={11} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  fontSize={11}
                  width={120}
                />
                <Tooltip
                  content={<CustomTooltip formatter={(v) => `${v} unité(s)`} />}
                />
                <Bar
                  dataKey="quantity"
                  fill="url(#barGradient)"
                  radius={[0, 6, 6, 0]}
                >
                  {topProductsData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Stock faible */}
        <motion.div
          custom={6}
          variants={cardVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          whileHover="hover"
          className="rounded-xl border border-navy-800/10 bg-white p-4 shadow-sm transition-all md:col-span-2"
        >
          <h3 className="mb-4 text-sm font-semibold text-navy-900">
            ⚠️ Stock faible / à réapprovisionner
          </h3>
          {data.lowStock?.length ? (
            <ul className="divide-y divide-navy-800/5">
              {data.lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-navy-900">{p.name}</span>
                  <span className="font-medium text-danger">
                    {p.stock} restant(s)
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy-800/60">
              Aucun produit en stock faible actuellement.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
