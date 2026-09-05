import { apiRequest, ApiResponse } from './apiClient';

export interface DealData {
  id: string;
  title: string;
  description?: string;
  customerId: string;
  amount: number;
  discount: number;
  expectedMargin: number;
  status: string;
  probability: number;
  expectedCloseDate?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const dealService = {
  async getAll(): Promise<ApiResponse<DealData[]>> {
    return apiRequest<DealData[]>('/api/deals');
  },

  async getById(id: string): Promise<ApiResponse<DealData>> {
    return apiRequest<DealData>(`/api/deals/${id}`);
  },

  async create(deal: Partial<DealData>): Promise<ApiResponse<DealData>> {
    return apiRequest<DealData>('/api/deals', {
      method: 'POST',
      body: JSON.stringify(deal),
    });
  },

  async update(id: string, updates: Partial<DealData>): Promise<ApiResponse<DealData>> {
    return apiRequest<DealData>(`/api/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/deals/${id}`, {
      method: 'DELETE',
    });
  },
};
