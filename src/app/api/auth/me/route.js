import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// Utilise par la Navbar (composant client) pour savoir si l'utilisateur
// connecte est admin et afficher - ou non - le lien vers /admin.
export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { role: session.role, email: session.email } });
}
