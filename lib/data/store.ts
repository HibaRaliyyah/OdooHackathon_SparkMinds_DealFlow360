'use client';
// ============================================================
// DealFlow360 — Global State Store (Zustand)
// Wraps mock data with mutation capabilities for demo
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  USERS, CUSTOMERS, PRODUCTS, PRODUCT_CATEGORIES, PRICE_LISTS,
  TIER_POLICIES, WAREHOUSES, INVENTORY, QUOTATIONS, APPROVAL_REQUESTS,
  NEGOTIATIONS, FULFILLMENT_ORDERS, INVOICES, SUBSCRIPTIONS,
  DEAL_HEALTH_FLAGS, AUDIT_EVENTS, NOTIFICATIONS, ACTIVITY_FEED,
  DEMO_PASSWORDS,
} from './mockData';
import type {
  User, Customer, Product, ProductCategory, PriceList, TierPolicy,
  Quotation, ApprovalRequest, NegotiationRequest, Warehouse, InventoryItem,
  FulfillmentOrder, Invoice, Subscription, DealHealthFlag, AuditEvent, Notification,
  ActivityItem, QuotationItem, BlendedRiskResult, ApprovalAction,
} from '@/lib/types';

// ─── Auth State ───────────────────────────────────────────────
interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

// ─── App State ────────────────────────────────────────────────
interface AppState extends AuthState {
  // Data
  users: User[];
  customers: Customer[];
  products: Product[];
  productCategories: ProductCategory[];
  priceLists: PriceList[];
  tierPolicies: TierPolicy[];
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  quotations: Quotation[];
  approvalRequests: ApprovalRequest[];
  negotiations: NegotiationRequest[];
  fulfillmentOrders: FulfillmentOrder[];
  invoices: Invoice[];
  subscriptions: Subscription[];
  dealHealthFlags: DealHealthFlag[];
  auditEvents: AuditEvent[];
  notifications: Notification[];
  activityFeed: ActivityItem[];

  // Quotation mutations
  addQuotation: (q: Quotation) => void;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  updateQuotationItems: (id: string, items: QuotationItem[], risk: BlendedRiskResult) => void;

  // Approval mutations
  addApprovalRequest: (req: ApprovalRequest) => void;
  addApprovalAction: (requestId: string, action: ApprovalAction) => void;
  updateApprovalStage: (requestId: string, stage: ApprovalRequest['stage'], status: ApprovalRequest['status']) => void;

  // Notification mutations
  markNotificationRead: (id: string) => void;
  addNotification: (n: Notification) => void;

  // Activity
  addActivity: (a: ActivityItem) => void;

  // Audit
  addAuditEvent: (e: AuditEvent) => void;

  // Warehouse & Inventory
  addWarehouse: (wh: Warehouse) => void;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventory: (id: string, updates: Partial<InventoryItem>) => void;

  // Negotiation
  addNegotiation: (n: NegotiationRequest) => void;
  updateNegotiation: (id: string, updates: Partial<NegotiationRequest>) => void;

  // Invoices
  addInvoice: (inv: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;

  // Subscriptions
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;

  // Fulfillment mutations
  addFulfillmentOrder: (fo: FulfillmentOrder) => void;
  updateFulfillmentOrder: (id: string, updates: Partial<FulfillmentOrder>) => void;

  // Demo reset
  resetDemoData: () => void;
}

// ─── Store with Persistence ───────────────────────────────────
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      isAuthenticated: false,

