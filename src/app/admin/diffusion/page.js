// src/app/(admin)/admin/diffusion/page.js
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Drawer } from "vaul";
import {
  Mail,
  MessageCircle,
  AlertTriangle,
  Send,
  Info,
  Loader2,
} from "lucide-react";

function ConfirmSendDrawer({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading,
  tone = "mechanic",
}) {
  const isMechanic = tone === "mechanic";

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-all" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-auto flex-col rounded-t-[2rem] bg-white pb-8 shadow-2xl outline-none sm:mx-auto sm:max-w-lg">
          <div className="mx-auto mt-4 h-1.5 w-14 rounded-full bg-navy-800/10" />
          <div className="px-6 pt-8 sm:px-8">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/50 shadow-inner">
              <AlertTriangle className="h-7 w-7 text-amber-500" />
            </div>

            <Drawer.Title className="font-display text-2xl font-semibold tracking-tight text-navy-900">
              {title}
            </Drawer.Title>

            <p className="mt-3 text-base leading-relaxed text-navy-800/70">
              {description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-all disabled:opacity-50 sm:w-auto ${
                  isMechanic
                    ? "bg-mechanic-500 shadow-md shadow-mechanic-500/20 hover:bg-mechanic-600 active:scale-[0.98]"
                    : "bg-emerald-600 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Confirmer l'envoi
                  </>
                )}
              </button>
              <Drawer.Close className="flex w-full items-center justify-center rounded-xl border border-navy-800/15 bg-white px-5 py-3.5 text-sm font-medium text-navy-900 transition-colors hover:bg-navy-50 active:scale-[0.98] sm:w-auto">
                Annuler
              </Drawer.Close>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default function DiffusionPage() {
  const [emailForm, setEmailForm] = useState({ subject: "", html: "" });
  const [waForm, setWaForm] = useState({ templateId: "", variables: "" });
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingWa, setLoadingWa] = useState(false);
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);
  const [confirmWaOpen, setConfirmWaOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/whatsapp-templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => toast.error("Impossible de charger les templates WhatsApp"))
      .finally(() => setLoadingTemplates(false));
  }, []);

  const selectedTemplate = templates.find((t) => t.id === waForm.templateId);

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
      toast.success(`Envoyé à ${data.sent} client(s)`);
      setEmailForm({ subject: "", html: "" });
      setConfirmEmailOpen(false);
    } catch (err) {
      toast.error(err.message || "Envoi échoué");
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
          templateId: waForm.templateId,
          contentVariables,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Envoyé à ${data.sent} client(s), ${data.failed} échec(s)`);
      setWaForm({ templateId: "", variables: "" });
      setConfirmWaOpen(false);
    } catch (err) {
      toast.error(
        err.message || "Envoi échoué - vérifiez la configuration Twilio",
      );
    } finally {
      setLoadingWa(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-navy-900">
          Campagnes de Diffusion
        </h1>
        <p className="mt-2 text-sm text-navy-800/60">
          Communiquez simultanément avec tous vos clients ayant accepté de
          recevoir des notifications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* CARTE EMAIL */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-navy-800/10 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="border-b border-navy-800/5 bg-navy-50/50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mechanic-100 text-mechanic-600">
                <Mail size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-navy-900">
                  Email en masse
                </h2>
                <p className="text-xs text-navy-800/60">
                  Idéal pour les newsletters et arrivages
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setConfirmEmailOpen(true);
            }}
            className="flex flex-1 flex-col p-6 space-y-5"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-900">
                Sujet de l'email
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Nouvel arrivage de batteries !"
                value={emailForm.subject}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, subject: e.target.value })
                }
                className="w-full rounded-xl border border-navy-800/15 bg-navy-50/30 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-navy-800/30 focus:border-mechanic-500 focus:bg-white focus:ring-4 focus:ring-mechanic-500/10"
              />
            </div>

            <div className="space-y-1.5 flex-1">
              <label className="text-sm font-medium text-navy-900">
                Contenu (HTML supporté)
              </label>
              <textarea
                required
                rows={7}
                placeholder="<h1>Bonjour,</h1><p>Nous venons de recevoir...</p>"
                value={emailForm.html}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, html: e.target.value })
                }
                className="w-full resize-none rounded-xl border border-navy-800/15 bg-navy-50/30 px-4 py-3 text-sm outline-none transition-all placeholder:text-navy-800/30 focus:border-mechanic-500 focus:bg-white focus:ring-4 focus:ring-mechanic-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={loadingEmail || !emailForm.subject || !emailForm.html}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-mechanic-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-mechanic-600 focus:ring-4 focus:ring-mechanic-500/20 disabled:opacity-50 active:scale-[0.98]"
            >
              <Send size={16} />
              Envoyer la campagne Email
            </button>
          </form>
        </div>

        {/* CARTE WHATSAPP */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-navy-800/10 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="border-b border-navy-800/5 bg-navy-50/50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <MessageCircle size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-navy-900">
                  Notification WhatsApp
                </h2>
                <p className="text-xs text-navy-800/60">
                  Taux d'ouverture optimal via Twilio
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setConfirmWaOpen(true);
            }}
            className="flex flex-1 flex-col p-6 space-y-6"
          >
            <div className="flex items-start gap-3 rounded-xl border border-blue-200/60 bg-blue-50/50 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div className="text-xs text-blue-900/80">
                <p className="font-medium">Modèles pré-approuvés uniquement</p>
                <p className="mt-1">
                  Choisissez un message parmi ceux déjà validés par WhatsApp.
                  Contactez le développeur pour en ajouter un nouveau.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-900">
                  Message à envoyer
                </label>
                <select
                  required
                  value={waForm.templateId}
                  onChange={(e) =>
                    setWaForm({ ...waForm, templateId: e.target.value })
                  }
                  disabled={loadingTemplates}
                  className="w-full rounded-xl border border-navy-800/15 bg-navy-50/30 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                >
                  <option value="">
                    {loadingTemplates
                      ? "Chargement..."
                      : "Choisissez un message"}
                  </option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {!loadingTemplates && templates.length === 0 && (
                  <p className="text-[11px] font-medium text-danger">
                    Aucun message disponible pour le moment.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-900">
                  Informations à inclure
                </label>
                <input
                  type="text"
                  placeholder="Ex: Batterie CG125, 250000 GNF"
                  value={waForm.variables}
                  onChange={(e) =>
                    setWaForm({ ...waForm, variables: e.target.value })
                  }
                  className="w-full rounded-xl border border-navy-800/15 bg-navy-50/30 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-navy-800/30 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
                <p className="text-[11px] text-navy-800/50">
                  Séparez chaque information par une virgule, dans l'ordre où
                  elles apparaissent dans le message.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingWa || !waForm.templateId}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 active:scale-[0.98]"
            >
              <Send size={16} />
              Envoyer via WhatsApp
            </button>
          </form>
        </div>
      </div>

      <ConfirmSendDrawer
        open={confirmEmailOpen}
        onOpenChange={setConfirmEmailOpen}
        title="Confirmer l'envoi de l'email"
        description={`La campagne "${emailForm.subject || "sans sujet"}" sera envoyée immédiatement à tous les clients opt-in. Cette action est irréversible.`}
        onConfirm={sendEmailBroadcast}
        loading={loadingEmail}
        tone="mechanic"
      />

      <ConfirmSendDrawer
        open={confirmWaOpen}
        onOpenChange={setConfirmWaOpen}
        title="Confirmer l'envoi WhatsApp"
        description={`Le message "${selectedTemplate?.label || ""}" sera envoyé immédiatement à tous les clients opt-in via WhatsApp. Cette action est irréversible.`}
        onConfirm={sendWhatsappBroadcast}
        loading={loadingWa}
        tone="emerald"
      />
    </div>
  );
}
