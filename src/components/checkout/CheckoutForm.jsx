"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  CreditCard,
  ShieldCheck,
  Loader2,
  Banknote,
  Smartphone,
} from "lucide-react";
import { FormField } from "./FormField";
import { PAYMENT_METHODS } from "./payment-methods";

export function CheckoutForm({
  form,
  currentUser,
  submitting,
  waitingOrder,
  quote,
  isLoading,
  isError,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const paymentProvider = watch("paymentProvider");

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.05] p-8 text-center">
        <p className="text-rose-300 font-medium">
          Impossible de charger votre panier.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-rose-300/60 hover:text-rose-300 cursor-pointer"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ============================================================
          SECTION 1 — COORDONNÉES
          ============================================================ */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-white">
            <User className="h-4 w-4 text-mechanic-400" />
            Vos coordonnées
          </h2>
          {currentUser && (
            <span className="rounded-full bg-mechanic-500/10 border border-mechanic-500/20 px-2.5 py-0.5 text-xs font-semibold text-mechanic-400">
              Connecté · {currentUser.fullName?.split(" ")[0]}
            </span>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Nom complet"
            required
            error={errors.guestFullName?.message}
          >
            <input
              type="text"
              placeholder="Ex : Mamadou Diallo"
              {...register("guestFullName")}
              className="checkout-input"
            />
          </FormField>

          <FormField
            label="Téléphone (Mobile Money)"
            required
            error={errors.guestPhone?.message}
            hint="Numéro pour le paiement et le suivi"
          >
            <input
              type="tel"
              placeholder="622 000 000"
              {...register("guestPhone")}
              className="checkout-input"
            />
          </FormField>
        </div>

        <FormField
          label="Email (facultatif)"
          error={errors.guestEmail?.message}
          hint="Pour recevoir votre reçu PDF"
        >
          <input
            type="email"
            placeholder="vous@exemple.com"
            {...register("guestEmail")}
            className="checkout-input"
          />
        </FormField>
      </section>

      {/* ============================================================
          SECTION 2 — ADRESSE DE LIVRAISON
          ============================================================ */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-white">
          <MapPin className="h-4 w-4 text-mechanic-400" />
          Adresse de livraison
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Nom de l'adresse"
            required
            error={errors.addressLabel?.message}
          >
            <input
              type="text"
              placeholder="Ex : Domicile, Boutique"
              {...register("addressLabel")}
              className="checkout-input"
            />
          </FormField>

          <FormField
            label="Ville"
            required
            error={errors.addressVille?.message}
          >
            <select
              {...register("addressVille")}
              className="checkout-input"
            >
              <option value="Kankan" className="bg-navy-900 text-white">Kankan</option>
              <option value="Siguiri" className="bg-navy-900 text-white">Siguiri</option>
              <option value="Kouroussa" className="bg-navy-900 text-white">Kouroussa</option>
              <option value="Mandiana" className="bg-navy-900 text-white">Mandiana</option>
              <option value="Kérouané" className="bg-navy-900 text-white">Kérouané</option>
              <option value="Koundara" className="bg-navy-900 text-white">Koundara</option>
              <option value="Conakry" className="bg-navy-900 text-white">Conakry</option>
              <option value="Autre" className="bg-navy-900 text-white">Autre ville</option>
            </select>
          </FormField>
        </div>

        <FormField
          label="Quartier"
          required
          error={errors.addressQuartier?.message}
        >
          <input
            type="text"
            placeholder="Ex : Quartier Balada"
            {...register("addressQuartier")}
            className="checkout-input"
          />
        </FormField>

        <FormField
          label="Points de repère"
          error={errors.addressReperes?.message}
          hint="Crucial pour la livraison en Guinée (ex : derrière le grand marché)"
        >
          <textarea
            rows={2}
            placeholder="Ex : Derrière la station Shell, à côté de la pharmacie"
            {...register("addressReperes")}
            className="checkout-input resize-none"
          />
        </FormField>
      </section>

      {/* ============================================================
          SECTION 3 — PAIEMENT
          ============================================================ */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-white">
          <CreditCard className="h-4 w-4 text-mechanic-400" />
          Mode de paiement
        </h2>

        {/* Option 1 : Mobile Money / Carte */}
        <PaymentOption
          value="DJOMY"
          currentValue={paymentProvider}
          onChange={(v) => setValue("paymentProvider", v, { shouldValidate: true })}
          icon={Smartphone}
          title="Mobile Money & carte bancaire"
          desc="Paiement instantané et sécurisé via Djomy (Orange, MTN, Moov, Carte)"
          logo
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className="flex h-12 items-center justify-center rounded-lg border border-white/5 bg-navy-950/50 p-2"
                title={method.label}
              >
                <PaymentLogo src={method.logoUrl} alt={method.label} />
              </div>
            ))}
          </div>
        </PaymentOption>

        {/* Option 2 : Paiement à la livraison */}
        <PaymentOption
          value="A_LA_LIVRAISON"
          currentValue={paymentProvider}
          onChange={(v) => setValue("paymentProvider", v, { shouldValidate: true })}
          icon={Banknote}
          title="Paiement à la livraison"
          desc="Payez en espèces à réception du colis"
        />
      </section>

      {/* ============================================================
          BOUTON DE SOUMISSION
          ============================================================ */}
      <button
        type="submit"
        disabled={
          submitting ||
          isLoading ||
          !quote ||
          quote?.unavailable?.length > 0 ||
          !!waitingOrder
        }
        className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-mechanic-500 hover:bg-mechanic-400 disabled:bg-white/5 disabled:text-offwhite-100/30 px-6 py-4 text-white font-semibold transition-all duration-200 shadow-glow-mechanic disabled:shadow-none hover:scale-[1.01] disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
      >
        {waitingOrder ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            En attente du paiement…
          </>
        ) : submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Création de la commande…
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            {paymentProvider === "A_LA_LIVRAISON"
              ? "Confirmer la commande"
              : `Payer ${quote ? (quote.total ?? 0).toLocaleString("fr-FR") : ""} GNF`}
          </>
        )}
      </button>

      <p className="text-center text-xs text-offwhite-100/40">
        🔒 Paiement sécurisé · Vos données sont chiffrées (SSL)
      </p>
    </form>
  );
}

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

function PaymentOption({
  value,
  currentValue,
  onChange,
  icon: Icon,
  title,
  desc,
  logo = false,
  children,
}) {
  const isSelected = currentValue === value;

  return (
    <label
      className={`block rounded-xl border p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-mechanic-500/40 bg-mechanic-500/[0.05]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          name="payment"
          checked={isSelected}
          onChange={() => onChange(value)}
          className="sr-only"
        />
        <div
          className={`flex h-5 w-5 shrink-0 mt-0.5 items-center justify-center rounded-full border-2 transition-colors ${
            isSelected ? "border-mechanic-500" : "border-white/20"
          }`}
        >
          {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-mechanic-500" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-mechanic-400" />
            <span className="text-sm font-semibold text-white">{title}</span>
          </div>
          <p className="mt-1 text-xs text-offwhite-100/50">{desc}</p>
          {children}
        </div>
      </div>
    </label>
  );
}

function PaymentLogo({ src, alt }) {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain"
        loading="lazy"
      />
    </div>
  );
}
