"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
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
      toast.success("Compte cree avec succes");
      router.push("/compte");
    } catch {
      toast.error("Erreur reseau, reessayez");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: "fullName", label: "Nom complet", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Telephone", type: "tel" },
    {
      key: "password",
      label: "Mot de passe (8 caracteres min.)",
      type: "password",
    },
  ];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Creer un compte
      </h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-sm font-medium text-navy-800">
              {f.label}
            </label>
            <input
              type={f.type}
              required
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="mt-1 w-full rounded-lg border border-navy-800/15 px-3 py-2 outline-none focus-visible:border-mechanic-500"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-mechanic-500 py-2.5 font-medium text-white hover:bg-mechanic-600 disabled:opacity-60"
        >
          {loading ? "Creation..." : "Creer mon compte"}
        </button>
      </form>
      <p className="mt-4 text-sm text-navy-800/70">
        Deja un compte ?{" "}
        <Link href="/login" className="text-mechanic-500 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
