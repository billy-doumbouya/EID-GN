// src/components/admin/DeactivateButton.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeactivateButton({ discountId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/discounts/${discountId}/deactivate`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      toast.success("Promotion desactivee");
      router.refresh();
    } catch {
      toast.error("Impossible de desactiver la promotion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
    >
      {loading ? "..." : "Desactiver"}
    </button>
  );
}