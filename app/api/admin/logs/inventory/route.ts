import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/config/database';
import { requireRole } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function GET(req: NextRequest) {
  try {
    // Only main admin can view logs
    await requireRole('admin');

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          book: {
            select: { id: true, title: true, courseCode: true }
          },
          admin: {
            select: { id: true, username: true }
          }
        }
      }),
      prisma.inventoryLog.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Access denied') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error fetching inventory logs:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
