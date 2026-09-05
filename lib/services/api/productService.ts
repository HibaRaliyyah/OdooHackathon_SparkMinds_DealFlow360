import { apiRequest, ApiResponse } from './apiClient';
import type { Product } from '@/lib/types';

export const productService = {
  async getAll(): Promise<ApiResponse<Product[]>> {
    return apiRequest<Product[]>('/api/products');
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    return apiRequest<Product>(`/api/products/${id}`);
  },

  async create(product: Partial<Product>): Promise<ApiResponse<Product>> {
    return apiRequest<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async update(id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    return apiRequest<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },
};
