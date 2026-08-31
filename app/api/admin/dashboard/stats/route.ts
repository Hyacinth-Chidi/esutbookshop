import { NextRequest } from 'next/server';
import { getDashboardStats } from '@/lib/services/admin.service';
import { requireRole } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function GET(req: NextRequest) {
  try {
    await requireRole('admin', 'sub-admin');
    
    const stats = await getDashboardStats();
    return successResponse(stats, 'Dashboard stats retrieved successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error fetching dashboard stats:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
