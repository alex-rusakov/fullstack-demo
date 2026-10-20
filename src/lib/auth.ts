import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { prisma } from "./db";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return salt + ":" + hash;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function sessionToken(sessionId: string): string {
  return createHash("sha256").update(sessionId + process.env.AUTH_SECRET).digest("hex");
}

export async function createSession(userId: number) {
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { id: sessionId, userId, expiresAt } });
  return { cookie: sessionToken(sessionId) + ":" + sessionId, expiresAt };
}

export async function getSessionUser(token: string | undefined) {
  if (!token) return null;
  const [, sessionId] = token.split(":");
  if (!sessionId) return null;
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  const [, sessionId] = token.split(":");
  if (sessionId) await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
}
