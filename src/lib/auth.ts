import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

// ─── Constants ────────────────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret-change-me'
);
const COOKIE_NAME = 'arkan_session';
const SESSION_DURATION_DAYS = 30;

// ─── Password helpers ─────────────────────────────────────────────────────────

/** Hash a plain-text password. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Compare a plain-text password against a stored hash. */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT helpers ───────────────────────────────────────────────────────────────

interface TokenPayload {
  userId: string;
  role: string;
  sessionId: string;
}

/** Sign a JWT containing the user's id, role, and session record id. */
async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(JWT_SECRET);
}

/** Verify and decode a JWT. Returns null on failure. */
async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ─── Session management ───────────────────────────────────────────────────────

/**
 * Create a new device session:
 *  1. Deactivate any existing active session for this device fingerprint.
 *  2. Insert a new DeviceSession row.
 *  3. Sign a JWT that references the session row.
 *  4. Set an HTTP-only cookie.
 */
export async function createSession(
  userId: string,
  role: string,
  fingerprint: string
): Promise<void> {
  // Deactivate previous sessions from the same device
  await db.deviceSession.updateMany({
    where: { userId, fingerprint, isActive: true },
    data: { isActive: false },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  // Create the session row (token will be updated once we have the JWT)
  const session = await db.deviceSession.create({
    data: {
      userId,
      fingerprint,
      token: 'pending', // temporary placeholder
      isActive: true,
      expiresAt,
    },
  });

  // Sign a JWT that includes the session id
  const token = await signToken({ userId, role, sessionId: session.id });

  // Store the real token
  await db.deviceSession.update({
    where: { id: session.id },
    data: { token },
  });

  // Set HTTP-only cookie
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

/** Delete the session cookie and mark the DeviceSession inactive. */
export async function destroySession(): Promise<void> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    await db.deviceSession.updateMany({
      where: { token },
      data: { isActive: false },
    });
    cookieStore.delete(COOKIE_NAME);
  }
}

// ─── Current user ─────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Read the session cookie, verify the JWT, validate the DeviceSession in the
 * database, and return the associated User. Returns null if unauthenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    // Verify JWT signature & expiry
    const payload = await verifyToken(token);
    if (!payload) return null;

    // Validate the session is still active in the DB
    const session = await db.deviceSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (
      !session ||
      !session.isActive ||
      session.expiresAt < new Date()
    ) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    };
  } catch {
    return null;
  }
}
