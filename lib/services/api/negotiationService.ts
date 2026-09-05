import { apiRequest, ApiResponse } from './apiClient';

export interface NegotiationData {
  id: string;
  dealId: string;
  requestedDiscount: number;
  approvedDiscount?: number;
  previousAmount: number;
  negotiatedAmount: number;
  notes?: string;
  status: string;
}

export const negotiationService = {
  async getAll(): Promise<ApiResponse<NegotiationData[]>> {
    return apiRequest<NegotiationData[]>('/api/negotiations');
  },

  async create(data: Partial<NegotiationData>): Promise<ApiResponse<NegotiationData>> {
    return apiRequest<NegotiationData>('/api/negotiations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, updates: Partial<NegotiationData>): Promise<ApiResponse<NegotiationData>> {
    return apiRequest<NegotiationData>(`/api/negotiations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};
