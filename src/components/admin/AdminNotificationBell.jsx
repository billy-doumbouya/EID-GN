"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, AlertTriangle, Package } from "lucide-react";

export function AdminNotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const bellRef = useRef(null);
  const pathname = usePathname();

  // Fetch initial notifications
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        console.error("[notifications] load failed", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // SSE pour les notifications temps réel
  useEffect(() => {
    const eventSource = new EventSource("/api/admin/notifications/stream");

    eventSource.addEventListener("notification", (event) => {
      try {
        const data = JSON.parse(event.data);
        setNotifications((prev) => [data, ...prev].slice(0, 20));
        setUnreadCount((c) => c + 1);

        // Notification navigateur si permission accordée
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(data.title, { body: data.message });
        }
      } catch (err) {
        console.error("[notifications] parse SSE failed", err);
      }
    });

    eventSource.onerror = () => {
      // Reconnexion auto gérée par EventSource natif
    };

    return () => eventSource.close();
  }, []);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on outside click + Escape
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e) {
      if (!bellRef.current?.contains(e.target)) setIsOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Marquer comme lu à l'ouverture
  const handleToggle = async () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);

    if (newOpen && unreadCount > 0) {
      setUnreadCount(0);
      // Fire and forget — pas bloquant
      fetch("/api/admin/notifications/mark-read", { method: "POST" }).catch(
        () => {}
      );
    }
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-offwhite-100/80 transition-all hover:bg-white/10 hover:text-mechanic-400 hover:border-mechanic-500/30"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lues` : ""}`}
        aria-expanded={isOpen}
        aria-controls="admin-notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span
            aria-live="polite"
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mechanic-500 text-[10px] font-bold text-white ring-2 ring-navy-950"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="admin-notifications"
            role="dialog"
            aria-label="Notifications admin"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="fixed left-3 right-3 top-20 z-50 max-h-[70vh] overflow-hidden rounded-2xl border border-white/10 bg-navy-900/95 backdrop-blur-xl shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <h3 className="font-display text-sm font-bold text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-mechanic-500/15 px-2 py-0.5 text-xs font-semibold text-mechanic-400">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Liste */}
            <div className="max-h-[50vh] overflow-y-auto overscroll-contain p-2">
              {isLoading ? (
                <div className="p-6 text-center text-sm text-offwhite-100/50">
                  Chargement…
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="mx-auto h-8 w-8 text-offwhite-100/20 mb-2" />
                  <p className="text-sm text-offwhite-100/50">
                    Aucune notification
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <NotificationItem key={notif.id} notif={notif} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({ notif }) {
  const icon = notif.type === "stock" ? Package : AlertTriangle;
  const Icon = icon;
  const colorClass =
    notif.severity === "critical"
      ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
      : notif.severity === "warning"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-mechanic-400 bg-mechanic-500/10 border-mechanic-500/20";

  return (
    <button
      type="button"
      className="mb-1.5 flex w-full gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left last:mb-0 hover:bg-white/5 transition-colors"
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${colorClass}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-white">
            {notif.title}
          </span>
          <span className="shrink-0 text-[10px] text-offwhite-100/40">
            {notif.time}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-offwhite-100/60 leading-relaxed">
          {notif.message}
        </p>
      </div>
    </button>
  );
}
