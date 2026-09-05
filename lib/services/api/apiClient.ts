// ============================================================
// DealFlow360 — Central REST API Client
// Handles communication between Next.js frontend and Express Backend
// ============================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP Error ${response.status}`,
      };
    }

    return data;
  } catch (error: any) {
    console.warn(`[API Client] Connection to ${url} failed, fallback mode active:`, error.message);
    return {
      success: false,
      message: error.message || 'Network connection failed',
    };
  }
}
