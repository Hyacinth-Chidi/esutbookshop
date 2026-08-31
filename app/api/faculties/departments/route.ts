import { NextRequest } from 'next/server';
import { createDepartment } from '@/lib/services/faculty.service';
import { requireRole } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function POST(req: NextRequest) {
  try {
    await requireRole('admin'); // Admin only
    
    const { name, facultyId } = await req.json();

    if (!name || !facultyId) {
      return errorResponse('Department name and faculty ID are required', 400);
    }

    const department = await createDepartment(name, facultyId);
    return successResponse(department, 'Department created', 201);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === 'Department already exists in this faculty') {
      return errorResponse(errorMessage, 400);
    }
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error creating department:', error);
    return errorResponse('Error creating department', 500, errorMessage);
  }
}
