import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ClientTabs } from "@/components/dashboard/ClientTabs";
import { ZigzagDivider } from "@/components/ZigzagDivider";

export default async function CompteLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte");

  return (
    <div>
      <div className="bg-navy-900 py-10 text-white" data-aos="fade">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <h1 className="font-display text-2xl font-semibold">Mon compte</h1>
        </div>
      </div>
    <ZigzagDivider color="var(--color-navy-900)" flip />


      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <ClientTabs />
        <div className="mt-6" data-aos="fade-up">{children}</div>
      </div>
    </div>
  );
}
