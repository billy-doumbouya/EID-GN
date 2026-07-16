import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Download } from "lucide-react";

export const metadata = { title: "Mes recus" };

export default async function ReceiptsPage() {
  const session = await getCurrentUser();
  const receipts = await prisma.receipt.findMany({
    where: { order: { userId: session.sub } },
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });

  if (receipts.length === 0) {
    return <p className="text-navy-800/60">Aucun recu disponible pour le moment.</p>;
  }

  return (
    <div className="space-y-3">
      {receipts.map((receipt) => (
        <a
          key={receipt.id}
          href={receipt.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl border border-navy-800/10 bg-white p-4 hover:shadow-sm"
        >
          <span className="font-medium text-navy-900">{receipt.order.orderNumber}</span>
          <Download size={18} className="text-mechanic-500" />
        </a>
      ))}
    </div>
  );
}
