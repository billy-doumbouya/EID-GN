// src/lib/whatsappTemplates.js

// Liste des Content Templates WhatsApp approuves, disponibles pour les
// campagnes de diffusion en masse. Le SID reel n'est jamais expose au
// client — seul `id`/`label` transitent vers l'admin, le SID est resolu
// ici, cote serveur, au moment de l'envoi.
//
// Pour ajouter un nouveau template : le creer/approuver dans la Twilio
// Console (Content Template Builder), ajouter son SID en variable d'env,
// puis ajouter une entree ici.
const TEMPLATES = [
  {
    id: "arrivage",
    label: "Nouvel arrivage",
    envVar: "TWILIO_TEMPLATE_ARRIVAGE_SID",
  },
  {
    id: "promo",
    label: "Promotion en cours",
    envVar: "TWILIO_TEMPLATE_PROMO_SID",
  },
];

export function listAvailableTemplates() {
  // On ne renvoie que les templates dont le SID est effectivement
  // configure en env — evite d'afficher une option qui echouerait a coup sur.
  return TEMPLATES.filter((t) => !!process.env[t.envVar]).map((t) => ({
    id: t.id,
    label: t.label,
  }));
}

export function resolveTemplateSid(id) {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) return null;
  return process.env[template.envVar] || null;
}
