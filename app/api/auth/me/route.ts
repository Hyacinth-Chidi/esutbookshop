import { NextRequest } from 'next/server';
import prisma from '@/lib/config/database';
import { requireAuth } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const admin = await prisma.admin.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return errorResponse('User not found', 404);
    }

    return successResponse(admin, 'User retrieved successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === 'Authentication required') {
      return errorResponse(errorMessage, 401);
    }
    console.error('Get current user error:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
