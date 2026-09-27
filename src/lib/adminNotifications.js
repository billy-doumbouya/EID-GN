import { EventEmitter } from "events";
import { prisma } from "@/lib/prisma";

export const notificationEmitter = new EventEmitter();
notificationEmitter.setMaxListeners(100);

// Suivi en mémoire des horodatages de lecture par utilisateur admin
const userReadTimestamps = new Map();

export function markAsRead(userId = "default") {
  userReadTimestamps.set(userId, Date.now());
}

export function broadcastNotification(notif) {
  notificationEmitter.emit("notification", notif);
}

export async function fetchAdminNotifications(userId = "default") {
  const readTimestamp = userReadTimestamps.get(userId) || 0;

  try {
    // 1. Alertes de stock faible ou rupture
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 3 }, isPublished: true },
      select: { id: true, name: true, sku: true, stock: true, updatedAt: true },
      take: 10,
    });

    // 2. Commandes récentes nécessitant attention
    const recentOrders = await prisma.order.findMany({
      where: {
        status: { in: ["EN_ATTENTE", "PAYEE", "EN_PREPARATION"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        guestFullName: true,
        user: { select: { name: true } },
      },
    });

    const notifications = [];

    for (const p of lowStockProducts) {
      const time = new Date(p.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      notifications.push({
        id: `stock-${p.id}`,
        title: p.stock === 0 ? "Rupture de stock" : "Stock faible",
        message: `${p.name} (${p.sku}) — ${
          p.stock === 0 ? "Épuisé (0 en stock)" : `${p.stock} unités restantes`
        }`,
        time,
        type: "stock",
        severity: p.stock === 0 ? "critical" : "warning",
        timestamp: new Date(p.updatedAt).getTime(),
      });
    }

    for (const o of recentOrders) {
      const clientName = o.user?.name || o.guestFullName || "Client";
      const time = new Date(o.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      notifications.push({
        id: `order-${o.orderNumber}`,
        title: `Commande #${o.orderNumber}`,
        message: `${clientName} • ${(o.total || 0).toLocaleString(
          "fr-FR"
        )} GNF • ${o.status}`,
        time,
        type: "order",
        severity: o.status === "PAYEE" ? "info" : "warning",
        timestamp: new Date(o.createdAt).getTime(),
      });
    }

    // Tri par date décroissante
    notifications.sort((a, b) => b.timestamp - a.timestamp);

    const unreadCount = notifications.filter(
      (n) => n.timestamp > readTimestamp
    ).length;

    return { notifications, unreadCount };
  } catch (err) {
    console.error("[fetchAdminNotifications] error:", err);
    return { notifications: [], unreadCount: 0 };
  }
}
