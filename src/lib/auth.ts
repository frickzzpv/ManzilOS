import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

interface JwtPayload {
  userId: string;
  phone: string;
  role: string;
  organizationId: string;
}

export async function getUserSession(request: NextRequest): Promise<JwtPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}
