export const metadata = { title: "Mentions Légales" };

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* CARTE PRINCIPALE SOFT UI */}
      <div className="rounded-3xl bg-[#e6eef8] p-8 shadow-[12px_12px_24px_#c3cad3,-12px_-12px_24px_#ffffff] sm:p-10">
        {/* EN-TÊTE DE SECTION */}
        <div className="border-b border-slate-300/40 pb-6">
          <span className="rounded-full bg-[#e6eef8] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
            Informations Légales
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-slate-800 sm:text-3xl">
            Mentions Légales
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Conformément aux réglementations du Registre du Commerce et du
            Crédit Mobilier (RCCM) de la République de Guinée.
          </p>
        </div>

        {/* CONTENU DES MENTIONS LÉGALES */}
        <div className="mt-8 space-y-6 text-slate-700">
          {/* IDENTIFICATION DE L'ENTREPRISE */}
          <section className="rounded-2xl bg-[#e6eef8] p-5 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mechanic-500">
              1. Éditeur de l'Établissement
            </h2>
            <dl className="mt-3 space-y-2 text-xs font-medium">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-slate-500">
                  Nom commercial / Raison sociale :
                </dt>
                <dd className="font-bold text-slate-800">
                  ETABLISSEMENTS ELHADJ IBRAHIMA DOUMBOUYA ET FILS
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-slate-500">Sigle / Enseigne :</dt>
                <dd className="font-bold text-slate-800">ETS-EIDF</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-slate-500">Forme juridique :</dt>
                <dd className="font-bold text-slate-800">Personne Physique</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-slate-500">Promoteur / Gérant :</dt>
                <dd className="font-bold text-slate-800">Moussa DOUMBOUYA</dd>
              </div>
            </dl>
          </section>

          {/* IMMATRICULATION & REGISTRE */}
          <section className="rounded-2xl bg-[#e6eef8] p-5 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mechanic-500">
              2. Immatriculation & Registre
            </h2>
            <dl className="mt-3 space-y-2 text-xs font-medium">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-slate-500">N° d'entreprise RCCM :</dt>
                <dd className="font-mono font-bold text-slate-800">
                  GN.TCC.2026.A.06542
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-slate-500">N° de formalité RCCM :</dt>
                <dd className="font-mono font-bold text-slate-800">
                  GN.TCC.2026.07521
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-slate-500">
                  Juridiction d'enregistrement :
                </dt>
                <dd className="font-bold text-slate-800">
                  Tribunal de Commerce de Conakry
                </dd>
              </div>
            </dl>
          </section>

          {/* ACTIVITÉS OFFICIELLES */}
          <section className="rounded-2xl bg-[#e6eef8] p-5 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mechanic-500">
              3. Objet & Activités déclarées
            </h2>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
              Commerce Général ; Import-Export, Vente de Motos, Pièces
              Détachées, Huiles de Moteur.
            </p>
          </section>

          {/* COORDONNÉES DE CONTACT */}
          <section className="rounded-2xl bg-[#e6eef8] p-5 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mechanic-500">
              4. Siège social & Contacts
            </h2>
            <dl className="mt-3 space-y-2 text-xs font-medium">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-slate-500">Adresse de l'établissement :</dt>
                <dd className="font-bold text-slate-800">
                  Korialen, Commune de Kankan, Guinée
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-slate-500">Téléphone de contact :</dt>
                <dd className="font-mono font-bold text-slate-800">
                  +224 624 15 14 15
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-slate-500">Courrier électronique :</dt>
                <dd className="font-mono font-bold text-slate-800">
                  moussadoumbouya952@gmail.com
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
