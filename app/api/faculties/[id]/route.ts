import { NextRequest } from 'next/server';
import { deleteFaculty } from '@/lib/services/faculty.service';
import { requireRole } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('admin'); // Admin only
    const { id } = await params;
    
    await deleteFaculty(id);
    return successResponse(null, 'Faculty deleted successfully', 200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error deleting faculty:', error);
    return errorResponse('Error deleting faculty', 500, errorMessage);
  }
}
