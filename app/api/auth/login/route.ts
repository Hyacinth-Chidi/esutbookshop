import { NextRequest } from 'next/server';
import prisma from '@/lib/config/database';
import { comparePassword } from '@/lib/utils/password.util';
import { generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { loginSchema } from '@/lib/validators/auth.validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse('Validation Error', 400, parseResult.error.format());
    }
    
    const { username, password } = parseResult.data;

    // Find admin by username
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return errorResponse('Invalid username or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return errorResponse('Invalid username or password', 401);
    }

    // Generate tokens
    const payload = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Set cookies
    await setAuthCookies(accessToken, refreshToken);

    // Send response
    return successResponse(
      {
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      },
      'Login successful'
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Login error:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
