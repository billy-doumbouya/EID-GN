"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Inscription impossible");
        return;
      }
      toast.success("Compte créé avec succès");
      router.push("/compte");
    } catch {
      toast.error("Erreur réseau, réessayez");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    {
      key: "fullName",
      label: "Nom complet",
      type: "text",
      icon: User,
      placeholder: "Mory Camara",
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      icon: Mail,
      placeholder: "mory@exemple.com",
    },
    {
      key: "phone",
      label: "Téléphone",
      type: "tel",
      icon: Phone,
      placeholder: "+224 610 00 00 00",
    },
    {
      key: "password",
      label: "Mot de passe (8 car. min.)",
      type: showPassword ? "text" : "password",
      icon: Lock,
      placeholder: "••••••••",
      isPassword: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#e6eef8] flex items-center justify-center px-4 py-12 text-slate-700">
      {/* CARTE PRINCIPALE NEUMORPHIQUE */}
      <div className="w-full max-w-md rounded-3xl bg-[#e6eef8] p-8 sm:p-10 shadow-[20px_20px_60px_#c3cad3,-20px_-20px_60px_#ffffff]">
        {/* EN-TÊTE AVEC BADGE EXTRUDÉ */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6eef8] text-mechanic-500 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff]">
            <UserPlus size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Créer un compte
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Rejoignez-nous en quelques secondes
          </p>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.key} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 ml-1">
                  {f.label}
                </label>

                {/* INPUTS AVEC OMBRE INTERNE (INSET) */}
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400">
                    <Icon size={18} />
                  </div>

                  <input
                    type={f.type}
                    required
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#e6eef8] py-3 pl-11 pr-10 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_6px_6px_10px_#bdc4ce,inset_-6px_-6px_10px_#ffffff]"
                  />

                  {/* BOUTON SHOW / HIDE PASSWORD */}
                  {f.isPassword && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* BOUTON D'ACTION NEUMORPHIQUE EN RELIEF */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e6eef8] py-3.5 text-sm font-bold text-mechanic-500 transition-all duration-200 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff] hover:text-mechanic-600 hover:shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Création en cours...</span>
              </>
            ) : (
              <span>Créer mon compte</span>
            )}
          </button>
        </form>

        {/* PIED DE PAGE */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-bold text-mechanic-500 hover:underline transition-all"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
