import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

const FREE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
];

// Cache delivery info (10 minutes)
const DELIVERY_INFO_CACHE = { data: null, expiresAt: 0 };

const SYSTEM_PROMPT = process.env.CHATBOT_SYSTEM_PROMPT || `Tu es "Clinton", l'assistant commercial virtuel officiel de **EID-MULTISERVICE** (Établissements El Hadj Ibrahima Doumbouya et Fils - Guinée), basé à Kankan.

### Ton rôle et ton style :
- Tu es chaleureux, poli, dynamique et très professionnel.
- Tu utilises des expressions naturelles adaptées au contexte guinéen quand c'est opportun ("Bonjour / Bonsoir", "Soyez le bienvenu chez EID-MULTISERVICE").
- Tes réponses doivent être **claires, concises et aérées** (utilise des listes à puces • ou des numéros, évite les gros pavés de texte).
- Utilise des emojis avec parcimonie pour rendre la discussion vivante (🏍️, 🛠️, 📦, ✅).

### Informations clés sur EID-MULTISERVICE :
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
3. **PAGES DU SITE :** Quand tu mentionnes une section du site, indique le lien court (ex: "/motos", "/pieces", "/retours", "/contact", "/a-propos", "/mentions-legales", "/confidentialite").
4. **OUT DE PÉRIMÈTRE / NÉGOCIATION :** Si le client demande une remise spéciale, un achat en gros, un partenariat ou a une réclamation complexe, réponds poliment et redirige-le vers le service client WhatsApp.`;

// ============================================================
// SCHÉMAS ZOD — Validation stricte des inputs
// ============================================================
const messageSchema = z.object({
  role: z.enum(["user", "assistant", "model"]),
  content: z.string().min(1).max(4000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20), // Réduit à 20
  sessionId: z
    .string()
    .regex(/^chat_\d+_[a-z0-9]+$/i, "Session ID invalide")
    .optional(),
});

// ============================================================
// TOOLS — Fermés et validés
// ============================================================
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
                "Terme ou pièce recherchée (ex: TVS, Batterie, Pneu, CG125). Maximum 100 caractères.",
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
          "Vérifie l'état et l'avancement d'une commande passée par le client. Le téléphone doit correspondre à celui de la commande.",
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

// ============================================================
// TOOL EXECUTORS — Avec validation + try/catch + cache
// ============================================================
async function executeTool(name, input) {
  try {
    switch (name) {
      case "search_products":
        return await executeSearchProducts(input);
      case "get_product_details":
        return await executeGetProductDetails(input);
      case "check_order_status":
        return await executeCheckOrderStatus(input);
      case "get_delivery_info":
        return executeGetDeliveryInfo();
      default:
        return { error: `Outil inconnu: ${name}` };
    }
  } catch (err) {
    console.error(`[chatbot tool ${name}]`, err);
    return {
      error:
        "Service momentanément indisponible. Le client peut contacter le support WhatsApp.",
    };
  }
}

async function executeSearchProducts(input) {
  const query = String(input.query || "").slice(0, 100).trim();
  if (!query) return { error: "Requête vide" };

  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      ...(input.type && { type: input.type }),
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
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
      slug: true,
    },
  });

  return {
    count: products.length,
    products: products.map((p) => ({
      id: p.id,
      nom: p.name,
      sku: p.sku,
      type: p.type,
      prix_gnf: p.priceDetail
        ? `${p.priceDetail.toLocaleString("fr-FR")} GNF`
        : "Sur devis",
      disponibilite:
        p.stock > 0 ? `En stock (${p.stock} dispo)` : "Rupture de stock",
      lien: `/produit/${p.slug}`,
    })),
  };
}

async function executeGetProductDetails(input) {
  if (!input.productId) return { error: "productId manquant" };

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
    lien: `/produit/${product.slug}`,
  };
}

async function executeCheckOrderStatus(input) {
  if (!input.orderNumber || !input.phone) {
    return { error: "Numéro de commande et téléphone requis" };
  }

  // Normalisation du téléphone (enlever espaces, +224 éventuel)
  const normalizedPhone = input.phone.replace(/[\s+]/g, "").replace(/^224/, "");

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: input.orderNumber,
      OR: [
        { guestPhone: { contains: normalizedPhone } },
        { user: { phone: { contains: normalizedPhone } } },
      ],
    },
    select: {
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
          product: { select: { name: true } },
        },
        take: 5,
      },
    },
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
    articles: order.items.map((i) => `${i.quantity}× ${i.product.name}`),
  };
}

function executeGetDeliveryInfo() {
  // Cache 10 minutes
  const now = Date.now();
  if (DELIVERY_INFO_CACHE.data && now < DELIVERY_INFO_CACHE.expiresAt) {
    return DELIVERY_INFO_CACHE.data;
  }

  const data = {
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
    contact_whatsapp: "+224622000000",
  };

  DELIVERY_INFO_CACHE.data = data;
  DELIVERY_INFO_CACHE.expiresAt = now + 10 * 60 * 1000;
  return data;
}

