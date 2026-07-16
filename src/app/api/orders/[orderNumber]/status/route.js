// src/app/api/orders/[orderNumber]/status/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { status: true },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Commande introuvable" },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: order.status });
}
