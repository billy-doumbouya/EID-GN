import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUS_LABELS = {
  EN_ATTENTE: "En attente de paiement",
  PAYEE: "Payee",
  EN_PREPARATION: "En preparation",
  EXPEDIEE: "Expediee",
  LIVREE: "Livree",
  ANNULEE: "Annulee",
};

// Normalise un numero de telephone guineen pour la comparaison (retire
// espaces, tirets, prefixe +224/224 eventuel) - evite les faux negatifs si
// le client tape son numero avec un format legerement different de celui
// enregistre a la commande.
function normalizePhone(phone) {
  return phone.replace(/[\s-]/g, "").replace(/^(\+224|224)/, "");
}

export async function POST(request) {
  try {
    const { orderNumber, phone } = await request.json();

    if (!orderNumber || !phone) {
      return NextResponse.json(
        { error: "Numero de commande et telephone requis" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        guestPhone: true,
        user: { select: { phone: true } },
        items: {
          select: { quantity: true, product: { select: { name: true } } },
        },
      },
    });

    // Meme message si la commande n'existe pas OU si le telephone ne
    // correspond pas : on ne veut jamais confirmer a un tiers qu'un
    // numero de commande donne existe reellement.
    const ownerPhone = order?.guestPhone || order?.user?.phone;
    if (!order || normalizePhone(ownerPhone || "") !== normalizePhone(phone)) {
      return NextResponse.json(
        { error: "Aucune commande trouvee avec ces informations" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] || order.status,
      total: Number(order.total),
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        productName: i.product.name,
        quantity: i.quantity,
      })),
    });
  } catch (error) {
    console.error("Erreur lookup commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 },
    );
  }
}
