import { NextRequest } from 'next/server';
import { requestAdminPasswordReset } from '@/lib/services/passwordReset.service';
import { requestPasswordResetSchema } from '@/lib/validators/auth.validator';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const parseResult = requestPasswordResetSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse('Validation Error', 400, parseResult.error.format());
    }
    
    const { email } = parseResult.data;
    
    await requestAdminPasswordReset(email);
    
    // Always return success message for security (don't reveal if email exists)
    return successResponse(
      null,
      'If an account with that email exists, a password reset link has been sent.'
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Forgot password error:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
