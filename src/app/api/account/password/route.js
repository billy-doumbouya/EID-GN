import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Veuillez remplir tous les champs" },
        { status: 400 },
      );
    }

    // Récupérer l'utilisateur avec son hash actuel
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    // Vérifier si l'ancien mot de passe est correct
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Le mot de passe actuel est incorrect" },
        { status: 400 },
      );
    }

    // Hasher et enregistrer le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.sub },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Mot de passe mis à jour avec succès" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur changement mot de passe:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors du changement de mot de passe" },
      { status: 500 },
    );
  }
}
