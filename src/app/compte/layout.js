import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ClientSidebar } from "@/components/dashboard/ClientSidebar";

export default async function CompteLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte");

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-offwhite-100">
      <ClientSidebar />

      <div className="flex-1 pb-16 lg:pb-0 lg:pl-56">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-navy-900 font-display">
              Mon espace client
            </h1>
          </div>
          <div className="animate-fade-up">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
