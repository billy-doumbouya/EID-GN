import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Mon profil" };

export default async function ProfilePage() {
  const session = await getCurrentUser();
  const user = await prisma.user.findUnique({ where: { id: session.sub }, include: { addresses: true } });

  return (
    <div className="max-w-md space-y-6">
      <div className="rounded-xl border border-navy-800/10 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-navy-900">Informations</h3>
        <p className="text-sm text-navy-800/80">{user.fullName}</p>
        <p className="text-sm text-navy-800/80">{user.email}</p>
        <p className="text-sm text-navy-800/80">{user.phone}</p>
      </div>
      <div className="rounded-xl border border-navy-800/10 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-navy-900">Adresses</h3>
        {user.addresses.length === 0 ? (
          <p className="text-sm text-navy-800/60">Aucune adresse enregistree.</p>
        ) : (
          user.addresses.map((a) => (
            <p key={a.id} className="text-sm text-navy-800/80">{a.label} - {a.quartier}, {a.ville}</p>
          ))
        )}
      </div>
    </div>
  );
}
