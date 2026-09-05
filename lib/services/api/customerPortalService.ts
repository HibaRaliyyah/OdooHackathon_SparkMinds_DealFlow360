import { apiRequest, ApiResponse } from './apiClient';
import type { Quotation } from '@/lib/types';

export interface CustomerDashboardData {
  kpis: {
    activeQuotations: number;
    confirmedOrders: number;
    pendingInvoices: number;
  };
  recentQuotations: Quotation[];
}

export interface NegotiationPayload {
  requestedDiscountPercent: number;
  customerNotes?: string;
  lineItemChanges?: any[];
}

export const customerPortalService = {
  async getDashboard(customerId?: string): Promise<ApiResponse<CustomerDashboardData>> {
    const query = customerId ? `?customerId=${customerId}` : '';
    return apiRequest<CustomerDashboardData>(`/api/customer/dashboard${query}`);
  },

  async getQuotations(customerId?: string): Promise<ApiResponse<Quotation[]>> {
    const query = customerId ? `?customerId=${customerId}` : '';
    return apiRequest<Quotation[]>(`/api/customer/quotations${query}`);
  },

  async getQuotationById(id: string): Promise<ApiResponse<Quotation>> {
    return apiRequest<Quotation>(`/api/customer/quotations/${id}`);
  },

  async negotiateQuotation(id: string, payload: NegotiationPayload): Promise<ApiResponse<Quotation>> {
    return apiRequest<Quotation>(`/api/customer/quotations/${id}/negotiate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async acceptQuotation(id: string): Promise<ApiResponse<Quotation>> {
    return apiRequest<Quotation>(`/api/customer/quotations/${id}/accept`, {
      method: 'POST',
    });
  },

  async rejectQuotation(id: string, reason?: string): Promise<ApiResponse<Quotation>> {
    return apiRequest<Quotation>(`/api/customer/quotations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async getOrders(customerId?: string): Promise<ApiResponse<any[]>> {
    const query = customerId ? `?customerId=${customerId}` : '';
    return apiRequest<any[]>(`/api/customer/orders${query}`);
  },

  async getProfile(customerId?: string): Promise<ApiResponse<any>> {
    const query = customerId ? `?customerId=${customerId}` : '';
    return apiRequest<any>(`/api/customer/profile${query}`);
  },

  async updateProfile(profileData: any): Promise<ApiResponse<any>> {
    return apiRequest<any>('/api/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};
