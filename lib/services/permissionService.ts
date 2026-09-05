// ============================================================
// DealFlow360 — Role-Based Access Control (RBAC) & Permission Service
// Pure business logic — implements the official Authorization Matrix
// ============================================================

import type { UserRole, ApprovalRequest, Quotation } from '@/lib/types';

export type Permission =
  // ─── Sales Rep Permissions ───
  | 'CREATE_QUOTE'
  | 'EDIT_QUOTE'
  | 'ADD_PRODUCT_TO_QUOTE'
  | 'CHANGE_QUANTITY'
  | 'APPLY_DISCOUNT'
  | 'ADD_UPSELL'
  | 'SUBMIT_QUOTE'
  | 'VIEW_APPROVAL_STATUS'
  | 'VIEW_FULFILLMENT'
  | 'RESPOND_TO_NEGOTIATION'

  // ─── Sales Manager Permissions ───
  | 'VIEW_QUOTES_FOR_APPROVAL'
  | 'APPROVE_QUOTE'
  | 'REJECT_QUOTE'
  | 'RETURN_QUOTE'
  | 'CONFIGURE_DISCOUNT_TIERS'
  | 'CONFIGURE_APPROVAL_CHAIN'
  | 'VIEW_DEAL_HEALTH'
  | 'VIEW_ANOMALIES'

  // ─── Finance / Operations Permissions ───
  | 'SECOND_LEVEL_APPROVAL'
  | 'VIEW_APPROVED_ORDERS'
  | 'VIEW_WAREHOUSE_STOCK'
  | 'VIEW_WAREHOUSE_SPLIT'
  | 'ACCEPT_WAREHOUSE_SPLIT'
  | 'OVERRIDE_WAREHOUSE_SPLIT'
  | 'MANAGE_FULFILLMENT'
  | 'MANAGE_BACKORDER'
  | 'CONSOLIDATE_BACKORDER'
  | 'RECONCILE_RECURRING_BILLING'
  | 'RECONCILE_CREDIT_NOTES'

  // ─── Customer Permissions ───
  | 'VIEW_OWN_QUOTE'
  | 'VIEW_OWN_QUOTE_STATUS'
  | 'COMMENT_ON_QUOTE_LINE'
  | 'REQUEST_CHANGE'
  | 'COUNTER_DISCOUNT'
  | 'SUBMIT_NEGOTIATION'
  | 'CONFIRM_QUOTE'

  // ─── Admin Permissions ───
  | 'MANAGE_PRODUCTS'
  | 'MANAGE_PRICE_LISTS'
  | 'MANAGE_DISCOUNT_RULES'
  | 'MANAGE_APPROVAL_CHAINS'
  | 'MANAGE_WAREHOUSES'
  | 'MANAGE_STOCK_RULES'
  | 'MANAGE_SUBSCRIPTION_PLANS'
  | 'MANAGE_UPSELL_RULES'
  | 'VIEW_PLATFORM_ANALYTICS'
  | 'EXPORT_REPORTS';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SALES_REP: [
    'CREATE_QUOTE',
    'EDIT_QUOTE',
    'ADD_PRODUCT_TO_QUOTE',
    'CHANGE_QUANTITY',
    'APPLY_DISCOUNT',
    'ADD_UPSELL',
    'SUBMIT_QUOTE',
    'VIEW_APPROVAL_STATUS',
    'VIEW_FULFILLMENT',
    'RESPOND_TO_NEGOTIATION',
  ],

  SALES_MANAGER: [
    'VIEW_QUOTES_FOR_APPROVAL',
    'APPROVE_QUOTE',
    'REJECT_QUOTE',
    'RETURN_QUOTE',
    'CONFIGURE_DISCOUNT_TIERS',
    'CONFIGURE_APPROVAL_CHAIN',
    'VIEW_DEAL_HEALTH',
    'VIEW_ANOMALIES',
    'VIEW_APPROVAL_STATUS',
    'RESPOND_TO_NEGOTIATION',
  ],

  FINANCE: [
    'SECOND_LEVEL_APPROVAL',
    'APPROVE_QUOTE',
    'REJECT_QUOTE',
    'RETURN_QUOTE',
    'VIEW_APPROVED_ORDERS',
    'VIEW_WAREHOUSE_STOCK',
    'VIEW_WAREHOUSE_SPLIT',
    'ACCEPT_WAREHOUSE_SPLIT',
    'OVERRIDE_WAREHOUSE_SPLIT',
    'MANAGE_FULFILLMENT',
    'MANAGE_BACKORDER',
    'CONSOLIDATE_BACKORDER',
    'RECONCILE_RECURRING_BILLING',
    'RECONCILE_CREDIT_NOTES',
    'VIEW_APPROVAL_STATUS',
  ],

  CUSTOMER: [
    'VIEW_OWN_QUOTE',
    'VIEW_OWN_QUOTE_STATUS',
    'COMMENT_ON_QUOTE_LINE',
    'REQUEST_CHANGE',
    'COUNTER_DISCOUNT',
    'SUBMIT_NEGOTIATION',
    'CONFIRM_QUOTE',
  ],

  ADMIN: [
    'MANAGE_PRODUCTS',
    'MANAGE_PRICE_LISTS',
    'MANAGE_DISCOUNT_RULES',
    'MANAGE_APPROVAL_CHAINS',
    'MANAGE_WAREHOUSES',
    'MANAGE_STOCK_RULES',
    'MANAGE_SUBSCRIPTION_PLANS',
    'MANAGE_UPSELL_RULES',
    'VIEW_PLATFORM_ANALYTICS',
    'EXPORT_REPORTS',
    // Admin has superuser access to view and assist
    'VIEW_APPROVAL_STATUS',
    'VIEW_DEAL_HEALTH',
    'VIEW_ANOMALIES',
  ],
};

