"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const PAID_STATUSES = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];
const FAILED_STATUSES = ["ANNULEE"];

// Stratégie d'intervalle adaptatif :
// - 3 premiers polls rapides (1.5s) pour les paiements instantanés
// - Ensuite ralentir (4s) pour économiser l'API
// - Max 20 polls (~90s au total)
const MAX_POLLS = 20;
const FAST_INTERVAL = 1500;
const SLOW_INTERVAL = 4000;
const FAST_POLLS_COUNT = 3;

export function useOrderStatus({
  orderNumber,
  initialStatus,
  enabled = true,
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const [pollCount, setPollCount] = useState(0);
  const [isStalled, setIsStalled] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);

  // Pause polling quand l'onglet n'est pas visible (économie batterie + API)
  useEffect(() => {
    const handleVisibility = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const isPaid = PAID_STATUSES.includes(initialStatus);
  const isFailed = FAILED_STATUSES.includes(initialStatus);
  const isTerminal = isPaid || isFailed;

  const { data, refetch } = useQuery({
    queryKey: ["order-status", orderNumber],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderNumber}/status`);
      if (!res.ok) throw new Error("Status fetch failed");
      return res.json();
    },
    enabled: enabled && !isTerminal && documentVisible,
    // Intervalle adaptatif
    refetchInterval: (query) => {
      if (!documentVisible) return false;
      const current = query.state.data?.status;
      if (PAID_STATUSES.includes(current) || FAILED_STATUSES.includes(current)) {
        return false; // État terminal, on arrête
      }
      return pollCount < FAST_POLLS_COUNT ? FAST_INTERVAL : SLOW_INTERVAL;
    },
    refetchIntervalInBackground: false,
    retry: 1,
    staleTime: 0, // Toujours refetch
    placeholderData: (prev) => prev, // Évite le flash
  });

  // Compter les polls + détecter le stall
  useEffect(() => {
    if (!data) return;
    setPollCount((c) => c + 1);

    const newStatus = data.status;
    if (PAID_STATUSES.includes(newStatus) || FAILED_STATUSES.includes(newStatus)) {
      onSuccess?.(newStatus);
    }
  }, [data?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Détecter le stall (max polls atteint)
  useEffect(() => {
    if (pollCount >= MAX_POLLS && !isStalled) {
      setIsStalled(true);
    }
  }, [pollCount, isStalled]);

  // Retry manuel
  const retry = () => {
    setIsStalled(false);
    setPollCount(0);
    queryClient.invalidateQueries({ queryKey: ["order-status", orderNumber] });
  };

  // Progression pour la barre (0-100%)
  const pollProgress = Math.min((pollCount / MAX_POLLS) * 100, 100);

  return {
    status: data?.status || initialStatus,
    isStalled,
    retry,
    pollProgress,
  };
}
