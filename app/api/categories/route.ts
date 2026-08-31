import { NextRequest } from 'next/server';
import prisma from '@/lib/config/database';
import { requireRole } from '@/lib/utils/jwt.util';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    return successResponse(categories, 'Categories retrieved successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching categories:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole('admin');

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return errorResponse('Category name is required', 400);
    }

    const category = await prisma.category.create({
      data: { name: name.trim().toLowerCase() },
    });

    return successResponse(category, 'Category created successfully', 201);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Unique constraint')) {
      return errorResponse('A category with this name already exists', 409);
    }
    if (errorMessage.includes('Access') || errorMessage.includes('Authentication')) {
      return errorResponse(errorMessage, 403);
    }
    console.error('Error creating category:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
