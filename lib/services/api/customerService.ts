import { apiRequest, ApiResponse } from './apiClient';
import type { Customer } from '@/lib/types';

export const customerService = {
  async getAll(): Promise<ApiResponse<Customer[]>> {
    return apiRequest<Customer[]>('/api/customers');
  },

  async getById(id: string): Promise<ApiResponse<Customer>> {
    return apiRequest<Customer>(`/api/customers/${id}`);
  },

  async create(customer: Partial<Customer>): Promise<ApiResponse<Customer>> {
    return apiRequest<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  },

  async update(id: string, updates: Partial<Customer>): Promise<ApiResponse<Customer>> {
    return apiRequest<Customer>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/customers/${id}`, {
      method: 'DELETE',
    });
  },
};
