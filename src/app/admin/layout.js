export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login?redirect=/admin");
  }

  return (
    <div className="flex min-h-screen bg-black text-zinc-300 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="relative z-10 flex w-full">
        <AdminSidebar />
        <div className="flex-1 pb-16 lg:pb-0 lg:pl-64">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 animate-fade-up">{children}</div>
        </div>
      </div>
    </div>
  );
}
