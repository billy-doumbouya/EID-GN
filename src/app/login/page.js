"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
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
      toast.success("Connexion reussie");
      const explicitRedirect = searchParams.get("redirect");
      router.push(explicitRedirect || (data.role === "ADMIN" ? "/admin" : "/compte"));
    } catch {
      toast.error("Erreur reseau, reessayez");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="font-display text-2xl font-semibold text-navy-900">Connexion</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-navy-800">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-navy-800/15 px-3 py-2 outline-none focus-visible:border-mechanic-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy-800">Mot de passe</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-lg border border-navy-800/15 px-3 py-2 outline-none focus-visible:border-mechanic-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-mechanic-500 py-2.5 font-medium text-white hover:bg-mechanic-600 disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        <Link href="/reset-password" className="text-mechanic-500 hover:underline">Mot de passe oublie ?</Link>
        <Link href="/register" className="text-navy-800/70 hover:underline">Creer un compte</Link>
      </div>
    </div>
  );
}
