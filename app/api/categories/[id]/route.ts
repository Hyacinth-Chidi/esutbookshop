import { NextRequest } from 'next/server';
import prisma from '@/lib/config/database';
import { requireRole } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('admin');
    const { id } = await params;

    // Check if category has books
    const bookCount = await prisma.book.count({ where: { categoryId: id } });
    if (bookCount > 0) {
      return errorResponse(`Cannot delete category: ${bookCount} book(s) are assigned to it`, 400);
    }

    await prisma.category.delete({ where: { id } });
    return successResponse(null, 'Category deleted successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Record to delete does not exist')) {
      return errorResponse('Category not found', 404);
    }
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error deleting category:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
