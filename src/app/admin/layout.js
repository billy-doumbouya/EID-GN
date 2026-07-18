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
    <div className="flex min-h-screen bg-offwhite-100">
      <AdminSidebar />
      <div className="flex-1 pb-16 lg:pb-0 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8" data-aos="fade-up">{children}</div>
      </div>
    </div>
  );
}
