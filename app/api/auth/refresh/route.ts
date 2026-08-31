import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyRefreshToken, generateAccessToken, setAuthCookies, clearAuthCookies } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('refreshToken')?.value;

    if (!token) {
      return errorResponse('Refresh token required', 401);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    // Generate new access token
    const payload = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    const newAccessToken = generateAccessToken(payload);

    // Set new cookies (we keep the old refresh token)
    await setAuthCookies(newAccessToken, token);

    return successResponse(null, 'Token refreshed successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await clearAuthCookies();
    return errorResponse('Invalid or expired refresh token', 401);
  }
}