      login: (email, password) => {
        const expectedPassword = DEMO_PASSWORDS[email];
        if (!expectedPassword || expectedPassword !== password) {
          return { success: false, error: 'Invalid email or password' };
        }
        const user = USERS.find(u => u.email === email);
        if (!user) return { success: false, error: 'User not found' };
        set({ currentUser: user, isAuthenticated: true });
        return { success: true };
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      // Initial data
      users: USERS,
      customers: CUSTOMERS,
      products: PRODUCTS,
      productCategories: PRODUCT_CATEGORIES,
      priceLists: PRICE_LISTS,
      tierPolicies: TIER_POLICIES,
      warehouses: WAREHOUSES,
      inventory: INVENTORY,
      quotations: QUOTATIONS,
      approvalRequests: APPROVAL_REQUESTS,
      negotiations: NEGOTIATIONS,
      fulfillmentOrders: FULFILLMENT_ORDERS,
      invoices: INVOICES,
      subscriptions: SUBSCRIPTIONS,
      dealHealthFlags: DEAL_HEALTH_FLAGS,
      auditEvents: AUDIT_EVENTS,
      notifications: NOTIFICATIONS,
      activityFeed: ACTIVITY_FEED,

      // Quotation mutations
      addQuotation: (q) => set(s => ({ quotations: [q, ...s.quotations] })),
      updateQuotation: (id, updates) =>
        set(s => ({
          quotations: s.quotations.map(q => q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q),
        })),
      updateQuotationItems: (id, items, risk) =>
        set(s => ({
          quotations: s.quotations.map(q => q.id === id ? { ...q, items, blendedRisk: risk, updatedAt: new Date().toISOString() } : q),
        })),

      // Approval mutations
      addApprovalRequest: (req) => set(s => ({ approvalRequests: [req, ...s.approvalRequests] })),
      addApprovalAction: (requestId, action) =>
        set(s => ({
          approvalRequests: s.approvalRequests.map(r =>
            r.id === requestId ? { ...r, actions: [...r.actions, action], updatedAt: new Date().toISOString() } : r
          ),
        })),
      updateApprovalStage: (requestId, stage, status) =>
        set(s => ({
          approvalRequests: s.approvalRequests.map(r =>
            r.id === requestId ? { ...r, stage, status, updatedAt: new Date().toISOString() } : r
          ),
        })),

      // Notification mutations
      markNotificationRead: (id) =>
        set(s => ({
          notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        })),
      addNotification: (n) => set(s => ({ notifications: [n, ...s.notifications] })),

      // Activity
      addActivity: (a) => set(s => ({ activityFeed: [a, ...s.activityFeed] })),

      // Audit
      addAuditEvent: (e) => set(s => ({ auditEvents: [e, ...s.auditEvents] })),

      // Warehouse & Inventory mutations
      addWarehouse: (wh) => set(s => ({ warehouses: [...s.warehouses, wh] })),
      updateWarehouse: (id, updates) =>
        set(s => ({
          warehouses: s.warehouses.map(w => w.id === id ? { ...w, ...updates } : w),
        })),
      addInventoryItem: (item) => set(s => ({ inventory: [item, ...s.inventory] })),
      updateInventory: (id, updates) =>
        set(s => ({
          inventory: s.inventory.map(i => i.id === id ? { ...i, ...updates } : i),
        })),

      // Negotiation
      addNegotiation: (n) => set(s => ({ negotiations: [n, ...s.negotiations] })),
      updateNegotiation: (id, updates) =>
        set(s => ({
          negotiations: s.negotiations.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n),
        })),

      // Invoices
      addInvoice: (inv) => set(s => ({ invoices: [inv, ...s.invoices] })),
      updateInvoice: (id, updates) =>
        set(s => ({
          invoices: s.invoices.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i),
        })),

      // Subscriptions
      updateSubscription: (id, updates) =>
        set(s => ({
          subscriptions: s.subscriptions.map(sub => sub.id === id ? { ...sub, ...updates, updatedAt: new Date().toISOString() } : sub),
        })),

      // Fulfillment
      addFulfillmentOrder: (fo) => set(s => ({ fulfillmentOrders: [fo, ...s.fulfillmentOrders] })),
      updateFulfillmentOrder: (id, updates) =>
        set(s => ({
          fulfillmentOrders: s.fulfillmentOrders.map(fo =>
            fo.id === id ? { ...fo, ...updates, updatedAt: new Date().toISOString() } : fo
          ),
        })),

      // Demo reset
      resetDemoData: () =>
        set({
          quotations: QUOTATIONS,
          approvalRequests: APPROVAL_REQUESTS,
          negotiations: NEGOTIATIONS,
          fulfillmentOrders: FULFILLMENT_ORDERS,
          invoices: INVOICES,
          subscriptions: SUBSCRIPTIONS,
          dealHealthFlags: DEAL_HEALTH_FLAGS,
          auditEvents: AUDIT_EVENTS,
          notifications: NOTIFICATIONS,
          activityFeed: ACTIVITY_FEED,
          inventory: INVENTORY,
          warehouses: WAREHOUSES,
        }),
    }),
    {
      name: 'dealflow360-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        quotations: state.quotations,
        approvalRequests: state.approvalRequests,
        negotiations: state.negotiations,
        invoices: state.invoices,
        subscriptions: state.subscriptions,
        fulfillmentOrders: state.fulfillmentOrders,
        warehouses: state.warehouses,
        inventory: state.inventory,
      }),
    }
  )
);
