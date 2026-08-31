import { NextRequest } from 'next/server';
import { clearAuthCookies } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function POST(req: NextRequest) {
  try {
    await clearAuthCookies();
    return successResponse(null, 'Logout successful');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Logout error:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
