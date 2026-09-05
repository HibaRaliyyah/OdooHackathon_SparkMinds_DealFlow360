import { create } from 'zustand';

export interface CustomerStoreState {
  currentCustomer: {
    id: string;
    name: string;
    email: string;
    company: string;
    tier: string;
    paymentTerms: string;
    currency: string;
  };
  setCurrentCustomer: (customer: CustomerStoreState['currentCustomer']) => void;
}

export const useDealFlowStore = create<CustomerStoreState>((set) => ({
  currentCustomer: {
    id: 'CUST-001',
    name: 'Tom Acme',
    email: 'tom@acmecorp.com',
    company: 'Acme Corp',
    tier: 'Gold',
    paymentTerms: 'Net 30',
    currency: 'USD',
  },
  setCurrentCustomer: (customer) => set({ currentCustomer: customer }),
}));
