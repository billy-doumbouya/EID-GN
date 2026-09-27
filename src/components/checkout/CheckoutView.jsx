"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cartStore";
import { useCartQuote } from "@/hooks/useCartQuote";
import { checkoutSchema } from "@/lib/validations/checkout";
import { CheckoutEmpty } from "./CheckoutEmpty";
import { CheckoutForm } from "./CheckoutForm";
import { CheckoutSummary } from "./CheckoutSummary";
import { CheckoutPollingOverlay } from "./CheckoutPollingOverlay";

export function CheckoutView() {
  const { items, clear } = useCartStore();
  const { quote, isLoading, isError } = useCartQuote(items);

  // User courant (pour pré-remplir + adresses sauvegardées)
  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return { user: null };
      return res.json();
    },
    staleTime: 60_000,
  });
  const currentUser = userData?.user ?? null;

  // Form react-hook-form + zod
  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      guestFullName: "",
      guestPhone: "",
      guestEmail: "",
      addressLabel: "",
      addressQuartier: "",
      addressVille: "Kankan",
      addressReperes: "",
      addressTelephone: "",
      paymentProvider: "DJOMY",
      createAccount: false,
    },
    values: currentUser
      ? {
          guestFullName: currentUser.fullName || "",
          guestPhone: currentUser.phone || "",
          guestEmail: currentUser.email || "",
          addressLabel: "Domicile",
          addressQuartier: "",
          addressVille: "Kankan",
          addressReperes: "",
          addressTelephone: currentUser.phone || "",
          paymentProvider: "DJOMY",
          createAccount: false,
        }
      : undefined,
  });

  const [submitting, setSubmitting] = useState(false);
  const [waitingOrder, setWaitingOrder] = useState(null);

  async function onSubmit(values) {
    if (!quote || quote.unavailable?.length > 0) {
      toast.error("Certains articles ne sont plus disponibles.");
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
          ...values,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Gestion erreurs zod serveur
        if (data.error?.fieldErrors) {
          Object.entries(data.error.fieldErrors).forEach(([field, msgs]) => {
            if (msgs?.[0]) form.setError(field, { message: msgs[0] });
          });
        } else {
          toast.error(data.error || "Impossible de créer la commande");
        }
        setSubmitting(false);
        return;
      }

      clear();

      if (data.redirectUrl) {
        // Paiement digital — ouverture popup + polling
        const popup = window.open(data.redirectUrl, "_blank");

        if (!popup || popup.closed) {
          // Popup bloquée — fallback : redirection directe
          toast.info("Redirection vers le paiement…");
          window.location.href = data.redirectUrl;
          return;
        }

        setWaitingOrder({
          orderNumber: data.orderNumber,
          popup,
        });
      } else {
        // Paiement à la livraison
        window.location.href = `/checkout/confirmation?order=${data.orderNumber}`;
      }
    } catch {
      toast.error("Erreur réseau, réessayez");
      setSubmitting(false);
    }
  }

  // Panier vide
  if (items.length === 0 && !waitingOrder) {
    return <CheckoutEmpty />;
  }

  return (
    <main className="relative min-h-screen bg-navy-950 text-offwhite-100 py-10 px-4 md:px-6">
      {/* Mesh gradient subtil */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 mesh-gradient-warm opacity-30"
      />

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
            Finaliser la commande
          </h1>
          <p className="mt-1 text-sm text-offwhite-100/50">
            Vérifiez vos informations et choisissez votre mode de paiement.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Colonne gauche : form */}
          <CheckoutForm
            form={form}
            currentUser={currentUser}
            submitting={submitting}
            waitingOrder={waitingOrder}
            quote={quote}
            isLoading={isLoading}
            isError={isError}
            onSubmit={onSubmit}
          />

          {/* Colonne droite : récap sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CheckoutSummary
              quote={quote}
              isLoading={isLoading}
              isError={isError}
              items={items}
            />
          </div>
        </div>
      </div>

      {/* Overlay polling quand paiement en cours */}
      {waitingOrder && (
        <CheckoutPollingOverlay
          orderNumber={waitingOrder.orderNumber}
          popup={waitingOrder.popup}
          onDone={(finalStatus) => {
            window.location.href = `/checkout/confirmation?order=${waitingOrder.orderNumber}`;
          }}
        />
      )}
    </main>
  );
}
