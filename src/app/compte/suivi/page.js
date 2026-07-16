import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Suivi livraison" };

const STEPS = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];
const STEP_LABELS = {
  PAYEE: "Commande confirmee",
  EN_PREPARATION: "En preparation",
  EXPEDIEE: "Expediee",
  LIVREE: "Livree",
};

export default async function TrackingPage() {
  const session = await getCurrentUser();
  const activeOrders = await prisma.order.findMany({
    where: { userId: session.sub, status: { in: STEPS } },
    orderBy: { createdAt: "desc" },
  });

  if (activeOrders.length === 0) {
    return <p className="text-navy-800/60">Aucune livraison en cours.</p>;
  }

  return (
    <div className="space-y-6">
      {activeOrders.map((order) => {
        const currentIndex = STEPS.indexOf(order.status);
        return (
          <div key={order.id} className="rounded-xl border border-navy-800/10 bg-white p-4">
            <p className="mb-4 font-medium text-navy-900">{order.orderNumber}</p>
            <div className="flex items-center">
              {STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                      i <= currentIndex ? "bg-mechanic-500 text-white" : "bg-offwhite-200 text-navy-800/40"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 ${i < currentIndex ? "bg-mechanic-500" : "bg-offwhite-200"}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-navy-800/60">{STEP_LABELS[order.status]}</p>
          </div>
        );
      })}
    </div>
  );
}
