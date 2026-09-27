import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markAsRead } from "@/lib/adminNotifications";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    markAsRead(user.sub);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/admin/notifications/mark-read]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
