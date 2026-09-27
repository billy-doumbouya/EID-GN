import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { notificationEmitter } from "@/lib/adminNotifications";

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Écoute des nouvelles notifications en temps réel
      const onNotification = (notif) => {
        try {
          controller.enqueue(
            encoder.encode(
              `event: notification\ndata: ${JSON.stringify(notif)}\n\n`
            )
          );
        } catch {}
      };

      notificationEmitter.on("notification", onNotification);

      // 2. Heartbeat toutes les 25s pour garder la connexion ouverte
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 25000);

      // 3. Nettoyage à la déconnexion
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        notificationEmitter.off("notification", onNotification);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