/**
 * Check whether a user role has a specific permission.
 */
export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check whether a user can approve/reject/return a quotation request.
 * Enforces:
 * 1. Sales Rep cannot approve their own quotation.
 * 2. Sales Manager is the 1st level approver.
 * 3. Finance is the 2nd level approver (required for HIGH risk).
 * 4. Admin can assist/audit if explicitly needed.
 */
export function canApproveQuotation(
  approver: { id: string; role: UserRole },
  req: ApprovalRequest,
  assignedToId?: string
): { allowed: boolean; reason?: string } {
  // Rule 1: Cannot self-approve
  if (approver.id && assignedToId && approver.id === assignedToId) {
    return {
      allowed: false,
      reason: 'Sales Representatives cannot approve their own quotation submissions.',
    };
  }

  // Rule 2: Sales Reps have no approval authorization
  if (approver.role === 'SALES_REP') {
    return {
      allowed: false,
      reason: 'Sales Representatives are not authorized to approve quotations.',
    };
  }

  // Rule 3: Customer cannot approve internal quotes
  if (approver.role === 'CUSTOMER') {
    return {
      allowed: false,
      reason: 'Customer portal users cannot approve internal discount workflows.',
    };
  }

  // Rule 4: Stage verification
  if (req.stage === 'Sales Manager') {
    if (approver.role === 'SALES_MANAGER' || approver.role === 'ADMIN') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'This quotation is currently at Step 1 (Sales Manager approval). Finance signs off after Manager review.',
    };
  }

  if (req.stage === 'Finance') {
    if (approver.role === 'FINANCE' || approver.role === 'ADMIN') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'This quotation requires Step 2 (Finance / Operations second-level approval).',
    };
  }

  return { allowed: true };
}

/**
 * Check whether a user can execute fulfillment management actions
 * (Accept split, manual override, consolidate backorders).
 */
export function canManageFulfillment(role: UserRole | undefined | null): {
  allowed: boolean;
  reason?: string;
} {
  if (role === 'FINANCE' || role === 'ADMIN') {
    return { allowed: true };
  }

  if (role === 'SALES_REP') {
    return {
      allowed: false,
      reason: 'Sales Representatives have read-only tracking access to fulfillment and cannot alter warehouse allocations.',
    };
  }

  if (role === 'SALES_MANAGER') {
    return {
      allowed: false,
      reason: 'Sales Managers monitor deal risk but do not control operational warehouse split decisions.',
    };
  }

  return {
    allowed: false,
    reason: 'Only Finance / Operations users have authority to manage warehouse fulfillment allocations.',
  };
}

/**
 * Check whether a user can create a quotation.
 */
export function canCreateQuotation(role: UserRole | undefined | null): {
  allowed: boolean;
  reason?: string;
} {
  if (role === 'SALES_REP' || role === 'ADMIN') {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: 'Quotation creation is restricted to Sales Representatives.',
  };
}

/**
 * Check whether a user can configure backend settings (products, warehouses, price lists).
 */
export function canConfigureAdmin(role: UserRole | undefined | null): {
  allowed: boolean;
  reason?: string;
} {
  if (role === 'ADMIN') {
    return { allowed: true };
  }
  if (role === 'SALES_MANAGER') {
    return {
      allowed: true, // Sales manager can configure discount tiers and approval chains
      reason: 'Sales Manager has restricted access to discount tiers & approval chains.',
    };
  }
  return {
    allowed: false,
    reason: 'Backend administration and catalog configuration is restricted to Admins.',
  };
}

/**
 * Check whether a user can perform product catalog CRUD operations (Add, Edit, Delete).
 * Restricts CRUD strictly to ADMIN role.
 */
export function canManageProductCatalog(role: UserRole | undefined | null): {
  allowed: boolean;
  reason?: string;
} {
  if (role === 'ADMIN') {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: 'Product catalog CRUD configuration (Add / Edit / Delete) is restricted strictly to Platform Admin role. Other roles have read-only catalog access.',
  };
}
