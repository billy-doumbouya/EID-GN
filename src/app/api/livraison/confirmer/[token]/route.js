// src/app/api/livraison/confirmer/[token]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  const { token } = await params;

  const order = await prisma.order.findUnique({
    where: { deliveryToken: token },
    select: { id: true, orderNumber: true, status: true },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Lien invalide ou expire" },
      { status: 404 },
    );
  }

  if (order.status !== "EXPEDIEE") {
    return NextResponse.json(
      { error: `Cette commande est deja au statut : ${order.status}` },
      { status: 409 },
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "LIVREE", deliveryConfirmedAt: new Date() },
  });

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: "LIVREE",
  });
}
