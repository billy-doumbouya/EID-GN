// src/app/api/favorites/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: "productId requis" }, { status: 400 });
  }

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_productId: { userId: session.sub, productId },
    },
    create: { userId: session.sub, productId },
    update: {},
  });

  return NextResponse.json({ favorited: true, id: favorite.id });
}

export async function DELETE(request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Non connecte" }, { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: "productId requis" }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: { userId: session.sub, productId },
  });

  return NextResponse.json({ favorited: false });
}
