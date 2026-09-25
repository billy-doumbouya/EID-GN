import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { isSuspended } = body;

    const user = await prisma.user.update({
      where: { id },
      data: { isSuspended },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Erreur suspension client:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    
    // Check if it's not the last admin
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (targetUser?.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Impossible de supprimer le dernier administrateur" }, { status: 400 });
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression client:", error);
    return NextResponse.json({ error: "Erreur serveur (vérifiez les contraintes de base de données)" }, { status: 500 });
  }
}
