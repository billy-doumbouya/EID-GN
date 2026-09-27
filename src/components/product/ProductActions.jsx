"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({ slug, title }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/produit/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Produit EID-GN",
          url,
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Lien copié dans le presse-papier !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-offwhite-100/60 hover:text-mechanic-400 hover:border-mechanic-500/30 transition-colors"
      aria-label="Partager ce produit"
      title="Partager ce produit"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
    </button>
  );
}

export function CopySkuButton({ sku }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sku);
      setCopied(true);
      toast.success(`Référence ${sku} copiée !`);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-offwhite-100/40 hover:text-mechanic-400 transition-colors group cursor-pointer"
      title="Copier la référence"
    >
      <span>Réf: {sku}</span>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}
