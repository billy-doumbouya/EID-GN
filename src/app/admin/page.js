import { StatsCharts } from "@/components/admin/StatsCharts";

export const metadata = { title: "Vue d'ensemble" };

export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy-900">Vue d'ensemble</h1>
      <StatsCharts />
    </div>
  );
}
