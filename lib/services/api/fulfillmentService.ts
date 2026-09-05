import { apiRequest, ApiResponse } from './apiClient';

export interface FulfillmentData {
  id: string;
  dealId: string;
  productId: string;
  quantity: number;
  fulfilledQuantity: number;
  remainingQuantity: number;
  status: string;
  expectedDate?: string;
}

export const fulfillmentService = {
  async getAll(): Promise<ApiResponse<FulfillmentData[]>> {
    return apiRequest<FulfillmentData[]>('/api/fulfillment');
  },

  async create(data: Partial<FulfillmentData>): Promise<ApiResponse<FulfillmentData>> {
    return apiRequest<FulfillmentData>('/api/fulfillment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, updates: Partial<FulfillmentData>): Promise<ApiResponse<FulfillmentData>> {
    return apiRequest<FulfillmentData>(`/api/fulfillment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};
