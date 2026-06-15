import { eq } from "drizzle-orm";
import * as cookie from "cookie";
import * as crypto from "crypto";
import * as jose from "jose";
import { db } from "@db/index";
import { users, type User } from "@db/schema";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-for-local-dev-only"
);

export async function signSessionToken(userId: number): Promise<string> {
  return new jose.SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Session.maxAgeMs / 1000 + "s")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return Number(payload.sub);
  } catch (err) {
    return null;
  }
}

export async function authenticateRequest(headers: Headers): Promise<User> {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    throw Errors.forbidden("No session cookie found.");
  }
  
  const userId = await verifySessionToken(token);
  if (!userId) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  
  return user[0];
}

// Helper to hash passwords using scrypt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(":");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return key === derivedKey;
}
