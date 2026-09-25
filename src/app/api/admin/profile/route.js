import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(request) {
  try {
    const session = await getCurrentUser();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { avatarUrl, password } = body;

    const dataToUpdate = {};
    if (avatarUrl !== undefined) {
      dataToUpdate.avatarUrl = avatarUrl;
    }
    
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Le mot de passe doit faire au moins 6 caractères" },
          { status: 400 }
        );
      }
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.sub },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur update profil admin:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
