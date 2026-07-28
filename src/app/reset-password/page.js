"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, KeyRound, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Message identique que le compte existe ou non - évite l'énumération
      setSent(true);
    } catch {
      toast.error("Erreur réseau, réessayez");
    } finally {
      setLoading(false);
    }
  }

  /* ÉTAT : EMAIL ENVOYÉ */
  if (sent) {
    return (
      <div className="min-h-screen bg-[#e6eef8] flex items-center justify-center px-4 py-12 text-slate-700">
        <div className="w-full max-w-md rounded-3xl bg-[#e6eef8] p-8 sm:p-10 text-center shadow-[20px_20px_60px_#c3cad3,-20px_-20px_60px_#ffffff] space-y-6">
          {/* BADGE SUCCÈS EXTRUDÉ */}
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6eef8] text-emerald-500 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff]">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-800">
              Vérifiez votre boîte mail
            </h1>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Si un compte correspond à{" "}
              <strong className="text-slate-700">{email}</strong>, vous recevrez
              un lien de réinitialisation valable 30 minutes.
            </p>
          </div>

          {/* RETOUR CONNEXION */}
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#e6eef8] py-3.5 text-xs font-bold text-mechanic-500 transition-all duration-200 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff] hover:text-mechanic-600 hover:shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff]"
          >
            <ArrowLeft size={16} />
            <span>Retour à la connexion</span>
          </Link>
        </div>
      </div>
    );
  }

  /* FORMULAIRE DE DEMANDE */
  return (
    <div className="min-h-screen bg-[#e6eef8] flex items-center justify-center px-4 py-12 text-slate-700">
      <div className="w-full max-w-md rounded-3xl bg-[#e6eef8] p-8 sm:p-10 shadow-[20px_20px_60px_#c3cad3,-20px_-20px_60px_#ffffff]">
        {/* EN-TÊTE AVEC BADGE EXTRUDÉ */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6eef8] text-mechanic-500 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff]">
            <KeyRound size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Mot de passe oublié
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed px-2">
            Entrez votre email pour recevoir un lien de réinitialisation
            sécurisé.
          </p>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 ml-1">
              Email
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#e6eef8] py-3 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_6px_6px_10px_#bdc4ce,inset_-6px_-6px_10px_#ffffff]"
              />
            </div>
          </div>

          {/* BOUTON D'ACTION NEUMORPHIQUE EN RELIEF */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e6eef8] py-3.5 text-sm font-bold text-mechanic-500 transition-all duration-200 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff] hover:text-mechanic-600 hover:shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Envoi du lien...</span>
              </>
            ) : (
              <span>Envoyer le lien</span>
            )}
          </button>
        </form>

        {/* PIED DE PAGE */}
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-mechanic-500 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Se connecter</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
