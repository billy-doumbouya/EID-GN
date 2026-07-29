"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function ResetPasswordConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Vérification de la correspondance des mots de passe
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Lien invalide ou expiré");
        return;
      }
      toast.success("Mot de passe mis à jour avec succès");
      router.push("/login");
    } catch {
      toast.error("Erreur réseau, réessayez");
    } finally {
      setLoading(false);
    }
  }

  /* ÉTAT : LIEN / JETON INVALIDE */
  if (!token) {
    return (
      <div className="min-h-screen bg-[#e6eef8] flex items-center justify-center px-4 py-12 text-slate-700">
        <div className="w-full max-w-md rounded-3xl bg-[#e6eef8] p-8 sm:p-10 text-center shadow-[20px_20px_60px_#c3cad3,-20px_-20px_60px_#ffffff] space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6eef8] text-rose-500 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff]">
            <AlertCircle size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-800">
              Lien invalide ou expiré
            </h1>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Le jeton de réinitialisation est absent ou n'est plus valide.
              Veuillez refaire une demande.
            </p>
          </div>

          <Link
            href="/reset-password"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#e6eef8] py-3.5 text-xs font-bold text-mechanic-500 transition-all duration-200 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff] hover:text-mechanic-600 hover:shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff]"
          >
            <ArrowLeft size={16} />
            <span>Nouvelle demande</span>
          </Link>
        </div>
      </div>
    );
  }

  /* FORMULAIRE DE NOUVEAU MOT DE PASSE */
  return (
    <div className="min-h-screen bg-[#e6eef8] flex items-center justify-center px-4 py-12 text-slate-700">
      <div className="w-full max-w-md rounded-3xl bg-[#e6eef8] p-8 sm:p-10 shadow-[20px_20px_60px_#c3cad3,-20px_-20px_60px_#ffffff]">
        {/* EN-TÊTE AVEC BADGE EXTRUDÉ */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6eef8] text-mechanic-500 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff]">
            <KeyRound size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Nouveau mot de passe
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Saisissez votre nouveau mot de passe ci-dessous.
          </p>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NOUVEAU MOT DE PASSE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 ml-1">
              Nouveau mot de passe (8 car. min.)
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="8 caractères minimum"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#e6eef8] py-3 pl-11 pr-10 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_6px_6px_10px_#bdc4ce,inset_-6px_-6px_10px_#ffffff]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* CONFIRMATION DU MOT DE PASSE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 ml-1">
              Confirmer le mot de passe
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="Répétez le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl bg-[#e6eef8] py-3 pl-11 pr-10 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_6px_6px_10px_#bdc4ce,inset_-6px_-6px_10px_#ffffff]"
              />
              {/* INDICATEUR VISUEL DE MATCH */}
              {passwordsMatch && (
                <div className="absolute right-3.5 text-emerald-500">
                  <CheckCircle2 size={18} />
                </div>
              )}
              {passwordsMismatch && (
                <div className="absolute right-3.5 text-rose-500">
                  <XCircle size={18} />
                </div>
              )}
            </div>
            {passwordsMismatch && (
              <p className="text-[11px] font-medium text-rose-500 ml-1">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          {/* BOUTON D'ACTION NEUMORPHIQUE */}
          <button
            type="submit"
            disabled={loading || passwordsMismatch}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e6eef8] py-3.5 text-sm font-bold text-mechanic-500 transition-all duration-200 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff] hover:text-mechanic-600 hover:shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff] disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Mise à jour...</span>
              </>
            ) : (
              <span>Réinitialiser</span>
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
            <span>Annuler et se connecter</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#e6eef8] flex items-center justify-center text-slate-500 font-medium text-sm">
          <div className="flex items-center gap-2">
            <Loader2 size={20} className="animate-spin text-mechanic-500" />
            <span>Chargement...</span>
          </div>
        </div>
      }
    >
      <ResetPasswordConfirmForm />
    </Suspense>
  );
}
