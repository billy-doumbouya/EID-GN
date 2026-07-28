// src/app/(shop)/checkout/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/lib/cartStore";
import {
  ShieldCheck,
  CreditCard,
  User,
  Phone,
  Mail,
  ShoppingBag,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// Logos locaux (public/payment-logo/)
const PAYMENT_METHODS = [
  {
    id: "orange-money",
    label: "Orange Money",
    logoUrl: "/payment-logo/orange.png",
  },
  {
    id: "mobile-money",
    label: "MTN Mobile Money",
    logoUrl: "/payment-logo/mtn.png",
  },
  { id: "moov", label: "Moov Money", logoUrl: "/payment-logo/moov.png" },
  {
    id: "carte-bancaire",
    label: "Carte bancaire (Visa)",
    logoUrl: "/payment-logo/visa.png",
  },
  {
    id: "kulu",
    label: "Kulu",
    logoUrl: "/payment-logo/kulu.png",
  },
  {
    id: "soutra-money",
    label: "Soutra Money",
    logoUrl: "/payment-logo/soutra-money.png",
  },
  {
    id: "paycard",
    label: "PayCard",
    logoUrl: "/payment-logo/paycard.png",
  },
];

async function fetchCurrentUser() {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return { user: null };
  return res.json();
}

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
        if (!cancelled) setError("Impossible de calculer le total, réessayez.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 0,
  });
  const currentUser = userData?.user ?? null;

  const [form, setForm] = useState({
    guestFullName: "",
    guestPhone: "",
    guestEmail: "",
  });
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (!currentUser || prefilled) return;
    setForm((prev) => ({
      guestFullName: prev.guestFullName || currentUser.fullName || "",
      guestPhone: prev.guestPhone || currentUser.phone || "",
      guestEmail: prev.guestEmail || currentUser.email || "",
    }));
    setPrefilled(true);
  }, [currentUser, prefilled]);

  const [paymentProvider, setPaymentProvider] = useState("DJOMY");
  const [submitting, setSubmitting] = useState(false);

  const [waitingOrderNumber, setWaitingOrderNumber] = useState(null);
  const pollRef = useRef(null);
  const popupRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!quote || quote.unavailable?.length > 0) {
      toast.error(
        "Certains articles ne sont plus disponibles, vérifiez votre panier.",
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
        toast.error(data.error || "Impossible de créer la commande");
        setSubmitting(false);
        return;
      }

      clear();

      popupRef.current = window.open(data.redirectUrl, "_blank");
      setWaitingOrderNumber(data.orderNumber);
    } catch {
      toast.error("Erreur réseau, réessayez");
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!waitingOrderNumber) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${waitingOrderNumber}/status`);
        if (!res.ok) return;
        const data = await res.json();

        const paid = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"].includes(
          data.status,
        );
        const failed = data.status === "ANNULEE";

        if (paid || failed) {
          clearInterval(pollRef.current);
          popupRef.current?.close();
          window.location.href = `/checkout/confirmation?order=${waitingOrderNumber}`;
        }
      } catch {
        // silencieux : retente au prochain intervalle
      }
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [waitingOrderNumber]);

  /* PANIER VIDE */
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#e6eef8] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl bg-[#e6eef8] p-8 text-center shadow-[20px_20px_60px_#c3cad3,-20px_-20px_60px_#ffffff] space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6eef8] text-slate-400 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff]">
            <ShoppingBag size={32} />
          </div>
          <p className="text-sm font-semibold text-slate-600">
            Votre panier est vide.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e6eef8] py-10 px-4 md:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* TITRE PRINCIPAL */}
        <div className="rounded-3xl bg-[#e6eef8] p-6 shadow-[12px_12px_24px_#c3cad3,-12px_-12px_24px_#ffffff] text-center">
          <h1 className="font-display text-2xl font-bold text-slate-800">
            Finaliser la commande
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Vérifiez vos détails et choisissez votre moyen de paiement
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* RÉCAPITULATIF COMMANDE */}
          <div className="rounded-3xl bg-[#e6eef8] p-6 shadow-[12px_12px_24px_#c3cad3,-12px_-12px_24px_#ffffff] space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ShoppingBag size={18} className="text-mechanic-500" />
              <span>Votre commande</span>
            </h2>

            {quoteLoading && (
              <div className="space-y-3">
                {items.map((i) => (
                  <div
                    key={i.productId}
                    className="h-12 animate-pulse rounded-2xl bg-[#d5deea]"
                  />
                ))}
              </div>
            )}

            {quoteError && (
              <div className="rounded-2xl bg-[#e6eef8] p-4 text-xs font-semibold text-rose-500 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff] flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{quoteError}</span>
              </div>
            )}

            {quote && (
              <div className="space-y-3">
                {quote.unavailable?.map((u) => (
                  <div
                    key={u.productId}
                    className="rounded-xl bg-[#e6eef8] p-3 text-xs font-semibold text-amber-600 shadow-[inset_3px_3px_6px_#e5cfb3,inset_-3px_-3px_6px_#ffffff] flex items-center gap-2"
                  >
                    <AlertTriangle size={14} />
                    <span>{u.reason}</span>
                  </div>
                ))}

                <div className="divide-y divide-slate-300/40">
                  {quote.lines.map((line) => (
                    <div
                      key={line.productId}
                      className="flex items-center justify-between py-3 text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">{line.name}</p>
                        <p className="font-medium text-slate-500">
                          {line.quantity} ×{" "}
                          {line.unitPrice.toLocaleString("fr-FR")} GNF
                          {line.isGrosPricing && (
                            <span className="ml-2 inline-block rounded-md bg-[#e6eef8] px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
                              Prix gros
                            </span>
                          )}
                          {line.discountName && (
                            <span className="ml-2 inline-block rounded-md bg-[#e6eef8] px-1.5 py-0.5 text-[10px] font-bold text-amber-600 shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
                              {line.discountName}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="font-bold text-slate-800">
                        {line.lineTotal.toLocaleString("fr-FR")} GNF
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COORDONNÉES CLIENT */}
          <div className="rounded-3xl bg-[#e6eef8] p-6 shadow-[12px_12px_24px_#c3cad3,-12px_-12px_24px_#ffffff] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <User size={18} className="text-mechanic-500" />
                <span>Vos coordonnées</span>
              </h2>
              {currentUser && (
                <span className="rounded-xl bg-[#e6eef8] px-3 py-1 text-[11px] font-bold text-mechanic-500 shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
                  Pré-rempli ({currentUser.fullName?.split(" ")[0] || "Client"})
                </span>
              )}
            </div>

            <div className="space-y-3">
              {/* NOM COMPLET */}
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Nom complet"
                  value={form.guestFullName}
                  disabled={userLoading}
                  onChange={(e) =>
                    setForm({ ...form, guestFullName: e.target.value })
                  }
                  className="w-full rounded-2xl bg-[#e6eef8] px-4 py-3.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_4px_4px_8px_#b8c2cc,inset_-4px_-4px_8px_#ffffff] transition-all disabled:opacity-50"
                />
              </div>

              {/* TÉLÉPHONE */}
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="Téléphone (pour le paiement mobile money)"
                  value={form.guestPhone}
                  disabled={userLoading}
                  onChange={(e) =>
                    setForm({ ...form, guestPhone: e.target.value })
                  }
                  className="w-full rounded-2xl bg-[#e6eef8] px-4 py-3.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_4px_4px_8px_#b8c2cc,inset_-4px_-4px_8px_#ffffff] transition-all disabled:opacity-50"
                />
              </div>

              {/* EMAIL */}
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email (facultatif, pour le reçu)"
                  value={form.guestEmail}
                  disabled={userLoading}
                  onChange={(e) =>
                    setForm({ ...form, guestEmail: e.target.value })
                  }
                  className="w-full rounded-2xl bg-[#e6eef8] px-4 py-3.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_4px_4px_8px_#b8c2cc,inset_-4px_-4px_8px_#ffffff] transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* MOYEN DE PAIEMENT */}
          <div className="rounded-3xl bg-[#e6eef8] p-6 shadow-[12px_12px_24px_#c3cad3,-12px_-12px_24px_#ffffff] space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <CreditCard size={18} className="text-mechanic-500" />
              <span>Moyen de paiement</span>
            </h2>

            <label
              htmlFor="mobile-payment"
              className="flex cursor-pointer flex-col gap-4 rounded-2xl bg-[#e6eef8] p-4 transition-all shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff]"
            >
              <div className="flex items-center gap-3 border-b border-slate-300/40 pb-3">
                <input
                  type="radio"
                  id="mobile-payment"
                  name="payment"
                  value="DJOMY"
                  checked={paymentProvider === "DJOMY"}
                  onChange={() => setPaymentProvider("DJOMY")}
                  className="h-4 w-4 accent-mechanic-500 cursor-pointer"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-800">
                    Mobile Money & carte bancaire
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Paiement rapide et sécurisé en Guinée
                  </span>
                </div>
              </div>

              {/* PAIEMENT LOGOS GRID */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    className="flex h-14 items-center justify-center rounded-xl bg-[#e6eef8] p-2 shadow-[3px_3px_6px_#c3cad3,-3px_-3px_6px_#ffffff] sm:h-16"
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src={method.logoUrl}
                        alt={method.label}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </label>
          </div>

          {/* TOTAL À PAYER */}
          <div className="flex items-center justify-between rounded-2xl bg-[#e6eef8] p-5 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Total à payer
            </span>
            <span className="text-lg font-bold text-mechanic-500">
              {quote ? quote.subtotal.toLocaleString("fr-FR") : "..."} GNF
            </span>
          </div>

          {/* BOUTON DE SOUMISSION */}
          <button
            type="submit"
            disabled={
              submitting ||
              quoteLoading ||
              !quote ||
              quote.unavailable?.length > 0 ||
              !!waitingOrderNumber
            }
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#e6eef8] py-4 text-xs font-bold text-mechanic-500 transition-all duration-200 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff] hover:text-mechanic-600 hover:shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff] disabled:opacity-50 disabled:pointer-events-none"
          >
            {waitingOrderNumber ? (
              <>
                <Loader2 size={16} className="animate-spin text-mechanic-500" />
                <span>En attente du paiement dans l'autre onglet...</span>
              </>
            ) : submitting ? (
              <>
                <Loader2 size={16} className="animate-spin text-mechanic-500" />
                <span>Création de la commande...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Payer maintenant</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
