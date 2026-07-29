import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

const FREE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
];

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "search_products",
        description:
          "Recherche des produits dans le catalogue (motos, tricycles, pièces détachées). Utile pour vérifier si un produit est en stock ou connaître son prix.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Terme ou pièce recherchée (ex: TVS, Batterrie, Pneu, CG125)",
            },
            type: { type: "string", enum: ["MOTO", "TRICYCLE", "PIECE"] },
          },
          required: ["query"],
        },
      },
      {
        name: "get_product_details",
        description:
          "Récupère la fiche détaillée d'un produit (compatibilité véhicules, description, prix exact, stock).",
        parameters: {
          type: "object",
          properties: { productId: { type: "string" } },
          required: ["productId"],
        },
      },
      {
        name: "check_order_status",
        description:
          "Vérifie l'état et l'avancement d'une commande passée par le client.",
        parameters: {
          type: "object",
          properties: {
            orderNumber: { type: "string" },
            phone: { type: "string" },
          },
          required: ["orderNumber", "phone"],
        },
      },
      {
        name: "get_delivery_info",
        description:
          "Fournit les zones couvertes, délais et tarifs de livraison en Guinée.",
        parameters: { type: "object", properties: {} },
      },
    ],
  },
];

// PROMPT SYSTÈME ENRICHI ET ENTRAÎNÉ POUR EID-GN
const SYSTEM_PROMPT = `Tu es "Clinton", l'assistant commercial virtuel officiel de **EID-GN** (Établissements El Hadj Ibrahima Doumbouya et Fils - Guinée), basé à Kankan.

### Ton rôle et ton style :
- Tu es chaleureux, poli, dynamique et très professionnel.
- Tu utilises des expressions naturelles adaptées au contexte guinéen quand c'est opportun ("Bonjour / Bonsoir", "Soyez le bienvenu chez EID-GN").
- Tes réponses doivent être **claires, concises et aérées** (utilise des listes à puces • ou des numéros, évite les gros pavés de texte).
- Utilise des emojis avec parcimonie pour rendre la discussion vivante (🏍️, 🛠️, 📦, ✅).

### Informations clés sur EID-GN :
- **Localisation principale :** Kankan, Guinée (magasin physique).
- **Moyens de paiement acceptés :** Orange Money Guinée, MTN Mobile Money, Moov Money, et Carte Bancaire (Visa).
- **Livraison :** Partout en Guinée (Kankan en 24h, Conakry, Labé, Nzérékoré, Boké, Kindia, Mamou, Faranah sous 24 à 48h).
- **Politique de retour :** Les articles non utilisés peuvent être retournés ou échangés selon nos conditions consultables sur la page /retours.

### Règles d'or strictes :
1. **PRIX ET STOCKS :** N'invente JAMAIS un prix ou un niveau de stock. Si un client demande un produit, utilise IMMÉDIATEMENT l'outil \`search_products\`. Si aucun résultat n'est trouvé, réponds poliment que l'article n'est pas répertorié en ligne et invite-le à contacter le magasin.
2. **FORMAT DE RÉPONSE PRODUIT :** Quand tu présentes un produit trouvé, indique toujours :
   - Son nom exact
   - Son prix en Franc Guinéen (GNF)
   - Sa disponibilité en stock
3. **PAGES DU SITE :** Quand tu mentionnes une section du site, indique le lien court (ex: "/motos", "/pieces", "/retours", "/contact"/, "a-propos", "/mentions-legales", "/confidentialite", ).
4. **OUT DE PÉRIMÈTRE / NÉGOCIATION :** Si le client demande une remise spéciale, un achat en gros, un partenariat ou a une réclamation complexe, réponds poliment et redirige-le vers le service client WhatsApp.`;

