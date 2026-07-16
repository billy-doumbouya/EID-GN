export const metadata = { title: "Politique de confidentialite" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 prose prose-sm">
      <h1 className="font-display text-2xl font-semibold text-navy-900">Politique de confidentialite</h1>
      <p className="mt-4 text-navy-800/80">
        Les donnees personnelles collectees (nom, telephone, email, adresses de
        livraison) sont utilisees uniquement pour le traitement des commandes et,
        avec votre consentement, pour vous informer des nouveaux arrivages par
        email ou WhatsApp. Vous pouvez a tout moment demander la suppression de
        vos donnees ou vous desabonner des communications marketing.
      </p>
    </div>
  );
}
