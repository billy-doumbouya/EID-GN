// src/app/compte/profil/page.js
import { redirect } from "next/navigation";
import { Mail, Phone, MapPin, Star, ShieldCheck, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Modales interactives
import { EditProfileModal } from "@/components/EditProfileModal";
import { AddAddressModal } from "@/components/AddAddressModal";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { LogoutButton } from "@/components/LogoutButton";
import { AddressCard } from "@/components/AddressCard";

export const metadata = { title: "Mon profil | EID-GN" };

function getInitials(fullName) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/connexion?next=/compte/profil");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { addresses: { orderBy: { isDefault: "desc" } } },
  });

  if (!user) {
    redirect("/connexion?next=/compte/profil");
  }

  const isGros = user.customerType === "GROS";

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Hero Header Profil */}
      <div className="relative overflow-hidden rounded-2xl border border-navy-800/10 bg-white p-6 md:p-8 shadow-sm">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-mechanic-500/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center sm:flex-row sm:text-left sm:gap-6">
          <div className="relative mb-4 sm:mb-0">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-800 text-3xl font-bold tracking-wider text-mechanic-400 shadow-lg ring-4 ring-white">
              {getInitials(user.fullName)}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
              <ShieldCheck size={16} />
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <h1 className="font-display text-2xl font-bold text-navy-900 md:text-3xl">
              {user.fullName}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  isGros
                    ? "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20"
                    : "bg-navy-800/5 text-navy-800/70"
                }`}
              >
                <User size={14} />
                Client {isGros ? "Gros (Grossiste)" : "Détail"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coordonnées */}
        <div className="flex flex-col rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between border-b border-navy-800/5 pb-3">
            <div>
              <h2 className="text-base font-semibold text-navy-900">
                Coordonnées
              </h2>
              <p className="text-xs text-navy-800/50">
                Informations de contact
              </p>
            </div>

            <EditProfileModal
              initialData={{
                fullName: user.fullName,
                email: user.email ?? "",
                phone: user.phone ?? "",
              }}
            />
          </div>

          <div className="space-y-3 text-sm flex-1">
            <div className="flex items-center gap-3 rounded-xl bg-offwhite-100/60 p-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-xs text-mechanic-500 shrink-0">
                <Mail size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-medium text-navy-800/50 uppercase tracking-wider">
                  Adresse email
                </p>
                <p className="font-medium text-navy-900 truncate">
                  {user.email || (
                    <span className="italic text-navy-800/40">
                      Non renseignée
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-offwhite-100/60 p-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-xs text-mechanic-500 shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-navy-800/50 uppercase tracking-wider">
                  Numéro de téléphone
                </p>
                <p className="font-medium text-navy-900">
                  {user.phone || (
                    <span className="italic text-navy-800/40">
                      Non renseigné
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Adresses */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between border-b border-navy-800/5 pb-3">
            <div>
              <h2 className="text-base font-semibold text-navy-900">
                Adresses de livraison
              </h2>
              <p className="text-xs text-navy-800/50">
                Gérez vos lieux de réception à Kankan
              </p>
            </div>

            <AddAddressModal />
          </div>

          {user.addresses.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-navy-800/15 p-8 text-center">
              <MapPin size={28} className="mb-2 text-navy-800/30" />
              <p className="text-xs font-medium text-navy-800/60">
                Aucune adresse enregistrée pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.addresses.map((address) => (
                <AddressCard key={address.id} address={address} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sécurité & Compte */}
      <div className="rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-navy-900 border-b border-navy-800/5 pb-3">
          Sécurité & Compte
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ChangePasswordModal />
          <LogoutButton variant="profile" />
        </div>
      </div>
    </div>
  );
}
