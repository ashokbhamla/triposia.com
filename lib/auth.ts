import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// Default values - can be overridden by environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'triposia-jwt-secret-key-2024-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@triposia.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export interface JWTPayload {
  email: string;
  iat?: number;
  exp?: number;
}

export function generateToken(email: string): string {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateAdmin(email: string, password: string): Promise<boolean> {
  // In production, this should check against a database
  // For now, using environment variables
  if (email === ADMIN_EMAIL) {
    // First time setup: if password matches plain text, hash it and store
    // For now, simple comparison (should be hashed in production)
    return password === ADMIN_PASSWORD;
  }
  return false;
}

export function getAuthTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies
  const cookieToken = request.cookies.get('admin_token');
  return cookieToken?.value || null;
}

export function isAuthenticated(request: NextRequest): boolean {
  const token = getAuthTokenFromRequest(request);
  if (!token) return false;
  
  const payload = verifyToken(token);
  return payload !== null && payload.email === ADMIN_EMAIL;
}

export function verifyAdminToken(token: string): boolean {
  const payload = verifyToken(token);
  return payload !== null && payload.email === ADMIN_EMAIL;
}

