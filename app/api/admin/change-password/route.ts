import { NextRequest } from 'next/server';
import { changePassword } from '@/lib/services/admin.service';
import { requireRole, getAuthUser } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { changePasswordSchema } from '@/lib/validators/auth.validator';

export async function PUT(req: NextRequest) {
  try {
    const user = await requireRole('admin', 'sub-admin');
    
    const body = await req.json();
    const parseResult = changePasswordSchema.safeParse(body);
    
    if (!parseResult.success) {
      return errorResponse('Validation Error', 400, parseResult.error.format());
    }

    const { currentPassword, newPassword } = parseResult.data;
    
    await changePassword(user.id, currentPassword, newPassword);
    
    return successResponse(null, 'Password changed successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === 'Current password is incorrect') {
      return errorResponse(errorMessage, 400);
    }
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error changing password:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
