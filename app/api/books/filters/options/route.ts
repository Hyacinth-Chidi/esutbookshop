import { NextRequest } from 'next/server';
import { getFilterOptions } from '@/lib/services/book.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function GET(req: NextRequest) {
  try {
    const options = await getFilterOptions();
    return successResponse(options, 'Filter options retrieved successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching filter options:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