async function executeTool(name, input) {
  if (name === "search_products") {
    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        ...(input.type && { type: input.type }),
        OR: [
          { name: { contains: input.query, mode: "insensitive" } },
          { sku: { contains: input.query, mode: "insensitive" } },
          { description: { contains: input.query, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        priceDetail: true,
        stock: true,
        sku: true,
        type: true,
      },
    });

    // Formate les prix pour que le LLM ne se trompe pas dans les devises
    const formattedProducts = products.map((p) => ({
      ...p,
      prix_gnf: p.priceDetail
        ? `${p.priceDetail.toLocaleString("fr-FR")} GNF`
        : "Sur devis",
      disponibilite:
        p.stock > 0 ? `En stock (${p.stock} dispo)` : "Rupture de stock",
    }));

    return { products: formattedProducts };
  }

  if (name === "get_product_details") {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      include: { compatibility: { include: { vehicleModel: true } } },
    });
    if (!product) return { error: "Produit introuvable" };

    return {
      id: product.id,
      nom: product.name,
      description: product.description,
      prix_gnf: `${product.priceDetail?.toLocaleString("fr-FR")} GNF`,
      stock: product.stock,
      compatibilites:
        product.compatibility?.map((c) => c.vehicleModel.name) || [],
    };
  }

  if (name === "check_order_status") {
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: input.orderNumber,
        OR: [{ guestPhone: input.phone }, { user: { phone: input.phone } }],
      },
      select: { orderNumber: true, status: true, total: true, createdAt: true },
    });
    if (!order) {
      return {
        error:
          "Commande introuvable. Vérifiez le numéro de commande et le numéro de téléphone.",
      };
    }
    return {
      numero: order.orderNumber,
      statut: order.status,
      montant_total: `${order.total?.toLocaleString("fr-FR")} GNF`,
      date: new Date(order.createdAt).toLocaleDateString("fr-FR"),
    };
  }

  if (name === "get_delivery_info") {
    return {
      villes_couvertes: [
        "Kankan (Express 24h)",
        "Conakry",
        "Kindia",
        "Labé",
        "Mamou",
        "Faranah",
        "Siguiri",
        "N'Zérékoré",
        "Boké",
      ],
      delais: "24h à Kankan, 24 à 48h pour les autres préfectures.",
      frais:
        "Calculés automatiquement à la caisse selon le poids et la destination.",
    };
  }

  return { error: "Outil inconnu" };
}

function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [
      {
        text:
          typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      },
    ],
  }));
}

async function generateWithFallback(contents) {
  let lastError;

  for (const model of FREE_MODELS) {
    try {
      const res = await fetch(
        `${GEMINI_API_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            tools: TOOLS,
          }),
        },
      );

      if (!res.ok) {
        if ([429, 500, 503].includes(res.status)) {
          lastError = new Error(`${model} indisponible (HTTP ${res.status})`);
          continue;
        }
        const errBody = await res.text();
        throw new Error(
          `Erreur Gemini (${model}, HTTP ${res.status}): ${errBody}`,
        );
      }

      const data = await res.json();
      return { data, modelUsed: model };
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("Tous les modèles Gemini ont échoué");
}

export async function POST(request) {
  const { messages, sessionId } = await request.json();

  if (!Array.isArray(messages) || messages.length > 40) {
    return NextResponse.json({ error: "Session invalide" }, { status: 400 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Clé API non configurée" },
      { status: 500 },
    );
  }

  let contents = toGeminiContents(messages);
  let candidate;

  try {
    const { data } = await generateWithFallback(contents);
    candidate = data.candidates?.[0];
  } catch (err) {
    console.error("Erreur Gemini:", err);
    return NextResponse.json(
      { error: "Le service est momentanément indisponible" },
      { status: 503 },
    );
  }

  let iterations = 0;
  while (
    candidate?.content?.parts?.some((p) => p.functionCall) &&
    iterations < 5
  ) {
    const parts = candidate.content.parts;
    contents.push({ role: "model", parts });

    const functionResponseParts = [];
    for (const part of parts) {
      if (part.functionCall) {
        const result = await executeTool(
          part.functionCall.name,
          part.functionCall.args || {},
        );
        functionResponseParts.push({
          functionResponse: {
            name: part.functionCall.name,
            response: result,
          },
        });
      }
    }

    contents.push({ role: "function", parts: functionResponseParts });

    try {
      const { data } = await generateWithFallback(contents);
      candidate = data.candidates?.[0];
    } catch (err) {
      console.error("Erreur Gemini Tool Loop:", err);
      return NextResponse.json(
        { error: "Le service est momentanément indisponible" },
        { status: 503 },
      );
    }

    iterations++;
  }

  const textParts = candidate?.content?.parts?.filter((p) => p.text) || [];
  const replyText =
    textParts.map((p) => p.text).join("") ||
    "Désolé, je n'ai pas pu récupérer l'information demandée.";

  if (sessionId) {
    try {
      await prisma.chatSession.upsert({
        where: { id: sessionId },
        create: { id: sessionId },
        update: {},
      });
      await prisma.chatMessage.create({
        data: { sessionId, role: "assistant", content: replyText },
      });
    } catch (err) {
      console.error("Erreur log ChatMessage:", err);
    }
  }

  return NextResponse.json({ reply: replyText });
}
