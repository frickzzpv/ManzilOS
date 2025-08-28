import { NextResponse } from 'next/server';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    issues?: any[];
  };
}

export function apiSuccess<T>(data: T, message?: string, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function apiError(message: string, status: number = 500, issues?: any[]): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        issues,
      },
    },
    { status }
  );
}
