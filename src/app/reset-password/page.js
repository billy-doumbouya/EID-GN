"use client";

import { useState } from "react";
import { toast } from "sonner";

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
      // Message identique que le compte existe ou non - evite l'enumeration
      setSent(true);
    } catch {
      toast.error("Erreur reseau, reessayez");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 text-center">
        <p className="text-navy-800">
          Si ce compte existe, un email de reinitialisation a ete envoye.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="font-display text-2xl font-semibold text-navy-900">Mot de passe oublie</h1>
      <p className="mt-2 text-sm text-navy-800/60">
        Entrez votre email, vous recevrez un lien de reinitialisation valable 30 minutes.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="w-full rounded-lg border border-navy-800/15 px-3 py-2 outline-none focus-visible:border-mechanic-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-mechanic-500 py-2.5 font-medium text-white hover:bg-mechanic-600 disabled:opacity-60"
        >
          {loading ? "Envoi..." : "Envoyer le lien"}
        </button>
      </form>
    </div>
  );
}
