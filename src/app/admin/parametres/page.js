import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Database,
  Image,
  CreditCard,
  Mail,
  MessageCircle,
  Brain,
  Sheet,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";

export const metadata = { title: "Parametres" };

function StatusBadge({ isConfigured, label }) {
  return isConfigured ? (
    <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
      <Check size={14} /> {label}
    </div>
  ) : (
    <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500">
      <AlertCircle size={14} /> {label}
    </div>
  );
}

function maskEmail(email) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  return `${user.slice(0, 3)}•••@${domain}`;
}

export default async function AdminSettingsPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login?redirect=/admin/parametres");
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });

  // Faille corrigee : sans ce check, n'importe quel client connecte
  // accedait a cette page (secrets d'infrastructure inclus).
  if (!user || user.role !== "ADMIN") {
    redirect("/login?redirect=/admin/parametres");
  }

  const integrations = {
    database: !!process.env.DATABASE_URL,
    cloudinary:
      !!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY,
    lengopay: !!process.env.LENGOPAY_API_KEY,
    djomy: !!process.env.DJOMY_CLIENT_SECRET,
    sheets: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    email: !!process.env.SMTP_USER,
    whatsapp: !!process.env.TWILIO_ACCOUNT_SID,
    gemini: !!process.env.GEMINI_API_KEY,
  };

  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const userCount = await prisma.user.count();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy-900">
          Parametres
        </h1>
        <p className="mt-1 text-sm text-navy-800/60">
          Gestion du compte et des integrations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-navy-800/10 bg-gradient-to-br from-navy-900 to-navy-800 p-6 text-white">
          <div className="text-sm font-medium opacity-70">Admin</div>
          <div className="mt-2 font-display text-xl font-semibold">
            {user.fullName}
          </div>
          <div className="mt-3 text-sm opacity-70">{user.email}</div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-medium opacity-70">2FA :</span>
            <span
              className={user.twoFaEnabled ? "text-success" : "text-amber-400"}
            >
              {user.twoFaEnabled ? "Actif" : "Inactif"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-navy-800/10 bg-gradient-to-br from-mechanic-500/10 to-mechanic-600/5 p-6">
          <div className="text-sm font-medium text-navy-800/60">Produits</div>
          <div className="mt-2 font-display text-3xl font-bold text-navy-900">
            {productCount}
          </div>
          <div className="mt-3 text-xs text-navy-800/50">
            Total en catalogue
          </div>
        </div>

        <div className="rounded-2xl border border-navy-800/10 bg-gradient-to-br from-success/10 to-success/5 p-6">
          <div className="text-sm font-medium text-navy-800/60">Commandes</div>
          <div className="mt-2 font-display text-3xl font-bold text-navy-900">
            {orderCount}
          </div>
          <div className="mt-3 text-xs text-navy-800/50">Total traitees</div>
        </div>
      </div>

      <div className="rounded-2xl border border-navy-800/10 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <Database size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-navy-900">Base de donnees</h3>
              <p className="mt-1 text-sm text-navy-800/60">
                Neon PostgreSQL - Gestion des donnees
              </p>
            </div>
          </div>
          <StatusBadge isConfigured={integrations.database} label="Connectee" />
        </div>
        {integrations.database && (
          <div className="mt-4 border-t border-navy-800/10 pt-4 text-xs text-navy-800/70">
            <div>Utilisateurs : {userCount}</div>
            <div className="mt-1">Produits : {productCount}</div>
            <div className="mt-1">Commandes : {orderCount}</div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-navy-800/10 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-purple-500/10 p-3">
              <Image size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-navy-900">Cloudinary</h3>
              <p className="mt-1 text-sm text-navy-800/60">
                Hebergement et transformation d'images
              </p>
            </div>
          </div>
          <StatusBadge
            isConfigured={integrations.cloudinary}
            label="Configure"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-navy-800/10 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-green-500/10 p-3">
                <CreditCard size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">LengoPay</h3>
                <p className="mt-1 text-sm text-navy-800/60">
                  Mobile Money - Orange Money, MTN
                </p>
              </div>
            </div>
            <StatusBadge
              isConfigured={integrations.lengopay}
              label={integrations.lengopay ? "Actif" : "Inactif"}
            />
          </div>
          {integrations.lengopay && (
            <div className="mt-4 border-t border-navy-800/10 pt-4 text-xs text-navy-800/70">
              Mode : Sandbox
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-navy-800/10 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-orange-500/10 p-3">
                <CreditCard size={24} className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Djomy</h3>
                <p className="mt-1 text-sm text-navy-800/60">
                  Mobile Money - Alternative paiement
                </p>
              </div>
            </div>
            <StatusBadge
              isConfigured={integrations.djomy}
              label={integrations.djomy ? "Actif" : "Inactif"}
            />
          </div>
          {integrations.djomy && (
            <div className="mt-4 border-t border-navy-800/10 pt-4 text-xs text-navy-800/70">
              Mode : Sandbox
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-navy-800/10 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-red-500/10 p-3">
                <Mail size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Email & Brevo</h3>
                <p className="mt-1 text-sm text-navy-800/60">
                  Emails transactionnels et diffusion
                </p>
              </div>
            </div>
            <StatusBadge isConfigured={integrations.email} label="Configure" />
          </div>
        </div>

        <div className="rounded-2xl border border-navy-800/10 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-green-500/10 p-3">
                <MessageCircle size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">
                  WhatsApp / Twilio
                </h3>
                <p className="mt-1 text-sm text-navy-800/60">
                  Diffusion et widget Click-to-Chat
                </p>
              </div>
            </div>
            <StatusBadge
              isConfigured={integrations.whatsapp}
              label={integrations.whatsapp ? "Actif" : "Inactif"}
            />
          </div>
          {integrations.whatsapp && (
            <div className="mt-4 flex items-center gap-1 border-t border-navy-800/10 pt-4 text-xs text-amber-500">
              <Clock size={12} /> Approuver templates WhatsApp en production
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-navy-800/10 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-teal-500/10 p-3">
                <Sheet size={24} className="text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Google Sheets</h3>
                <p className="mt-1 text-sm text-navy-800/60">
                  Synchronisation des commandes
                </p>
              </div>
            </div>
            <StatusBadge isConfigured={integrations.sheets} label="Configure" />
          </div>
          {integrations.sheets && (
            <div className="mt-4 border-t border-navy-800/10 pt-4 text-xs text-navy-800/70">
              <div className="font-mono text-[11px]">
                {maskEmail(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-navy-800/10 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-indigo-500/10 p-3">
                <Brain size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">
                  Chatbot Assistant
                </h3>
                <p className="mt-1 text-sm text-navy-800/60">
                  IA avec function calling connecte a la DB
                </p>
              </div>
            </div>
            <StatusBadge
              isConfigured={integrations.gemini}
              label="Configure"
            />
          </div>
        </div>
      </div>

      {/* <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <div className="flex gap-4">
          <AlertCircle
            size={24}
            className="mt-0.5 flex-shrink-0 text-amber-500"
          />
          <div>
            <h3 className="font-semibold text-navy-900">
              Avant la mise en production
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-navy-800/70">
              <li>
                Remplacer les cles sandbox par les vraies cles de production
                (LengoPay, Djomy)
              </li>
              <li>Activer et configurer la 2FA admin</li>
              <li>
                Configurer le rate limiting sur /api/auth/* et /api/chatbot
              </li>
              <li>
                Valider et approuver les Content Templates WhatsApp aupres de
                Twilio
              </li>
              <li>Mettre en place Sentry pour le monitoring d'erreurs</li>
              <li>
                Configurer les variables d'environnement de production dans
                Vercel
              </li>
            </ul>
          </div>
        </div>
      </div> */}
    </div>
  );
}
