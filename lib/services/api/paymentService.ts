import { apiRequest, ApiResponse } from './apiClient';

export interface PaymentData {
  id: string;
  dealId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionReference?: string;
  paidAt?: string;
}

export const paymentService = {
  async getAll(): Promise<ApiResponse<PaymentData[]>> {
    return apiRequest<PaymentData[]>('/api/payments');
  },

  async create(data: Partial<PaymentData>): Promise<ApiResponse<PaymentData>> {
    return apiRequest<PaymentData>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, updates: Partial<PaymentData>): Promise<ApiResponse<PaymentData>> {
    return apiRequest<PaymentData>(`/api/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};
