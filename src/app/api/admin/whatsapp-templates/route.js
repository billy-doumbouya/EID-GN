// src/app/api/admin/whatsapp-templates/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listAvailableTemplates } from "@/lib/whatsappTemplates";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  return NextResponse.json({ templates: listAvailableTemplates() });
}
