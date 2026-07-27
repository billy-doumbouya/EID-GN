"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function FavoriteButton({ productId, initialFavorited = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    const method = favorited ? "DELETE" : "POST";
    try {
      const res = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        toast.info("Connectez-vous pour ajouter des favoris");
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      if (res.ok) {
        setFavorited(!favorited);
      } else {
        toast.error("Impossible de mettre a jour vos favoris");
      }
    } catch {
      toast.error("Erreur reseau, reessayez");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      className="rounded-full bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-white disabled:opacity-50"
    >
      <Heart
        size={16}
        className={favorited ? "fill-danger text-danger" : "text-navy-800/40"}
      />
    </button>
  );
}