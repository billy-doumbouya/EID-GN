import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "moto_shop_session";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signSessionToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function verifySessionToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function setSessionCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const decoded = verifySessionToken(token);
  if (!decoded) return null;

  // Optionnel mais recommandé : vérifier en base si le user est suspendu
  // On importe dynamiquement prisma pour éviter les cycles si nécessaire, ou on l'importe en haut
  const { prisma } = await import("@/lib/prisma");
  const userInDb = await prisma.user.findUnique({
    where: { id: decoded.sub },
    select: { isSuspended: true, role: true }
  });

  if (!userInDb || userInDb.isSuspended) {
    return null; // Force déconnexion si supprimé ou suspendu
  }

  return { ...decoded, role: userInDb.role }; // Met à jour le rôle au cas où
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Genere un token de reset password : la valeur brute est envoyee par email,
// seul son hash est stocke en base (comme un mot de passe).
export function generateResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export function hashResetToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireOwnership(resourceUserId, allowAdmin = true) {
  const user = await requireAuth();
  if (user.sub === resourceUserId) return user;
  if (allowAdmin && user.role === "ADMIN") return user;
  throw new Error("FORBIDDEN");
}
