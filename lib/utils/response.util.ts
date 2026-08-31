/**
 * ============================================
 * RESPONSE UTILITY FUNCTIONS (Next.js)
 * ============================================
 * Standardized API response formats using NextResponse
 */

import { NextResponse } from 'next/server';

/**
 * Success response
 */
export const successResponse = <T>(data: T | null = null, message: string = 'Success', statusCode: number = 200) => {
  return NextResponse.json({
    success: true,
    message,
    data,
  }, { status: statusCode });
};

/**
 * Error response
 */
export const errorResponse = (message: string = 'Something went wrong', statusCode: number = 500, errors: unknown = null) => {
  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return NextResponse.json(response, { status: statusCode });
};

/**
 * Paginated response
 */
export const paginatedResponse = <T>(data: T[], pagination: { page: number, limit: number, total: number }, message: string = 'Success') => {
  return NextResponse.json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  }, { status: 200 });
};
