"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Lien invalide ou expire");
        return;
      }
      toast.success("Mot de passe mis a jour");
      router.push("/login");
    } catch {
      toast.error("Erreur reseau, reessayez");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <p className="mx-auto max-w-sm px-4 py-24 text-center text-danger">Lien invalide.</p>;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="font-display text-2xl font-semibold text-navy-900">Nouveau mot de passe</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8 caracteres minimum"
          className="w-full rounded-lg border border-navy-800/15 px-3 py-2 outline-none focus-visible:border-mechanic-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-mechanic-500 py-2.5 font-medium text-white hover:bg-mechanic-600 disabled:opacity-60"
        >
          {loading ? "Mise a jour..." : "Reinitialiser"}
        </button>
      </form>
    </div>
  );
}
