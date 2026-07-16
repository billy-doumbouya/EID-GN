// src/app/(admin)/admin/diffusion/page.js
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Drawer } from "vaul";
import { Mail, MessageCircle, AlertTriangle } from "lucide-react";

const SID_PATTERN = /^HX[a-f0-9]{32}$/i;

function ConfirmSendDrawer({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading,
  tone = "mechanic",
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-navy-900/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-navy-800/15" />
          <div className="px-6 py-6">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle size={20} />
              <Drawer.Title className="font-display text-lg font-semibold text-navy-900">
                {title}
              </Drawer.Title>
            </div>
            <p className="mt-2 text-sm text-navy-800/70">{description}</p>

            <div className="mt-6 flex gap-3">
              <Drawer.Close className="flex-1 rounded-lg border border-navy-800/15 py-2.5 text-sm font-medium text-navy-800">
                Annuler
              </Drawer.Close>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50 ${
                  tone === "mechanic"
                    ? "bg-mechanic-500 hover:bg-mechanic-600"
                    : "bg-navy-900 hover:bg-navy-800"
                }`}
              >
                {loading ? "Envoi..." : "Confirmer l'envoi"}
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default function DiffusionPage() {
  const [emailForm, setEmailForm] = useState({ subject: "", html: "" });
  const [waForm, setWaForm] = useState({ contentSid: "", variables: "" });
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingWa, setLoadingWa] = useState(false);
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);
  const [confirmWaOpen, setConfirmWaOpen] = useState(false);

  const sidValid =
    waForm.contentSid === "" || SID_PATTERN.test(waForm.contentSid.trim());

  async function sendEmailBroadcast() {
    setLoadingEmail(true);
    try {
      const res = await fetch("/api/broadcast/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Envoye a ${data.sent} client(s)`);
      setEmailForm({ subject: "", html: "" });
      setConfirmEmailOpen(false);
    } catch (err) {
      toast.error(err.message || "Envoi echoue");
    } finally {
      setLoadingEmail(false);
    }
  }

  async function sendWhatsappBroadcast() {
    setLoadingWa(true);
    try {
      const contentVariables = {};
      waForm.variables
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .forEach((v, i) => (contentVariables[String(i + 1)] = v));

      const res = await fetch("/api/broadcast/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentSid: waForm.contentSid,
          contentVariables,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Envoye a ${data.sent} client(s), ${data.failed} echec(s)`);
      setConfirmWaOpen(false);
    } catch (err) {
      toast.error(
        err.message || "Envoi echoue - verifiez la configuration Twilio",
      );
    } finally {
      setLoadingWa(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Diffusion
      </h1>

      {/* Email */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setConfirmEmailOpen(true);
        }}
        className="space-y-3 rounded-xl border border-navy-800/10 bg-white p-4"
      >
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-navy-800/50" />
          <h2 className="text-sm font-semibold text-navy-900">
            Email en masse (nouvel arrivage)
          </h2>
        </div>
        <input
          type="text"
          required
          placeholder="Sujet"
          value={emailForm.subject}
          onChange={(e) =>
            setEmailForm({ ...emailForm, subject: e.target.value })
          }
          className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
        />
        <textarea
          required
          rows={5}
          placeholder="Contenu (HTML accepte)"
          value={emailForm.html}
          onChange={(e) => setEmailForm({ ...emailForm, html: e.target.value })}
          className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
        />
        <button
          type="submit"
          disabled={loadingEmail || !emailForm.subject || !emailForm.html}
          className="rounded-lg bg-mechanic-500 px-5 py-2 text-sm font-medium text-white hover:bg-mechanic-600 disabled:opacity-50"
        >
          Envoyer a tous les clients opt-in
        </button>
      </form>

      <ConfirmSendDrawer
        open={confirmEmailOpen}
        onOpenChange={setConfirmEmailOpen}
        title="Confirmer l'envoi de l'email"
        description={`"${emailForm.subject}" sera envoye immediatement a tous les clients ayant accepte les emails. Cette action est irreversible.`}
        onConfirm={sendEmailBroadcast}
        loading={loadingEmail}
        tone="mechanic"
      />

      {/* WhatsApp */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!sidValid) {
            toast.error(
              "Le Content SID doit commencer par HX suivi de 32 caracteres.",
            );
            return;
          }
          setConfirmWaOpen(true);
        }}
        className="space-y-3 rounded-xl border border-navy-800/10 bg-white p-4"
      >
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-navy-800/50" />
          <h2 className="text-sm font-semibold text-navy-900">
            WhatsApp en masse (Twilio)
          </h2>
        </div>
        <p className="text-xs text-navy-800/50">
          Necessite un Content Template pre-approuve, cree via Twilio Console
          (Content Template Builder). Le SID ressemble a
          HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.
        </p>
        <div>
          <input
            type="text"
            required
            placeholder="Content SID Twilio (ex: HX1234...)"
            value={waForm.contentSid}
            onChange={(e) =>
              setWaForm({ ...waForm, contentSid: e.target.value })
            }
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500 ${
              sidValid ? "border-navy-800/15" : "border-danger"
            }`}
          />
          {!sidValid && (
            <p className="mt-1 text-xs text-danger">
              Format attendu : HX suivi de 32 caracteres hexadecimaux.
            </p>
          )}
        </div>
        <input
          type="text"
          placeholder="Variables du template separees par virgule (ex: Batterie CG125, 250000 GNF)"
          value={waForm.variables}
          onChange={(e) => setWaForm({ ...waForm, variables: e.target.value })}
          className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
        />
        <button
          type="submit"
          disabled={loadingWa || !waForm.contentSid}
          className="rounded-lg bg-navy-900 px-5 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-50"
        >
          Envoyer aux clients opt-in WhatsApp
        </button>
      </form>

      <ConfirmSendDrawer
        open={confirmWaOpen}
        onOpenChange={setConfirmWaOpen}
        title="Confirmer l'envoi WhatsApp"
        description="Ce message sera envoye immediatement a tous les clients ayant accepte WhatsApp, via le template Twilio renseigne. Cette action est irreversible."
        onConfirm={sendWhatsappBroadcast}
        loading={loadingWa}
        tone="navy"
      />
    </div>
  );
}