// ============================================================
// GEMINI CLIENT — Avec retry, fallback et streaming
// ============================================================
function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === "assistant" || m.role === "model" ? "model" : "user",
    parts: [
      {
        text:
          typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      },
    ],
  }));
}

async function callGeminiStream(contents, signal) {
  let lastError;

  for (const model of FREE_MODELS) {
    try {
      const res = await fetch(
        `${GEMINI_API_BASE}/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal,
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            tools: TOOLS,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
              topP: 0.95,
            },
          }),
        }
      );

      if (!res.ok) {
        if ([429, 500, 503].includes(res.status)) {
          lastError = new Error(
            `${model} indisponible (HTTP ${res.status})`
          );
          continue;
        }
        const errBody = await res.text();
        throw new Error(
          `Erreur Gemini (${model}, HTTP ${res.status}): ${errBody}`
        );
      }

      return { res, modelUsed: model };
    } catch (err) {
      if (err.name === "AbortError") throw err;
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("Tous les modèles Gemini ont échoué");
}

// ============================================================
// ROUTE POST — Streaming SSE
// ============================================================
export async function POST(request) {
  // 1. Rate limit (10 messages / minute / IP)
  const limited = await rateLimit(request, "chatbot", {
    window: 60,
    max: 10,
  });
  if (limited) return limited;

  // 2. Auth (optionnel — récupérer le user si connecté)
  const session = await getCurrentUser().catch(() => null);

  // 3. Validation body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { messages, sessionId } = parsed.data;

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Clé API non configurée" },
      { status: 500 }
    );
  }

  // 4. Stream setup
  const encoder = new TextEncoder();
  const abortController = new AbortController();
  request.signal.addEventListener("abort", () => abortController.abort());

  const stream = new ReadableStream({
    async start(controller) {
      let fullReply = "";
      let modelUsed = "";
      let toolCallCount = 0;

      try {
        let contents = toGeminiContents(messages);
        let iterations = 0;
        let finalText = "";

        while (iterations < 5) {
          const { res, modelUsed: usedModel } = await callGeminiStream(
            contents,
            abortController.signal
          );
          modelUsed = usedModel;

          // Parser le stream SSE
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let collectedParts = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;

              try {
                const data = JSON.parse(jsonStr);

                // Texte streaming
                if (data.candidates?.[0]?.content?.parts) {
                  for (const part of data.candidates[0].content.parts) {
                    if (part.text) {
                      finalText += part.text;
                      fullReply += part.text;
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ content: part.text })}\n\n`
                        )
                      );
                    }
                    if (part.functionCall) {
                      collectedParts.push(part);
                    }
                  }
                }
              } catch {}
            }
          }

          // Si function calls détectés, exécuter et continuer la boucle
          const functionCalls = collectedParts.filter((p) => p.functionCall);

          if (functionCalls.length === 0) {
            // Pas de tool call → réponse finale
            break;
          }

          // Exécuter les tools
          contents.push({ role: "model", parts: collectedParts });

          const functionResponseParts = [];
          for (const part of functionCalls) {
            const result = await executeTool(
              part.functionCall.name,
              part.functionCall.args || {}
            );
            toolCallCount++;
            functionResponseParts.push({
              functionResponse: {
                name: part.functionCall.name,
                response: { content: result }, // Format Gemini attendu
              },
            });
          }

          contents.push({ role: "function", parts: functionResponseParts });
          iterations++;
        }

        // Signal de fin compatible UI et useChat
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              done: true,
              modelUsed,
              toolCallCount,
              sessionId,
            })}\n\n`
          )
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();

        // 5. Persistance en DB (asynchrone, non bloquante)
        if (sessionId) {
          persistSession({
            sessionId,
            userId: session?.sub,
            messages,
            reply: fullReply,
          }).catch((err) =>
            console.error("[chatbot persist]", err.message)
          );
        }
      } catch (err) {
        if (err.name === "AbortError") {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "aborted" })}\n\n`
            )
          );
        } else {
          console.error("[chatbot stream]", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error:
                  "Désolé, le service est momentanément indisponible. Vous pouvez nous contacter sur WhatsApp.",
              })}\n\n`
            )
          );
        }
        controller.close();
      }
    },
    cancel() {
      abortController.abort();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Désactive le buffering nginx
    },
  });
}

// ============================================================
// PERSISTENCE — Fire and forget
// ============================================================
async function persistSession({ sessionId, userId, messages, reply }) {
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  await prisma.chatSession.upsert({
    where: { id: sessionId },
    create: {
      id: sessionId,
      ...(userId && { userId }),
    },
    update: {},
  });

  if (lastUserMessage) {
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "user",
        content: lastUserMessage.content,
      },
    });
  }

  if (reply) {
    await prisma.chatMessage.create({
      data: { sessionId, role: "assistant", content: reply },
    });
  }
}
