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
    <div className="min-h-screen bg-[#e6eef8] flex items-center justify-center px-4 py-12 text-slate-700">
      {/* CARTE PRINCIPALE NEUMORPHIQUE */}
      <div className="w-full max-w-md rounded-3xl bg-[#e6eef8] p-8 sm:p-10 shadow-[20px_20px_60px_#c3cad3,-20px_-20px_60px_#ffffff]">
        {/* EN-TÊTE AVEC BADGE EXTRUDÉ */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6eef8] text-mechanic-500 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff]">
            <LogIn size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Connexion
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Heureux de vous revoir !
          </p>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CHAMP EMAIL */}
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
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl bg-[#e6eef8] py-3 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_6px_6px_10px_#bdc4ce,inset_-6px_-6px_10px_#ffffff]"
              />
            </div>
          </div>

          {/* CHAMP MOT DE PASSE */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="block text-xs font-semibold text-slate-600">
                Mot de passe
              </label>
              <Link
                href="/reset-password"
                className="text-xs font-semibold text-mechanic-500 hover:underline transition-all"
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

          {/* BOUTON D'ACTION NEUMORPHIQUE EN RELIEF */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e6eef8] py-3.5 text-sm font-bold text-mechanic-500 transition-all duration-200 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff] hover:text-mechanic-600 hover:shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff] disabled:opacity-60"
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
          <p className="text-xs text-slate-500 font-medium">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-bold text-mechanic-500 hover:underline transition-all"
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
        <div className="min-h-screen bg-[#e6eef8] flex items-center justify-center text-slate-500 font-medium text-sm">
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
