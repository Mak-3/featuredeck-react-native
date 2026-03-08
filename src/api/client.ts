import { API_BASE_URL } from '../config';

let apiKey: string | null = null;

export function setApiKey(key: string) {
  apiKey = key;
}

export function getApiKey(): string {
  if (!apiKey) {
    throw new Error('[FeaturedDeck] API key not set. Call FeaturedDeck.init() first.');
  }
  return apiKey;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const key = getApiKey();
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null as any,
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`,
      };
    }

    return {
      data: data.data || data,
      success: true,
    };
  } catch (error: any) {
    return {
      data: null as any,
      success: false,
      error: error.message || 'Network error',
    };
  }
}

export async function get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: 'GET' });
}

export async function post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function del<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: 'DELETE' });
}
