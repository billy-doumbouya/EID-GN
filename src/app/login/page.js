"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Connexion impossible");
        return;
      }
      toast.success("Connexion réussie");
      const explicitRedirect = searchParams.get("redirect");
      router.push(
        explicitRedirect || (data.role === "ADMIN" ? "/admin" : "/compte"),
      );
    } catch {
      toast.error("Erreur réseau, réessayez");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-offwhite-100 flex flex-col items-center justify-center px-6">
      {/* CONTENEUR PRINCIPAL */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-navy-800/5">
        {/* EN-TÊTE */}
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-mechanic-500 shadow-sm">
            <LogIn size={26} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Connexion
          </h1>
          <p className="text-sm text-navy-800/60 font-medium">
            Heureux de vous revoir !
          </p>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CHAMP EMAIL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-800/70 ml-1">
              Email
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-navy-800/40">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                placeholder="votre@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl bg-offwhite-200/50 py-3 pl-11 pr-4 text-sm font-medium text-navy-900 placeholder:text-navy-800/40 border border-transparent transition-all focus:bg-white focus:border-mechanic-500 focus:ring-4 focus:ring-mechanic-500/10 outline-none"
              />
            </div>
          </div>

          {/* CHAMP MOT DE PASSE */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-800/70">
                Mot de passe
              </label>
              <Link
                href="/reset-password"
                className="text-xs font-bold text-mechanic-500 hover:text-mechanic-600 transition-colors"
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-navy-800/40">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl bg-offwhite-200/50 py-3 pl-11 pr-10 text-sm font-medium text-navy-900 placeholder:text-navy-800/40 border border-transparent transition-all focus:bg-white focus:border-mechanic-500 focus:ring-4 focus:ring-mechanic-500/10 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-navy-800/40 hover:text-navy-900 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* BOUTON D'ACTION */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-mechanic-500 hover:shadow-lg hover:shadow-mechanic-500/30 active:scale-[0.98] disabled:opacity-60 disabled:hover:bg-navy-900 disabled:active:scale-100"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Connexion...</span>
              </>
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>

        {/* PIED DE PAGE */}
        <div className="mt-8 text-center">
          <p className="text-sm text-navy-800/60 font-medium">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-bold text-mechanic-500 hover:text-mechanic-600 transition-colors"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[100dvh] w-full overflow-hidden bg-offwhite-100 flex items-center justify-center text-navy-800/50 font-medium text-sm">
          <div className="flex items-center gap-2">
            <Loader2 size={20} className="animate-spin text-mechanic-500" />
            <span>Chargement...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
