import { NextRequest } from 'next/server';
import { createSubAdmin, getAllSubAdmins } from '@/lib/services/admin.service';
import { requireRole } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { createSubAdminSchema } from '@/lib/validators/auth.validator';

export async function GET(req: NextRequest) {
  try {
    await requireRole('admin');
    
    const subAdmins = await getAllSubAdmins();
    return successResponse(subAdmins, 'Sub-admins retrieved successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error fetching sub-admins:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole('admin');
    
    const body = await req.json();
    const parseResult = createSubAdminSchema.safeParse(body);
    
    if (!parseResult.success) {
      return errorResponse('Validation Error', 400, parseResult.error.format());
    }
    
    const result = await createSubAdmin(parseResult.data);
    
    return successResponse(
      result,
      'Sub-admin created successfully. Credentials sent via email.',
      201
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('already exists')) {
      return errorResponse(errorMessage, 400);
    }
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error creating sub-admin:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
