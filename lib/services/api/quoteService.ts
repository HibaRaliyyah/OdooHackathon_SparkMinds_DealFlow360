import { apiRequest, ApiResponse } from './apiClient';
import type { Quotation } from '@/lib/types';

export const quoteService = {
  async getAll(): Promise<ApiResponse<Quotation[]>> {
    return apiRequest<Quotation[]>('/api/quotes');
  },

  async getById(id: string): Promise<ApiResponse<Quotation>> {
    return apiRequest<Quotation>(`/api/quotes/${id}`);
  },

  async create(quote: Partial<Quotation>): Promise<ApiResponse<Quotation>> {
    return apiRequest<Quotation>('/api/quotes', {
      method: 'POST',
      body: JSON.stringify(quote),
    });
  },

  async update(id: string, updates: Partial<Quotation>): Promise<ApiResponse<Quotation>> {
    return apiRequest<Quotation>(`/api/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/quotes/${id}`, {
      method: 'DELETE',
    });
  },
};
