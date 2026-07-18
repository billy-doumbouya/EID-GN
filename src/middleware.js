import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = "moto_shop_session";

// Empeche toute mise en cache (navigateur, CDN, proxy intermediaire) des
// reponses admin. Sans ca, une reponse deja servie une fois peut etre
// rejouee depuis un cache sans jamais repasser par ce middleware - donc
// sans jamais re-verifier l'authentification.
function withNoStore(response) {
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return withNoStore(redirectToLogin(request));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.role !== "ADMIN") {
      // Connecte mais pas admin : retour a l'accueil, pas vers /login
      // (se reconnecter ne changera pas son role).
      return withNoStore(NextResponse.redirect(new URL("/", request.url)));
    }

    return withNoStore(NextResponse.next());
  } catch {
    // Token invalide, expire, ou signature invalide
    return withNoStore(redirectToLogin(request));
  }
}

function redirectToLogin(request) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
