"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, Loader2 } from "lucide-react";

export function DeactivatePromotionButton({ discountId }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeactivate() {
    const confirmed = window.confirm("Desactiver cette promotion maintenant ?");
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/discounts/${discountId}/deactivate`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la desactivation");
        return;
      }
      toast.success("Promotion desactivee");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Erreur reseau");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleDeactivate}
      disabled={isLoading}
      title="Desactiver"
      className="rounded-lg p-2 text-danger hover:bg-danger/10 disabled:opacity-50"
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
    </button>
  );
}
