import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fetchAdminNotifications } from "@/lib/adminNotifications";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé", notifications: [], unreadCount: 0 },
        { status: 403 }
      );
    }

    const data = await fetchAdminNotifications(user.sub);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/admin/notifications]", error);
    return NextResponse.json(
      { notifications: [], unreadCount: 0 },
      { status: 500 }
    );
  }
}
