import { apiRequest, ApiResponse } from './apiClient';

export interface UserAuthData {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES_REP' | 'SALES_MANAGER' | 'FINANCE' | 'CUSTOMER';
  company?: string;
  tier?: string;
}

export interface AuthResponse {
  token: string;
  user: UserAuthData;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
  company?: string;
  tier?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async signup(payload: SignupPayload): Promise<ApiResponse<AuthResponse>> {
    return apiRequest<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe(token: string): Promise<ApiResponse<{ user: UserAuthData }>> {
    return apiRequest<{ user: UserAuthData }>('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
