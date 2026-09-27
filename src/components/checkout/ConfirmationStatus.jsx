"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ArrowRight,
  Phone,
  MessageCircle,
  Package,
  Truck,
  Loader2,
} from "lucide-react";
import { useOrderStatus } from "@/hooks/useOrderStatus";

const PAID_STATUSES = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];
const FAILED_STATUSES = ["ANNULEE"];

const STATUS_LABELS = {
  EN_ATTENTE: "Vérification du paiement",
  PAYEE: "Paiement confirmé",
  EN_PREPARATION: "Commande en préparation",
  EXPEDIEE: "Commande expédiée",
  LIVREE: "Commande livrée",
  ANNULEE: "Paiement échoué",
};

export function ConfirmationStatus({
  orderNumber,
  initialStatus,
  total,
  paymentProvider,
}) {
  const router = useRouter();
  const isCOD = paymentProvider === "A_LA_LIVRAISON";
  const [hasNotified, setHasNotified] = useState(false);

  const { status, isStalled, retry, pollProgress } = useOrderStatus({
    orderNumber,
    initialStatus,
    enabled: !isCOD,
    onSuccess: (newStatus) => {
      if (!hasNotified && PAID_STATUSES.includes(newStatus)) {
        setHasNotified(true);
        toast.success("Paiement confirmé !", {
          description: `Commande #${orderNumber} validée`,
          duration: 6000,
        });
        // Petit son discret (optionnel — peut être désactivé par préférence utilisateur)
        try {
          const audio = new Audio("/sounds/success.mp3");
          audio.volume = 0.4;
          audio.play().catch(() => {});
        } catch {}

        router.refresh();
      }
    },
  });

  const isPaid = PAID_STATUSES.includes(status);
  const isFailed = FAILED_STATUSES.includes(status);
  const isPending = !isPaid && !isFailed && !isCOD;

  return (
    <main className="relative min-h-[80vh] bg-navy-950 flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Mesh gradient warm en fond */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 mesh-gradient-warm opacity-50"
      />

      <div className="relative w-full max-w-lg">
        <AnimatePresence mode="wait">
          {/* ============================================================
              ÉTAT PENDING — vérification en cours
              ============================================================ */}
          {isPending && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 text-center"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <PendingIcon />

              <h1 className="mt-6 font-display text-2xl font-bold text-white">
                Vérification du paiement
              </h1>

              <p className="mt-3 text-sm text-offwhite-100/60 leading-relaxed">
                {isStalled
                  ? "La vérification prend plus de temps que prévu. Votre commande reste validée — vous recevrez une confirmation par SMS et email dès validation de l'opérateur."
                  : "Si vous venez d'effectuer le paiement sur votre téléphone, la confirmation peut prendre 1 à 2 minutes."}
              </p>

              {/* Barre de progression */}
              <div className="mt-6">
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-mechanic-500 to-amber-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${pollProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-2 font-mono text-xs text-offwhite-100/40">
                  {isStalled
                    ? "Vérification en arrière-plan…"
                    : `Vérification en cours · ${Math.round(pollProgress)}%`}
                </p>
              </div>

              {/* Récap commande */}
              <OrderRecap orderNumber={orderNumber} total={total} />

              {/* Actions si stalled */}
              {isStalled && (
                <div className="mt-6 space-y-3">
                  <button
                    onClick={retry}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 hover:border-mechanic-500/40 hover:bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Revérifier maintenant
                  </button>
                  <SupportLinks />
                </div>
              )}
            </motion.div>
          )}

          {/* ============================================================
              ÉTAT PAID — paiement confirmé
              ============================================================ */}
          {isPaid && (
            <motion.div
              key="paid"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.03] backdrop-blur-xl p-8 md:p-10 text-center"
              role="status"
              aria-live="polite"
            >
              <SuccessIcon />

              <h1 className="mt-6 font-display text-2xl md:text-3xl font-bold text-white">
                Paiement confirmé
              </h1>
              <p className="mt-3 text-sm text-offwhite-100/60 leading-relaxed">
                Merci pour votre commande ! Votre paiement a bien été reçu.
                Vous recevrez un email de confirmation et un SMS de suivi.
              </p>

              {/* Récap commande */}
              <OrderRecap orderNumber={orderNumber} total={total} />

              {/* What's next */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left space-y-3">
                <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                  Et maintenant ?
                </h2>
                <NextStep
                  icon={Package}
                  title="Préparation"
                  desc="Votre commande est préparée par notre équipe à Kankan."
                />
                <NextStep
                  icon={Truck}
                  title="Expédition"
                  desc="Livraison sous 24-48h à Kankan, 48-72h pour les autres régions."
                />
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/compte/commandes/${orderNumber}`}
                  className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-mechanic-500 hover:bg-mechanic-400 px-5 py-3.5 text-white font-semibold transition-all shadow-glow-mechanic hover:scale-[1.02]"
                >
                  Suivre ma commande
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/catalogue"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 hover:border-white/30 hover:bg-white/5 px-5 py-3.5 text-white font-semibold transition-colors"
                >
                  Continuer mes achats
                </Link>
              </div>
            </motion.div>
          )}

          {/* ============================================================
              ÉTAT COD — paiement à la livraison
              ============================================================ */}
          {isCOD && !isPaid && (
            <motion.div
              key="cod"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.03] backdrop-blur-xl p-8 md:p-10 text-center"
              role="status"
              aria-live="polite"
            >
              <CodIcon />

              <h1 className="mt-6 font-display text-2xl md:text-3xl font-bold text-white">
                Commande confirmée
              </h1>
              <p className="mt-3 text-sm text-offwhite-100/60 leading-relaxed">
                Merci pour votre commande ! Préparez le montant exact à remettre
                au livreur lors de la réception.
              </p>

              <OrderRecap orderNumber={orderNumber} total={total} />

              <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4 text-left">
                <p className="text-sm text-amber-200/90 font-medium">
                  ⚠️ Le paiement doit être effectué en espèces au livreur. Le
                  montant exact est de{" "}
                  <span className="font-bold">
                    {Number(total).toLocaleString("fr-FR")} GNF
                  </span>
                  .
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/compte/commandes/${orderNumber}`}
                  className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-mechanic-500 hover:bg-mechanic-400 px-5 py-3.5 text-white font-semibold transition-all shadow-glow-mechanic hover:scale-[1.02]"
                >
                  Voir ma commande
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/catalogue"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 hover:border-white/30 hover:bg-white/5 px-5 py-3.5 text-white font-semibold transition-colors"
                >
                  Continuer mes achats
                </Link>
              </div>
            </motion.div>
          )}

          {/* ============================================================
              ÉTAT FAILED — paiement échoué
              ============================================================ */}
          {isFailed && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.03] backdrop-blur-xl p-8 md:p-10 text-center"
              role="alert"
              aria-live="assertive"
            >
              <FailedIcon />

              <h1 className="mt-6 font-display text-2xl md:text-3xl font-bold text-white">
                Paiement échoué
              </h1>
              <p className="mt-3 text-sm text-offwhite-100/60 leading-relaxed">
                Le paiement n'a pas abouti et la commande a été annulée. Les
                stocks réservés ont été libérés.
              </p>

              <OrderRecap orderNumber={orderNumber} total={total} />

              <div className="mt-6 space-y-3">
                <Link
                  href="/cart"
                  className="group inline-flex items-center justify-center gap-2 w-full rounded-xl bg-mechanic-500 hover:bg-mechanic-400 px-5 py-3.5 text-white font-semibold transition-all shadow-glow-mechanic hover:scale-[1.02]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Réessayer la commande
                </Link>
                <SupportLinks />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

function OrderRecap({ orderNumber, total }) {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-navy-950/40 p-4">
      <p className="font-mono text-xs text-offwhite-100/40">
        Commande <span className="text-white font-bold">#{orderNumber}</span>
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-mechanic-400 tabular-nums">
        {Number(total).toLocaleString("fr-FR")} GNF
      </p>
    </div>
  );
}

