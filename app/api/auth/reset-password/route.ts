import { NextRequest } from 'next/server';
import { resetAdminPassword } from '@/lib/services/passwordReset.service';
import { resetPasswordSchema } from '@/lib/validators/auth.validator';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const parseResult = resetPasswordSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse('Validation Error', 400, parseResult.error.format());
    }
    
    const { email, token, newPassword } = parseResult.data;
    
    await resetAdminPassword(email, token, newPassword);
    
    return successResponse(
      null,
      'Password reset successful. You can now log in with your new password.'
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === 'Invalid or expired reset token') {
      return errorResponse(errorMessage, 400);
    }
    console.error('Reset password error:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
