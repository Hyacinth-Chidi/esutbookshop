import { NextRequest } from 'next/server';
import { getReportBooks } from '@/lib/services/book.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = {
      session: searchParams.get('session'),
      semester: searchParams.get('semester'),
    };

    const result = await getReportBooks(query);
    return successResponse(result, 'Report books retrieved successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching report books:', error);
    return errorResponse(errorMessage || 'Server Error', 500);
  }
}