function NextStep({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mechanic-500/10 border border-mechanic-500/20 text-mechanic-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-offwhite-100/50 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function SupportLinks() {
  return (
    <div className="flex items-center justify-center gap-4 pt-2 text-xs">
      <a
        href="tel:+224622000000"
        className="inline-flex items-center gap-1.5 text-offwhite-100/50 hover:text-mechanic-400 transition-colors"
      >
        <Phone className="h-3.5 w-3.5" />
        Appeler le support
      </a>
      <span className="text-offwhite-100/20">·</span>
      <a
        href="https://wa.me/224622000000"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-offwhite-100/50 hover:text-mechanic-400 transition-colors"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </a>
    </div>
  );
}

// ============================================================
// ICÔNES ANIMÉES
// ============================================================

function PendingIcon() {
  return (
    <div className="mx-auto relative flex h-24 w-24 items-center justify-center">
      {/* Halo pulse */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl animate-pulse"
      />
      {/* Cercle progress */}
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-500/20 bg-amber-500/[0.05] backdrop-blur-sm">
        <Loader2 className="h-8 w-8 text-amber-400 animate-spin" strokeWidth={2.5} />
      </div>
    </div>
  );
}

function SuccessIcon() {
  return (
    <div className="mx-auto relative flex h-24 w-24 items-center justify-center">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl"
      />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-500/[0.1] backdrop-blur-sm"
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-400" strokeWidth={2.5} />
      </motion.div>
    </div>
  );
}

function FailedIcon() {
  return (
    <div className="mx-auto relative flex h-24 w-24 items-center justify-center">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl"
      />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-rose-500/30 bg-rose-500/[0.1] backdrop-blur-sm"
      >
        <XCircle className="h-10 w-10 text-rose-400" strokeWidth={2.5} />
      </motion.div>
    </div>
  );
}

function CodIcon() {
  return (
    <div className="mx-auto relative flex h-24 w-24 items-center justify-center">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl"
      />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-500/30 bg-amber-500/[0.1] backdrop-blur-sm"
      >
        <Package className="h-9 w-9 text-amber-400" strokeWidth={2.5} />
      </motion.div>
    </div>
  );
}
