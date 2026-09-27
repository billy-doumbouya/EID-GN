import { NextResponse } from "next/server";

const ipMap = new Map();

/**
 * Limiteur de débit simple en mémoire par IP
 * @param {Request} request
 * @param {string} prefix
 * @param {{ window: number, max: number }} options
 * @returns {Promise<NextResponse | null>}
 */
export async function rateLimit(
  request,
  prefix = "general",
  { window = 60, max = 10 } = {}
) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : "127.0.0.1";

  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const windowMs = window * 1000;

  const record = ipMap.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count += 1;
  ipMap.set(key, record);

  // Nettoyage périodique si la Map grandit
  if (ipMap.size > 5000) {
    for (const [k, v] of ipMap.entries()) {
      if (now > v.resetTime) ipMap.delete(k);
    }
  }

  if (record.count > max) {
    const retryAfter = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return NextResponse.json(
      { error: "Trop de requêtes. Veuillez patienter un instant avant de réessayer." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  return null;
}
