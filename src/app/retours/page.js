export const metadata = { title: "Retours et Garantie" };

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* CARTE PRINCIPALE SOFT UI */}
      <div className="rounded-3xl bg-[#e6eef8] p-8 shadow-[12px_12px_24px_#c3cad3,-12px_-12px_24px_#ffffff] sm:p-10">
        {/* EN-TÊTE DE SECTION */}
        <div className="border-b border-slate-300/40 pb-6">
          <span className="rounded-full bg-[#e6eef8] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
            Service Après-Vente
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-slate-800 sm:text-3xl">
            Retours & Garantie
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Établissements Elhadj Ibrahima Doumbouya et Fils (ETS-EIDF) — Kankan
          </p>
        </div>

        {/* CONTENU DE LA POLITIQUE */}
        <div className="mt-8 space-y-6 text-slate-700">
          {/* 1. CONDITIONS DE RETOUR */}
          <section className="rounded-2xl bg-[#e6eef8] p-5 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mechanic-500">
              1. Politique & Délais de Retour
            </h2>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
              Vous disposez d'un délai de <strong>7 jours</strong> à compter de
              la réception de votre commande pour effectuer une demande
              d'échange ou de retour sous réserve du respect des conditions
              suivantes :
            </p>
            <ul className="mt-2.5 list-disc space-y-1 pl-5 text-xs font-medium text-slate-600">
              <li>
                <strong>Pièces détachées :</strong> La pièce doit être neuve,
                non montée, non utilisée et conservée dans son emballage
                d'origine.
              </li>
              <li>
                <strong>Huiles et lubrifiants :</strong> Les bidons doivent être
                parfaitement scellés et non ouverts.
              </li>
              <li>
                <strong>Motos :</strong> Aucun retour n'est accepté après
                immatriculation ou mise en circulation sur voie publique, sauf
                défaut de fabrication avéré sous garantie.
              </li>
            </ul>
          </section>

          {/* 2. GARANTIE CONSTRUCTEUR */}
          <section className="rounded-2xl bg-[#e6eef8] p-5 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mechanic-500">
              2. Garantie Produits & Moteurs
            </h2>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
              Toutes nos motos neuves et pièces d'origine sont couvertes par la
              garantie constructeur contre tout vice caché ou défaut de
              fabrication :
            </p>
            <ul className="mt-2.5 list-disc space-y-1 pl-5 text-xs font-medium text-slate-600">
              <li>
                La garantie couvre le remplacement ou la réparation de la pièce
                reconnue défectueuse par nos équipes techniques.
              </li>
              <li>
                Sont exclus de la garantie : l'usure normale des pièces (pneus,
                plaquettes de frein, chaîne), une mauvaise installation, ou une
                utilisation inappropriée.
              </li>
            </ul>
          </section>

          {/* 3. PROCÉDURE DE RÉCLAMATION */}
          <section className="rounded-2xl bg-[#e6eef8] p-5 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mechanic-500">
              3. Procédure de Réclamation
            </h2>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
              Pour toute réclamation ou demande d'échange, veuillez nous
              contacter directement muni de votre numéro de commande :
            </p>

            <div className="mt-3 flex flex-col gap-2 rounded-xl bg-[#e6eef8] p-4 shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff]">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500">
                  Point de dépôt / Magasin :
                </span>
                <span className="font-bold text-slate-800">
                  Korialen, Kankan
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500">Téléphone / WhatsApp :</span>
                <span className="font-mono font-bold text-mechanic-500">
                  +224 624 15 14 15
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500">Email :</span>
                <span className="font-mono font-bold text-slate-800">
                  moussadoumbouya952@gmail.com
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
