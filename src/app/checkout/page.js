// src/app/(shop)/checkout/page.js
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cartStore";
import { ZigzagDivider } from "@/components/ZigzagDivider";

const PAYMENT_OPTIONS = [
  { value: "LENGOPAY", label: "LengoPay (Orange Money / MTN)" },
  { value: "DJOMY", label: "Djomy (Orange Money / MTN)" },
];

function useCartQuote(items) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0) {
      setQuote(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setQuote(data);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de calculer le total, reessayez.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items.map((i) => [i.productId, i.quantity]))]);

  return { quote, loading, error };
}

export default function CheckoutPage() {
  const { items, clear } = useCartStore();
  const {
    quote,
    loading: quoteLoading,
    error: quoteError,
  } = useCartQuote(items);

  const [form, setForm] = useState({
    guestFullName: "",
    guestPhone: "",
    guestEmail: "",
  });
  const [paymentProvider, setPaymentProvider] = useState("LENGOPAY");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!quote || quote.unavailable?.length > 0) {
      toast.error(
        "Certains articles ne sont plus disponibles, verifiez votre panier.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          ...form,
          paymentProvider,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Impossible de creer la commande");
        return;
      }

      clear();
      window.location.href = data.redirectUrl;
    } catch {
      toast.error("Erreur reseau, reessayez");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <p className="mx-auto max-w-2xl px-4 py-24 text-center text-navy-800/60">
        Votre panier est vide.
      </p>
    );
  }

  return (
    <div>
      <div className="bg-navy-900 py-8 text-white">
        <div className="mx-auto max-w-2xl px-4 md:px-6">
          <h1 className="font-display text-2xl font-semibold">
            Finaliser la commande
          </h1>
        </div>
      </div>
      <ZigzagDivider color="var(--color-navy-900)" flip />

      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Recap panier avec prix reels */}
          <div className="rounded-xl border border-navy-800/10 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-navy-900">
              Votre commande
            </h2>

            {quoteLoading && (
              <div className="space-y-2">
                {items.map((i) => (
                  <div
                    key={i.productId}
                    className="h-10 animate-pulse rounded-lg bg-offwhite-200"
                  />
                ))}
              </div>
            )}

            {quoteError && <p className="text-sm text-danger">{quoteError}</p>}

            {quote && (
              <div className="divide-y divide-navy-800/5">
                {quote.unavailable?.map((u) => (
                  <div key={u.productId} className="py-2 text-sm text-danger">
                    {u.reason}
                  </div>
                ))}
                {quote.lines.map((line) => (
                  <div
                    key={line.productId}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-navy-900">{line.name}</p>
                      <p className="text-xs text-navy-800/50">
                        {line.quantity} x{" "}
                        {line.unitPrice.toLocaleString("fr-FR")} GNF
                        {line.isGrosPricing && (
                          <span className="ml-1 rounded-full bg-mechanic-500/10 px-1.5 py-0.5 text-mechanic-500">
                            Prix gros
                          </span>
                        )}
                        {line.discountName && (
                          <span className="ml-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-amber-500">
                            {line.discountName}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="font-medium text-navy-900">
                      {line.lineTotal.toLocaleString("fr-FR")} GNF
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-xl border border-navy-800/10 bg-white p-4">
            <h2 className="text-sm font-semibold text-navy-900">
              Vos coordonnees
            </h2>
            <input
              type="text"
              required
              placeholder="Nom complet"
              value={form.guestFullName}
              onChange={(e) =>
                setForm({ ...form, guestFullName: e.target.value })
              }
              className="w-full rounded-lg border border-navy-800/15 px-3 py-2 outline-none focus-visible:border-mechanic-500"
            />
            <input
              type="tel"
              required
              placeholder="Telephone (pour le paiement mobile money)"
              value={form.guestPhone}
              onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
              className="w-full rounded-lg border border-navy-800/15 px-3 py-2 outline-none focus-visible:border-mechanic-500"
            />
            <input
              type="email"
              placeholder="Email (facultatif, pour le recu)"
              value={form.guestEmail}
              onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
              className="w-full rounded-lg border border-navy-800/15 px-3 py-2 outline-none focus-visible:border-mechanic-500"
            />
          </div>

          <div className="space-y-2 rounded-xl border border-navy-800/10 bg-white p-4">
            <h2 className="text-sm font-semibold text-navy-900">
              Moyen de paiement
            </h2>
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 rounded-lg border border-navy-800/10 p-3 has-[:checked]:border-mechanic-500"
              >
                <input
                  type="radio"
                  name="payment"
                  value={opt.value}
                  checked={paymentProvider === opt.value}
                  onChange={() => setPaymentProvider(opt.value)}
                />
                <span className="text-sm text-navy-800">{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-xl bg-navy-900 p-4 text-white">
            <span className="font-medium">Total a payer</span>
            <span className="text-lg font-semibold text-mechanic-400">
              {quote ? quote.subtotal.toLocaleString("fr-FR") : "..."} GNF
            </span>
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              quoteLoading ||
              !quote ||
              quote.unavailable?.length > 0
            }
            className="w-full rounded-lg bg-mechanic-500 py-3 font-medium text-white hover:bg-mechanic-600 disabled:opacity-60"
          >
            {submitting
              ? "Redirection vers le paiement..."
              : "Payer maintenant"}
          </button>
        </form>
      </div>
    </div>
  );
}
