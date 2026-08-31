import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/jwt.util';
import prisma from '@/lib/config/database';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function GET(req: NextRequest) {
  try {
    let settings = await prisma.systemSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          currentSession: '2024/2025',
          currentSemester: 'First Semester',
        },
      });
    }

    return successResponse(settings, 'System settings retrieved', 200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error retrieving settings:', error);
    return errorResponse('Error retrieving settings', 500, errorMessage);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole('admin');
    
    const { currentSession, currentSemester } = await req.json();

    let settings = await prisma.systemSettings.findFirst();

    if (settings) {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          currentSession,
          currentSemester,
        },
      });
    } else {
      settings = await prisma.systemSettings.create({
        data: {
          currentSession,
          currentSemester,
        },
      });
    }

    return successResponse(settings, 'System settings updated', 200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error updating settings:', error);
    return errorResponse('Error updating settings', 500, errorMessage);
  }
}
