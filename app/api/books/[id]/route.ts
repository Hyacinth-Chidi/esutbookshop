import { NextRequest } from 'next/server';
import { getBookById, updateBook, deleteBook } from '@/lib/services/book.service';
import { requireRole } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { updateBookSchema } from '@/lib/validators/book.validator';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const book = await getBookById(id);
    return successResponse(book, 'Book retrieved successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === 'Book not found') {
      return errorResponse(errorMessage, 404);
    }
    console.error('Error fetching book:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole('admin', 'sub-admin');
    const { id } = await params;

    const formData = await req.formData();
    const data: any = {};
    const files: Record<string, Buffer[]> = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (!files[key]) files[key] = [];
        const arrayBuffer = await value.arrayBuffer();
        files[key].push(Buffer.from(arrayBuffer));
      } else {
        data[key] = value;
      }
    }

    // Validate body data
    const parseResult = updateBookSchema.safeParse(data);
    if (!parseResult.success) {
      return errorResponse('Validation Error', 400, parseResult.error.format());
    }

    const book = await updateBook(id, data, files, admin.id);
    return successResponse(book, 'Book updated successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === 'Book not found') {
      return errorResponse(errorMessage, 404);
    }
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error updating book:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole('admin', 'sub-admin');
    const { id } = await params;

    await deleteBook(id, admin.id);
    return successResponse(null, 'Book deleted successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === 'Book not found') {
      return errorResponse(errorMessage, 404);
    }
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error deleting book:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
