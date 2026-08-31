import { NextRequest, NextResponse } from 'next/server';
import { getAllBooks, createBook } from '@/lib/services/book.service';
import { requireRole } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { createBookSchema } from '@/lib/validators/book.validator';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = {
      search: searchParams.get('search'),
      courseCode: searchParams.get('courseCode'),
      departmentId: searchParams.get('departmentId'),
      facultyId: searchParams.get('facultyId'),
      categoryId: searchParams.get('categoryId'),
      level: searchParams.get('level'),
      semester: searchParams.get('semester'),
      session: searchParams.get('session'),
      hasManual: searchParams.get('hasManual'),
      inStock: searchParams.get('inStock'),
      page: searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 30,
    };

    const result = await getAllBooks(query);
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching books:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole('admin', 'sub-admin');

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
    const parseResult = createBookSchema.safeParse(data);
    if (!parseResult.success) {
      return errorResponse('Validation Error', 400, parseResult.error.format());
    }

    const book = await createBook(data, files, admin.id);
    return successResponse(book, 'Book created successfully', 201);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('required') || errorMessage.includes('Access denied') || errorMessage.includes('Authentication')) {
      const status = errorMessage.includes('Access') || errorMessage.includes('Authentication') ? 403 : 400;
      return errorResponse(errorMessage, status);
    }
    console.error('Error creating book:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
