export const metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* CARTE PRINCIPALE SOFT UI */}
      <div className="rounded-3xl bg-[#e6eef8] p-8 shadow-[12px_12px_24px_#c3cad3,-12px_-12px_24px_#ffffff] sm:p-10">
        {/* EN-TÊTE DE SECTION */}
        <div className="border-b border-slate-300/40 pb-6">
          <span className="rounded-full bg-[#e6eef8] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
            Protection des données
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-slate-800 sm:text-3xl">
            Politique de Confidentialité
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Établissements Elhadj Ibrahima Doumbouya et Fils (ETS-EIDF)
          </p>
        </div>

        {/* CONTENU DE LA POLITIQUE */}
        <div className="mt-8 space-y-6 text-slate-700">
          {/* 1. DONNÉES COLLECTÉES */}
          <section className="rounded-2xl bg-[#e6eef8] p-5 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mechanic-500">
              1. Collecte des données personnelles
            </h2>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
              Dans le cadre de l'utilisation de la plateforme, nous sommes
              amenés à collecter les informations suivantes :
            </p>
            <ul className="mt-2.5 list-disc space-y-1 pl-5 text-xs font-medium text-slate-600">
              <li>Informations d'identité : Nom, prénom.</li>
              <li>Coordonnées : Numéro de téléphone, adresse e-mail.</li>
              <li>
                Données de livraison : Adresse géographique à Kankan ou autres
                localités.
              </li>
            </ul>
          </section>

          {/* 2. UTILISATION DES DONNÉES */}
          <section className="rounded-2xl bg-[#e6eef8] p-5 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mechanic-500">
              2. Utilisation et Finalités
            </h2>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
              Les données personnelles collectées sont strictement réservées aux
              usages suivants :
            </p>
            <ul className="mt-2.5 list-disc space-y-1 pl-5 text-xs font-medium text-slate-600">
              <li>Traitement, validation et suivi de vos commandes.</li>
              <li>
                Livraison des motos, pièces détachées et huiles de moteur.
              </li>
              <li>
                Communication de support ou service après-vente via WhatsApp et
                téléphone.
              </li>
              <li>
                Avec votre accord explicite : envoi d'informations sur les
                arrivages et promotions.
              </li>
            </ul>
          </section>

          {/* 3. PAIEMENTS SECURISÉS */}
          <section className="rounded-2xl bg-[#e6eef8] p-5 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mechanic-500">
              3. Transactions et Sécurité
            </h2>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
              Les paiements mobiles (Orange Money, MTN Mobile Money) sont
              traités directement et de manière sécurisée via nos partenaires de
              paiement agréés (LengoPay / Djomy). Nous ne conservons aucun code
              secret ou donnée bancaire confidentielle sur nos serveurs.
            </p>
          </section>

          {/* 4. DROITS DES UTILISATEURS */}
          <section className="rounded-2xl bg-[#e6eef8] p-5 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mechanic-500">
              4. Vos droits et Désabonnement
            </h2>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
              Vous disposez à tout moment d'un droit d'accès, de rectification
              et de suppression de vos données personnelles. Vous pouvez
              également demander votre désabonnement de nos communications
              marketing.
            </p>
            <div className="mt-3 rounded-xl bg-[#e6eef8] p-3 shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff]">
              <p className="text-xs font-semibold text-slate-800">
                Pour toute demande concernant vos données :
              </p>
              <p className="mt-1 font-mono text-xs font-bold text-mechanic-500">
                Email : moussadoumbouya952@gmail.com
              </p>
              <p className="font-mono text-xs font-bold text-slate-700">
                Téléphone : +224 624 15 14 15
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
