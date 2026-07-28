// src/app/api/chatbot/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

// Modeles gratuits Google AI Studio, du plus capable au plus leger.
// On "map through" cette liste : si un modele est rate-limited (429) ou
// indisponible (503/500), on bascule automatiquement sur le suivant.
// A revalider avant mise en prod : la liste de modeles gratuits disponibles
// change avec le temps, verifier sur Google AI Studio.
const FREE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
];

// Liste FERMEE d'outils. Le LLM ne genere jamais de SQL : chaque fonction
// execute une requete Prisma parametree et testee. C'est la seule maniere
// d'eviter l'injection et la fuite de donnees (ex: infos d'autres clients).
// Format Gemini : functionDeclarations avec "parameters" (pas "input_schema").
const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "search_products",
        description:
          "Recherche des produits dans le catalogue (motos, tricycles, pieces detachees)",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Termes de recherche, ex: batterie CG125",
            },
            type: { type: "string", enum: ["MOTO", "TRICYCLE", "PIECE"] },
          },
          required: ["query"],
        },
      },
      {
        name: "get_product_details",
        description:
          "Recupere les details complets d'un produit (prix, stock, compatibilite)",
        parameters: {
          type: "object",
          properties: { productId: { type: "string" } },
          required: ["productId"],
        },
      },
      {
        name: "check_order_status",
        description:
          "Verifie le statut d'une commande via son numero et le telephone du client",
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
        description: "Retourne les zones et delais de livraison",
        parameters: { type: "object", properties: {} },
      },
    ],
  },
];

const SYSTEM_PROMPT = `Tu es l'assistant de EID-GN Kankan, boutique de motos, tricycles et pieces
detachees. Reponds en francais, de maniere concise et utile.
Moyens de paiement acceptes : Orange Money, MTN Mobile Money, Moov Money et carte
bancaire (Visa), via nos partenaires de paiement securises.
Politique de retour : voir la page /retours du site.
Utilise UNIQUEMENT les outils fournis pour repondre aux questions sur les produits,
stocks et commandes - ne jamais inventer de prix, de stock ou de statut de commande.
Si la question depasse ton perimetre (negociation de prix, reclamation complexe),
propose clairement au client de contacter la boutique sur WhatsApp.`;

async function executeTool(name, input) {
  if (name === "search_products") {
    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        ...(input.type && { type: input.type }),
        OR: [
          { name: { contains: input.query, mode: "insensitive" } },
          { sku: { contains: input.query, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        priceDetail: true,
        stock: true,
        sku: true,
      },
    });
    return { products };
  }

  if (name === "get_product_details") {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      include: { compatibility: { include: { vehicleModel: true } } },
    });
    return product || { error: "Produit introuvable" };
  }

  if (name === "check_order_status") {
    // Un client connecte a son telephone sur User.phone, pas sur
    // Order.guestPhone (qui reste null pour les commandes passees en etant
    // connecte — cf. logique de /api/orders). On verifie donc les deux
    // sources possibles, sinon un client avec compte ne trouve jamais sa
    // commande via le chatbot.
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: input.orderNumber,
        OR: [{ guestPhone: input.phone }, { user: { phone: input.phone } }],
      },
      select: { orderNumber: true, status: true, total: true, createdAt: true },
    });
    return (
      order || {
        error: "Commande introuvable - verifiez le numero et le telephone",
      }
    );
  }

  if (name === "get_delivery_info") {
    return {
      zones: [
        "Boke",
        "Conakry",
        "Kindia",
        "Labe",
        "Mamou",
        "Faranah",
        "Kankan",
        "N'Zerekore",
      ],
      delaiMoyen: "24 a 48h a Kankan, jusqu'a 48h pour les autres regions",
      fraisLivraison: "Calcules selon la zone au moment de la commande",
    };
  }

  return { error: "Outil inconnu" };
}

// Convertit l'historique du frontend ({role, content} en texte simple, format
// courant cote client) vers le format "contents" de Gemini.
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

// Appelle l'API Gemini en REST pur, en essayant chaque modele gratuit dans
// l'ordre jusqu'a ce qu'un appel reussisse. Leve une erreur si tous echouent.
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
        // 429 = quota depasse, 503/500 = surcharge -> on tente le modele suivant
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

  throw lastError || new Error("Tous les modeles Gemini gratuits ont echoue");
}

export async function POST(request) {
  const { messages, sessionId } = await request.json();

  // Limite basique anti-abus - a affiner avec un rate limit par IP/session
  // (ex: Upstash Ratelimit) en production.
  if (!Array.isArray(messages) || messages.length > 40) {
    return NextResponse.json(
      { error: "Session de chat invalide" },
      { status: 400 },
    );
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Configuration serveur manquante" },
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
      { error: "Le service est momentanement indisponible" },
      { status: 503 },
    );
  }

  // Boucle d'appels d'outils tant que le modele en demande (max 5 iterations
  // de securite pour eviter une boucle infinie en cas de comportement inattendu)
  let iterations = 0;
  while (
    candidate?.content?.parts?.some((p) => p.functionCall) &&
    iterations < 5
  ) {
    const parts = candidate.content.parts;

    // On reinjecte la reponse du modele (y compris les functionCall) dans l'historique
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
      console.error("Erreur Gemini (suite tool_use):", err);
      return NextResponse.json(
        { error: "Le service est momentanement indisponible" },
        { status: 503 },
      );
    }

    iterations++;
  }

  const textParts = candidate?.content?.parts?.filter((p) => p.text) || [];
  const replyText =
    textParts.map((p) => p.text).join("") ||
    "Desole, je n'ai pas pu traiter votre demande.";

  // Log pour analytics produit (questions frequentes des clients)
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
      console.error("Log ChatMessage echoue (non bloquant):", err);
    }
  }

  return NextResponse.json({ reply: replyText });
}
