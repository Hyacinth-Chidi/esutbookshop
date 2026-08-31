import { NextRequest } from 'next/server';
import { getSubAdminById, deleteSubAdmin } from '@/lib/services/admin.service';
import { requireRole } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('admin');
    const { id } = await params;
    
    const subAdmin = await getSubAdminById(id);
    return successResponse(subAdmin, 'Sub-admin retrieved successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === 'Sub-admin not found' || errorMessage === 'This is not a sub-admin account') {
      return errorResponse(errorMessage, 404);
    }
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error fetching sub-admin:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('admin');
    const { id } = await params;
    
    await deleteSubAdmin(id);
    return successResponse(null, 'Sub-admin deleted successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === 'Sub-admin not found' || errorMessage === 'Cannot delete admin account') {
      return errorResponse(errorMessage, 400);
    }
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error deleting sub-admin:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
