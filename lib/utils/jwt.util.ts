/**
 * JWT Utility Functions for Next.js Route Handlers
 * 
 * Uses Next.js cookies() API instead of Express res.cookie()
 */

import jwt, { type JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export interface AuthPayload extends JwtPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: Omit<AuthPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: '15m',
  });
}

export function generateRefreshToken(payload: Omit<AuthPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  });
}

export function verifyAccessToken(token: string): AuthPayload {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AuthPayload;
  } catch {
    throw new Error('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): AuthPayload {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as AuthPayload;
  } catch {
    throw new Error('Invalid or expired refresh token');
  }
}

export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieStore = await cookies();

  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutes in seconds
  });

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}

/**
 * Get the current authenticated user from the request cookies.
 * Returns the decoded JWT payload, or null if unauthenticated.
 */
export async function getAuthUser(): Promise<AuthPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) return null;
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

/**
 * Require authentication. Returns the decoded user or throws.
 */
export async function requireAuth(): Promise<AuthPayload> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Require the user to be a specific role.
 */
export async function requireRole(...roles: string[]): Promise<AuthPayload> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error(`Access denied. Required role: ${roles.join(' or ')}`);
  }
  return user;
}
