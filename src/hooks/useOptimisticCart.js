"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cartStore";

export function useOptimisticCart() {
  const items = useCartStore((s) => s.items);
  const [pendingUpdate, setPendingUpdate] = useState({});
  const [optimisticUpdate, setOptimisticUpdate] = useState({});

  // Quand items changent dans le store, on clear les optimistic
  useEffect(() => {
    setOptimisticUpdate({});
    setPendingUpdate({});
  }, [items]);

  return {
    pendingUpdate,
    optimisticUpdate,
  };
}
