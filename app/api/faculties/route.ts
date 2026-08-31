import { NextRequest } from 'next/server';
import { getAllFaculties, createFaculty } from '@/lib/services/faculty.service';
import { requireRole, getAuthUser } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function GET(req: NextRequest) {
  try {
    await requireRole('admin', 'sub-admin'); // Verify authentication
    const faculties = await getAllFaculties();
    return successResponse(faculties, 'Faculties retrieved', 200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error retrieving faculties:', error);
    return errorResponse('Error retrieving faculties', 500, errorMessage);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole('admin'); // Admin only
    
    const { name } = await req.json();

    if (!name) {
      return errorResponse('Faculty name is required', 400);
    }

    const faculty = await createFaculty(name);
    return successResponse(faculty, 'Faculty created', 201);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === 'Faculty already exists') {
      return errorResponse(errorMessage, 400);
    }
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error creating faculty:', error);
    return errorResponse('Error creating faculty', 500, errorMessage);
  }
}
