// ============================================================
// DealFlow360 — Complete In-Memory Mock Data
// All demo data is seeded here for hackathon reliability
// ============================================================

import type {
  User, Customer, Product, ProductCategory, PriceList, TierPolicy,
  Quotation, QuotationItem, ApprovalRequest, ApprovalAction,
  NegotiationRequest, Warehouse, InventoryItem, FulfillmentOrder,
  Invoice, Payment, Subscription, DealHealthFlag, AuditEvent, Notification,
  ActivityItem,
} from '@/lib/types';

// ─── Users ────────────────────────────────────────────────────
export const USERS: User[] = [
  { id: 'user-1', email: 'admin@dealflow360.demo', name: 'Alex Admin', role: 'ADMIN', avatarInitials: 'AA', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'user-2', email: 'sales@dealflow360.demo', name: 'Jasmine Rao', role: 'SALES_REP', avatarInitials: 'JR', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'user-3', email: 'manager@dealflow360.demo', name: 'Mihail Shah', role: 'SALES_MANAGER', avatarInitials: 'MS', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'user-4', email: 'finance@dealflow360.demo', name: 'Riya Iyer', role: 'FINANCE', avatarInitials: 'RI', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'user-5', email: 'customer@dealflow360.demo', name: 'Tom Acme', role: 'CUSTOMER', avatarInitials: 'TA', company: 'Acme Corp', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'user-6', email: 'customer.bronze@dealflow360.demo', name: 'Priya Zen', role: 'CUSTOMER', avatarInitials: 'PZ', company: 'Zenith Co', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'user-7', email: 'customer.silver@dealflow360.demo', name: 'Sarah Bet', role: 'CUSTOMER', avatarInitials: 'SB', company: 'Beta Industries', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'user-8', email: 'customer.platinum@dealflow360.demo', name: 'Carlos Del', role: 'CUSTOMER', avatarInitials: 'CD', company: 'Delta LLC', createdAt: '2026-01-01T00:00:00Z' },
];

export const DEMO_PASSWORDS: Record<string, string> = {
  'admin@dealflow360.demo': 'demo1234',
  'sales@dealflow360.demo': 'demo1234',
  'manager@dealflow360.demo': 'demo1234',
  'finance@dealflow360.demo': 'demo1234',
  'customer@dealflow360.demo': 'demo1234',
  'customer.bronze@dealflow360.demo': 'demo1234',
  'customer.silver@dealflow360.demo': 'demo1234',
  'customer.platinum@dealflow360.demo': 'demo1234',
};

// ─── Customer Tiers ───────────────────────────────────────────
export const TIER_POLICIES: TierPolicy[] = [
  { tier: 'Bronze', discountCeiling: 5 },
  { tier: 'Silver', discountCeiling: 10 },
  { tier: 'Gold', discountCeiling: 15 },
  { tier: 'Platinum', discountCeiling: 25 },
];

// ─── Product Categories ───────────────────────────────────────
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'cat-1', name: 'Hardware', discountCeiling: 15 },
  { id: 'cat-2', name: 'Services', discountCeiling: 10 },
  { id: 'cat-3', name: 'Software', discountCeiling: 12 },
  { id: 'cat-4', name: 'Subscription', discountCeiling: 20 },
];

// ─── Products ─────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  {
    id: 'prod-1', name: 'Laptop Pro 14', categoryId: 'cat-1', sku: 'LAP-PRO-14',
    description: 'High-performance business laptop with 14" display, Intel Core i7, 16GB RAM.',
    basePrice: 1200, unit: 'Each', taxPercent: 15, type: 'Hardware',
    isSubscription: false, status: 'Active', quantityOnHand: 50,
    variants: [
      { id: 'var-1a', attribute: 'Color', value: 'Black', extraPrice: 0, sku: 'LAP-PRO-14-BLK' },
      { id: 'var-1b', attribute: 'Color', value: 'Blue', extraPrice: 30, sku: 'LAP-PRO-14-BLU' },
      { id: 'var-1c', attribute: 'RAM', value: '16GB', extraPrice: 0, sku: 'LAP-PRO-14-16G' },
      { id: 'var-1d', attribute: 'RAM', value: '32GB', extraPrice: 200, sku: 'LAP-PRO-14-32G' },
    ],
  },
  {
    id: 'prod-2', name: 'Onsite Setup Service', categoryId: 'cat-2', sku: 'SVC-SETUP-ONS',
    description: 'Professional on-site hardware setup and configuration service.',
    basePrice: 450, unit: 'Each', taxPercent: 10, type: 'Services',
    isSubscription: false, status: 'Active', quantityOnHand: 999,
    variants: [],
  },
  {
    id: 'prod-3', name: 'Extended Warranty', categoryId: 'cat-3', sku: 'SW-EXT-WARR-2',
    description: '2-year extended warranty coverage for hardware products.',
    basePrice: 180, unit: 'Each', taxPercent: 10, type: 'Software',
    isSubscription: false, status: 'Active', quantityOnHand: 999,
    variants: [],
  },
  {
    id: 'prod-4', name: 'Wireless Mouse', categoryId: 'cat-1', sku: 'HW-MOUSE-WL',
    description: 'Ergonomic wireless mouse with 3-year battery life.',
    basePrice: 65, unit: 'Each', taxPercent: 15, type: 'Hardware',
    isSubscription: false, status: 'Active', quantityOnHand: 200,
    variants: [
      { id: 'var-4a', attribute: 'Color', value: 'Black', extraPrice: 0, sku: 'HW-MOUSE-BLK' },
      { id: 'var-4b', attribute: 'Color', value: 'White', extraPrice: 5, sku: 'HW-MOUSE-WHT' },
    ],
  },
  {
    id: 'prod-5', name: 'Docking Station', categoryId: 'cat-1', sku: 'HW-DOCK-USB4',
    description: 'USB4 docking station with dual 4K display support.',
    basePrice: 320, unit: 'Each', taxPercent: 15, type: 'Hardware',
    isSubscription: false, status: 'Active', quantityOnHand: 75,
    variants: [],
  },
  {
    id: 'prod-6', name: 'Care Plan 2yr', categoryId: 'cat-4', sku: 'SUB-CARE-2YR',
    description: 'Comprehensive 2-year care plan with priority support, remote diagnostics, and on-site repair.',
    basePrice: 46, unit: 'Month', taxPercent: 10, type: 'Subscription',
    isSubscription: true, recurringCycle: 'Monthly', recurringPrice: 46, status: 'Active',
    quantityOnHand: 999, variants: [],
  },
  {
    id: 'prod-7', name: 'Support SLA', categoryId: 'cat-4', sku: 'SUB-SLA-PRO',
    description: 'Professional SLA with 4-hour response time and dedicated account manager.',
    basePrice: 120, unit: 'Month', taxPercent: 10, type: 'Subscription',
    isSubscription: true, recurringCycle: 'Monthly', recurringPrice: 120, status: 'Active',
    quantityOnHand: 999, variants: [],
  },
];

// ─── Price Lists ───────────────────────────────────────────────
export const PRICE_LISTS: PriceList[] = [
  {
    id: 'pl-1', name: 'Enterprise USD', tier: 'Gold', currency: 'USD',
    rule: 'no_adjustment',
    items: [
      { productId: 'prod-1', price: 1200, currency: 'USD' },
      { productId: 'prod-2', price: 450, currency: 'USD' },
      { productId: 'prod-3', price: 180, currency: 'USD' },
      { productId: 'prod-4', price: 65, currency: 'USD' },
      { productId: 'prod-5', price: 320, currency: 'USD' },
      { productId: 'prod-6', price: 46, currency: 'USD' },
      { productId: 'prod-7', price: 120, currency: 'USD' },
    ],
  },
  {
    id: 'pl-2', name: 'Standard USD', tier: 'Silver', currency: 'USD',
    rule: 'no_adjustment',
    items: [
      { productId: 'prod-1', price: 1250, currency: 'USD' },
      { productId: 'prod-2', price: 480, currency: 'USD' },
      { productId: 'prod-3', price: 190, currency: 'USD' },
      { productId: 'prod-4', price: 70, currency: 'USD' },
      { productId: 'prod-5', price: 340, currency: 'USD' },
      { productId: 'prod-6', price: 50, currency: 'USD' },
      { productId: 'prod-7', price: 130, currency: 'USD' },
    ],
  },
  {
    id: 'pl-3', name: 'Bronze USD', tier: 'Bronze', currency: 'USD',
    rule: 'no_adjustment',
    items: [
      { productId: 'prod-1', price: 1300, currency: 'USD' },
      { productId: 'prod-2', price: 500, currency: 'USD' },
      { productId: 'prod-3', price: 200, currency: 'USD' },
      { productId: 'prod-4', price: 75, currency: 'USD' },
      { productId: 'prod-5', price: 360, currency: 'USD' },
      { productId: 'prod-6', price: 55, currency: 'USD' },
      { productId: 'prod-7', price: 140, currency: 'USD' },
    ],
  },
];

// ─── Customers ────────────────────────────────────────────────
export const CUSTOMERS: Customer[] = [
  {
    id: 'cust-1', company: 'Acme Corp', contact: 'Tom Acme', email: 'tom@acmecorp.com',
    phone: '+1 (555) 010-2020', tier: 'Gold', currency: 'USD', priceListId: 'pl-1',
    paymentTerms: 'Net 30', createdAt: '2024-01-15', userId: 'user-5',
  },
  {
    id: 'cust-2', company: 'Beta Industries', contact: 'Sarah Bet', email: 'sarah@betaind.com',
    phone: '+1 (555) 020-3030', tier: 'Silver', currency: 'USD', priceListId: 'pl-2',
    paymentTerms: 'Net 45', createdAt: '2024-02-10',
  },
  {
    id: 'cust-3', company: 'Nova Retail', contact: 'James Nova', email: 'james@novaretail.com',
    phone: '+1 (555) 030-4040', tier: 'Gold', currency: 'USD', priceListId: 'pl-1',
    paymentTerms: 'Net 30', createdAt: '2024-03-05',
  },
  {
    id: 'cust-4', company: 'Zenith Co', contact: 'Priya Zen', email: 'priya@zenithco.com',
    phone: '+1 (555) 040-5050', tier: 'Bronze', currency: 'USD', priceListId: 'pl-3',
    paymentTerms: 'Net 60', createdAt: '2024-04-20',
  },
  {
    id: 'cust-5', company: 'Delta LLC', contact: 'Carlos Del', email: 'carlos@deltallc.com',
    phone: '+1 (555) 050-6060', tier: 'Platinum', currency: 'USD', priceListId: 'pl-1',
    paymentTerms: 'Net 15', createdAt: '2024-05-12',
  },
  {
    id: 'cust-6', company: 'Orion Ltd', contact: 'Mei Orion', email: 'mei@orionltd.com',
    phone: '+1 (555) 060-7070', tier: 'Silver', currency: 'EUR', priceListId: 'pl-2',
    paymentTerms: 'Net 30', createdAt: '2024-06-01',
  },
];

// ─── Warehouses & Inventory ────────────────────────────────────
export const WAREHOUSES: Warehouse[] = [
  { id: 'wh-1', name: 'Main Warehouse', location: 'Chicago, IL' },
  { id: 'wh-2', name: 'East Depot', location: 'Newark, NJ' },
  { id: 'wh-3', name: 'West Hub', location: 'Los Angeles, CA' },
];

export const INVENTORY: InventoryItem[] = [
  { id: 'inv-1', warehouseId: 'wh-1', warehouseName: 'Main Warehouse', productId: 'prod-1', productName: 'Laptop Pro 14', inStock: 40, reserved: 18, available: 22 },
  { id: 'inv-2', warehouseId: 'wh-2', warehouseName: 'East Depot', productId: 'prod-1', productName: 'Laptop Pro 14', inStock: 10, reserved: 6, available: 4 },
  { id: 'inv-3', warehouseId: 'wh-3', warehouseName: 'West Hub', productId: 'prod-1', productName: 'Laptop Pro 14', inStock: 15, reserved: 0, available: 15 },
  { id: 'inv-4', warehouseId: 'wh-1', warehouseName: 'Main Warehouse', productId: 'prod-4', productName: 'Wireless Mouse', inStock: 120, reserved: 20, available: 100 },
  { id: 'inv-5', warehouseId: 'wh-2', warehouseName: 'East Depot', productId: 'prod-4', productName: 'Wireless Mouse', inStock: 60, reserved: 5, available: 55 },
  { id: 'inv-6', warehouseId: 'wh-1', warehouseName: 'Main Warehouse', productId: 'prod-5', productName: 'Docking Station', inStock: 30, reserved: 8, available: 22 },
  { id: 'inv-7', warehouseId: 'wh-2', warehouseName: 'East Depot', productId: 'prod-5', productName: 'Docking Station', inStock: 15, reserved: 2, available: 13 },
];

// ─── Demo Quotations ──────────────────────────────────────────
// Q-1042: THE DEMO QUOTATION — Acme Corp, Gold tier, HIGH risk
const Q1042_ITEMS: QuotationItem[] = [
  {
    id: 'qi-1', productId: 'prod-1', productName: 'Laptop Pro 14',
    variantId: 'var-1a', variantLabel: 'Color: Black',
    quantity: 2, unitPrice: 1200, costPrice: 900, discount: 12,
    allowedDiscount: 15, // Gold(15%) vs Hardware(15%) → min = 15%
    taxPercent: 15, lineTotal: 2112, margin: 456,
    discountStatus: 'OK', discountDifference: -3,
    isSubscription: false,
  },
  {
    id: 'qi-2', productId: 'prod-2', productName: 'Onsite Setup Service',
    quantity: 1, unitPrice: 450, costPrice: 200, discount: 18,
    allowedDiscount: 10, // Gold(15%) vs Services(10%) → min = 10%
    taxPercent: 10, lineTotal: 407.55, margin: 119,
    discountStatus: 'OVER', discountDifference: 8,
    isSubscription: false,
  },
  {
    id: 'qi-3', productId: 'prod-3', productName: 'Extended Warranty',
    quantity: 2, unitPrice: 180, costPrice: 50, discount: 10,
    allowedDiscount: 12, // Gold(15%) vs Software(12%) → min = 12%
    taxPercent: 10, lineTotal: 356.4, margin: 234,
    discountStatus: 'OK', discountDifference: -2,
    isSubscription: false,
  },
  {
    id: 'qi-4', productId: 'prod-6', productName: 'Care Plan 2yr',
    quantity: 1, unitPrice: 46, costPrice: 12, discount: 0,
    allowedDiscount: 20,
    taxPercent: 10, lineTotal: 50.6, margin: 37.4,
    discountStatus: 'OK', discountDifference: -20,
    isSubscription: true, recurringCycle: 'Monthly', recurringPrice: 46,
  },
];

export const QUOTATIONS: Quotation[] = [
  {
    id: 'quot-1042', quoteNumber: 'Q-1042',
    customerId: 'cust-1', customerName: 'Acme Corp',
    priceListId: 'pl-1', currency: 'USD',
    stage: 'Confirmed',
    items: Q1042_ITEMS,
    subtotal: 3080, totalDiscount: 303.6, totalTax: 259.95,
    oneTimeTotal: 2876.55 + 259.95, recurringTotal: 50.6,
    blendedRisk: {
      riskScore: 76,
      riskLevel: 'HIGH',
      worstLine: 'Onsite Setup Service',
      violations: [
        'Onsite Setup Service: 18% discount exceeds 10% Services category limit by +8pt',
        'Blended average discount (10%) is above customer tier average',
      ],
      estimatedMargin: 846.4,
      estimatedMarginPercent: 26.2,
      requiresApproval: true,
      approvalLevel: 'SALES_MANAGER_AND_FINANCE',
      explanation: [
        'Laptop Pro 14: 12% / 15% limit → OK',
        'Onsite Setup Service: 18% / 10% limit → OVER (+8pt)',
        'Extended Warranty: 10% / 12% limit → OK',
        'Care Plan 2yr: 0% / 20% limit → OK',
        'Blended risk: HIGH — single critical violation detected',
      ],
    },
    assignedTo: 'Jasmine Rao', assignedToId: 'user-2',
    createdAt: '2026-08-18T09:15:00Z', updatedAt: '2026-08-23T14:30:00Z',
    notes: 'Priority customer. Setup service urgently needed before quarter end.',
  },
  {
    id: 'quot-1039', quoteNumber: 'Q-1039',
    customerId: 'cust-2', customerName: 'Beta Industries',
    priceListId: 'pl-2', currency: 'USD',
    stage: 'Pending Approval',
    items: [
      {
        id: 'qi-5', productId: 'prod-1', productName: 'Laptop Pro 14',
        quantity: 5, unitPrice: 1250, costPrice: 900, discount: 8,
        allowedDiscount: 10, taxPercent: 15, lineTotal: 5750, margin: 1750,
        discountStatus: 'OK', discountDifference: -2, isSubscription: false,
      },
      {
        id: 'qi-6', productId: 'prod-5', productName: 'Docking Station',
        quantity: 5, unitPrice: 340, costPrice: 180, discount: 14,
        allowedDiscount: 10, taxPercent: 15, lineTotal: 1462, margin: 525,
        discountStatus: 'OVER', discountDifference: 4, isSubscription: false,
      },
    ],
    subtotal: 7212, totalDiscount: 576.96, totalTax: 648.0,
    oneTimeTotal: 8496.0, recurringTotal: 0,
    blendedRisk: {
      riskScore: 54, riskLevel: 'MEDIUM',
      worstLine: 'Docking Station',
      violations: ['Docking Station: 14% discount exceeds 10% Silver tier limit by +4pt'],
      estimatedMargin: 2275, estimatedMarginPercent: 26.7,
      requiresApproval: true, approvalLevel: 'SALES_MANAGER',
      explanation: [
        'Laptop Pro 14: 8% / 10% limit → OK',
        'Docking Station: 14% / 10% limit → OVER (+4pt)',
        'Blended risk: MEDIUM',
      ],
    },
    assignedTo: 'Jasmine Rao', assignedToId: 'user-2',
    createdAt: '2026-08-20T11:00:00Z', updatedAt: '2026-08-21T09:00:00Z',
  },
  {
    id: 'quot-1035', quoteNumber: 'Q-1035',
    customerId: 'cust-3', customerName: 'Nova Retail',
    priceListId: 'pl-1', currency: 'USD',
    stage: 'Draft',
    items: [
      {
        id: 'qi-7', productId: 'prod-4', productName: 'Wireless Mouse',
        quantity: 20, unitPrice: 65, costPrice: 30, discount: 5,
        allowedDiscount: 15, taxPercent: 15, lineTotal: 1235, margin: 700,
        discountStatus: 'OK', discountDifference: -10, isSubscription: false,
      },
    ],
    subtotal: 1235, totalDiscount: 65, totalTax: 185.25,
    oneTimeTotal: 1420.25, recurringTotal: 0,
    blendedRisk: {
      riskScore: 12, riskLevel: 'LOW', worstLine: null, violations: [],
      estimatedMargin: 700, estimatedMarginPercent: 49.3,
      requiresApproval: false, approvalLevel: 'AUTO_APPROVED',
      explanation: ['All line discounts within limits', 'No violations detected'],
    },
    assignedTo: 'Jasmine Rao', assignedToId: 'user-2',
    createdAt: '2026-08-25T14:00:00Z', updatedAt: '2026-08-25T14:00:00Z',
  },
  {
    id: 'quot-1040', quoteNumber: 'Q-1040',
    customerId: 'cust-4', customerName: 'Zenith Co',
    priceListId: 'pl-3', currency: 'USD',
    stage: 'Draft',
    items: [
      {
        id: 'qi-8', productId: 'prod-1', productName: 'Laptop Pro 14',
        quantity: 3, unitPrice: 1300, costPrice: 900, discount: 4,
        allowedDiscount: 5, taxPercent: 15, lineTotal: 3744, margin: 1200,
        discountStatus: 'OK', discountDifference: -1, isSubscription: false,
      },
    ],
    subtotal: 3744, totalDiscount: 150, totalTax: 561.6,
    oneTimeTotal: 4305.6, recurringTotal: 0,
    blendedRisk: {
      riskScore: 8, riskLevel: 'LOW', worstLine: null, violations: [],
      estimatedMargin: 1200, estimatedMarginPercent: 27.8,
      requiresApproval: false, approvalLevel: 'AUTO_APPROVED',
      explanation: ['All line discounts within Bronze tier limits'],
    },
    assignedTo: 'Jasmine Rao', assignedToId: 'user-2',
    createdAt: '2026-08-14T10:00:00Z', updatedAt: '2026-08-14T10:00:00Z',
    notes: 'Idle for 9 days',
  },
  {
    id: 'quot-1041', quoteNumber: 'Q-1041',
    customerId: 'cust-5', customerName: 'Delta LLC',
    priceListId: 'pl-1', currency: 'USD',
    stage: 'Pending Approval',
    items: [
      {
        id: 'qi-9', productId: 'prod-1', productName: 'Laptop Pro 14',
        quantity: 10, unitPrice: 1200, costPrice: 900, discount: 22,
        allowedDiscount: 15, taxPercent: 15, lineTotal: 9360, margin: 2220,
        discountStatus: 'OVER', discountDifference: 7, isSubscription: false,
      },
    ],
    subtotal: 9360, totalDiscount: 2640, totalTax: 1404,
    oneTimeTotal: 10764, recurringTotal: 0,
    blendedRisk: {
      riskScore: 88, riskLevel: 'HIGH', worstLine: 'Laptop Pro 14',
      violations: ['Laptop Pro 14: 22% discount exceeds 15% Hardware limit by +7pt', '22% vs avg rep discount of 8% — anomaly detected'],
      estimatedMargin: 2220, estimatedMarginPercent: 20.6,
      requiresApproval: true, approvalLevel: 'SALES_MANAGER_AND_FINANCE',
      explanation: ['Laptop Pro 14: 22% / 15% limit → OVER (+7pt)', 'Discount anomaly: 22% vs average 8% for this rep'],
    },
    assignedTo: 'Jasmine Rao', assignedToId: 'user-2',
    createdAt: '2026-08-22T08:00:00Z', updatedAt: '2026-08-23T10:00:00Z',
    notes: 'Customer requested extra discount. Under escalation.',
  },
];

// ─── Approval Requests ────────────────────────────────────────
export const APPROVAL_REQUESTS: ApprovalRequest[] = [
  {
    id: 'apr-1', quotationId: 'quot-1042', quotationNumber: 'Q-1042',
    customerId: 'cust-1', customerName: 'Acme Corp',
    stage: 'Completed', status: 'Confirmed', riskLevel: 'HIGH', riskScore: 76,
    actions: [
      { id: 'act-1', approvalRequestId: 'apr-1', userId: 'user-2', userName: 'Jasmine Rao', userRole: 'SALES_REP', action: 'Submitted', comment: 'Initial submission — setup service urgently required.', timestamp: '2026-08-18T09:30:00Z' },
      { id: 'act-2', approvalRequestId: 'apr-1', userId: 'user-3', userName: 'Mihail Shah', userRole: 'SALES_MANAGER', action: 'Returned', reason: 'Justification needed for Setup Service discount', comment: 'Please provide business justification for 18% discount on setup service.', timestamp: '2026-08-21T14:15:00Z' },
      { id: 'act-3', approvalRequestId: 'apr-1', userId: 'user-2', userName: 'Jasmine Rao', userRole: 'SALES_REP', action: 'Resubmitted', comment: 'Setup discount justified: strategic account, competitive pressure from Vendor X. Margin impact acceptable per Q3 guidelines.', timestamp: '2026-08-22T09:00:00Z' },
      { id: 'act-4', approvalRequestId: 'apr-1', userId: 'user-3', userName: 'Mihail Shah', userRole: 'SALES_MANAGER', action: 'Approved', comment: 'Justification accepted. Strategic account value outweighs margin impact.', timestamp: '2026-08-22T16:00:00Z' },
      { id: 'act-5', approvalRequestId: 'apr-1', userId: 'user-4', userName: 'Riya Iyer', userRole: 'FINANCE', action: 'Confirmed', comment: 'Financial review complete. Deal value acceptable.', timestamp: '2026-08-23T11:30:00Z' },
    ],
    createdAt: '2026-08-18T09:30:00Z', updatedAt: '2026-08-23T11:30:00Z',
  },
  {
    id: 'apr-2', quotationId: 'quot-1039', quotationNumber: 'Q-1039',
    customerId: 'cust-2', customerName: 'Beta Industries',
    stage: 'Sales Manager', status: 'Pending', riskLevel: 'MEDIUM', riskScore: 54,
    actions: [
      { id: 'act-6', approvalRequestId: 'apr-2', userId: 'user-2', userName: 'Jasmine Rao', userRole: 'SALES_REP', action: 'Submitted', comment: 'Beta Industries renewal. Docking station discount to close deal this quarter.', timestamp: '2026-08-21T10:00:00Z' },
    ],
    createdAt: '2026-08-21T10:00:00Z', updatedAt: '2026-08-21T10:00:00Z',
  },
  {
    id: 'apr-3', quotationId: 'quot-1041', quotationNumber: 'Q-1041',
    customerId: 'cust-5', customerName: 'Delta LLC',
    stage: 'Finance', status: 'Pending', riskLevel: 'HIGH', riskScore: 88,
    actions: [
      { id: 'act-7', approvalRequestId: 'apr-3', userId: 'user-2', userName: 'Jasmine Rao', userRole: 'SALES_REP', action: 'Submitted', comment: 'Delta LLC strategic deal. Large volume justifies extra discount.', timestamp: '2026-08-23T08:30:00Z' },
      { id: 'act-8', approvalRequestId: 'apr-3', userId: 'user-3', userName: 'Mihail Shah', userRole: 'SALES_MANAGER', action: 'Approved', comment: 'Approved pending Finance review. Delta is strategic.', timestamp: '2026-08-24T10:00:00Z' },
    ],
    createdAt: '2026-08-23T08:30:00Z', updatedAt: '2026-08-24T10:00:00Z',
  },
];

// ─── Negotiations ─────────────────────────────────────────────
export const NEGOTIATIONS: NegotiationRequest[] = [
  {
    id: 'neg-1', quotationId: 'quot-1042', quotationNumber: 'Q-1042',
    customerId: 'cust-1', customerName: 'Acme Corp',
    status: 'Resolved',
    requestedChanges: [
      { lineId: 'qi-3', productName: 'Extended Warranty', requestedDiscount: 15, comment: 'Can this be 15% off instead of 10%?' },
      { lineId: 'qi-2', productName: 'Onsite Setup Service', requestedDeliveryDate: '2026-10-01', comment: 'Can we push this to next month?' },
    ],
    messages: [
      { id: 'msg-1', negotiationId: 'neg-1', senderId: 'user-5', senderName: 'Tom Acme', senderRole: 'CUSTOMER', message: 'Can we get a better discount on the warranty and push the setup to October?', timestamp: '2026-08-24T10:00:00Z' },
      { id: 'msg-2', negotiationId: 'neg-1', senderId: 'user-2', senderName: 'Jasmine Rao', senderRole: 'SALES_REP', message: 'Reviewing your request now, Tom. Will get back to you shortly.', timestamp: '2026-08-24T11:30:00Z' },
      { id: 'msg-3', negotiationId: 'neg-1', senderId: 'user-2', senderName: 'Jasmine Rao', senderRole: 'SALES_REP', message: 'We can offer 12% on the warranty and move setup to Oct 1st. Does that work?', timestamp: '2026-08-24T15:00:00Z' },
      { id: 'msg-4', negotiationId: 'neg-1', senderId: 'user-5', senderName: 'Tom Acme', senderRole: 'CUSTOMER', message: 'Works for us. Thank you!', timestamp: '2026-08-25T09:00:00Z' },
    ],
    triggeredReapproval: false,
    createdAt: '2026-08-24T10:00:00Z', updatedAt: '2026-08-25T09:00:00Z',
  },
];

// ─── Fulfillment ──────────────────────────────────────────────
export const FULFILLMENT_ORDERS: FulfillmentOrder[] = [
  {
    id: 'ful-1042', quotationId: 'quot-1042', quotationNumber: 'Q-1042',
    customerId: 'cust-1', customerName: 'Acme Corp',
    status: 'Allocated',
    allocations: [
      { warehouseId: 'wh-1', warehouseName: 'Main Warehouse', productId: 'prod-1', productName: 'Laptop Pro 14', requestedQty: 2, allocatedQty: 2, shippedQty: 2, backorderQty: 0 },
      { warehouseId: 'wh-1', warehouseName: 'Main Warehouse', productId: 'prod-5', productName: 'Docking Station', requestedQty: 2, allocatedQty: 2, shippedQty: 2, backorderQty: 0 },
    ],
    shipments: [
      {
        id: 'ship-1', orderId: 'ful-1042', warehouseId: 'wh-1', warehouseName: 'Main Warehouse',
        items: [
          { productId: 'prod-1', productName: 'Laptop Pro 14', quantity: 2 },
          { productId: 'prod-5', productName: 'Docking Station', quantity: 2 },
        ],
        shippedAt: '2026-08-25T08:00:00Z', estimatedDelivery: '2026-08-27T17:00:00Z',
        shippingCost: 42, status: 'Delivered',
      },
    ],
    createdAt: '2026-08-23T12:00:00Z', updatedAt: '2026-08-25T08:00:00Z',
  },
];

// ─── Invoices ─────────────────────────────────────────────────
export const INVOICES: Invoice[] = [
  {
    id: 'inv-1042a', invoiceNumber: 'INV-1042',
    quotationId: 'quot-1042', quotationNumber: 'Q-1042',
    customerId: 'cust-1', customerName: 'Acme Corp',
    type: 'One-Time',
    items: [
      { id: 'ii-1', productId: 'prod-1', productName: 'Laptop Pro 14', orderedQty: 2, shippedQty: 2, billedQty: 2, unitPrice: 1200, discount: 12, taxPercent: 15, lineTotal: 2112 },
      { id: 'ii-2', productId: 'prod-3', productName: 'Extended Warranty', orderedQty: 2, shippedQty: 2, billedQty: 2, unitPrice: 180, discount: 10, taxPercent: 10, lineTotal: 356.4 },
    ],
    subtotal: 2727.6, discount: 327.6, tax: 409.14, total: 3136.74,
    status: 'Paid', dueDate: '2026-09-22', paidAmount: 3136.74,
    payments: [
      { id: 'pay-1', invoiceId: 'inv-1042a', amount: 3136.74, currency: 'USD', paymentDate: '2026-09-10', method: 'Bank Transfer', reference: 'BT-2026-1042', status: 'Confirmed' },
    ],
    createdAt: '2026-08-25T10:00:00Z', updatedAt: '2026-09-10T15:00:00Z',
    deliveryReconciled: true,
  },
  {
    id: 'inv-1042b', invoiceNumber: 'INV-1043',
    quotationId: 'quot-1042', quotationNumber: 'Q-1042',
    customerId: 'cust-1', customerName: 'Acme Corp',
    type: 'Recurring',
    items: [
      { id: 'ii-3', productId: 'prod-6', productName: 'Care Plan 2yr', orderedQty: 1, shippedQty: 1, billedQty: 1, unitPrice: 46, discount: 0, taxPercent: 10, lineTotal: 50.6 },
    ],
    subtotal: 46, discount: 0, tax: 4.6, total: 50.6,
    status: 'Paid', dueDate: '2026-09-15', paidAmount: 50.6,
    payments: [
      { id: 'pay-2', invoiceId: 'inv-1042b', amount: 50.6, currency: 'USD', paymentDate: '2026-09-15', method: 'Credit Card', reference: 'CC-AUTO-2026-09', status: 'Confirmed' },
    ],
    createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-15T00:00:00Z',
    deliveryReconciled: true,
  },
  {
    id: 'inv-1039a', invoiceNumber: 'INV-1044',
    quotationId: 'quot-1039', quotationNumber: 'Q-1039',
    customerId: 'cust-2', customerName: 'Beta Industries',
    type: 'One-Time',
    items: [
      { id: 'ii-4', productId: 'prod-1', productName: 'Laptop Pro 14', orderedQty: 5, shippedQty: 0, billedQty: 0, unitPrice: 1250, discount: 8, taxPercent: 15, lineTotal: 0 },
    ],
    subtotal: 0, discount: 0, tax: 0, total: 0,
    status: 'Draft', dueDate: '2026-10-01', paidAmount: 0,
    payments: [],
    createdAt: '2026-08-22T10:00:00Z', updatedAt: '2026-08-22T10:00:00Z',
    deliveryReconciled: false, reconciliationNote: 'Awaiting shipment',
  },
  {
    id: 'inv-1041a', invoiceNumber: 'INV-1045',
    quotationId: 'quot-1041', quotationNumber: 'Q-1041',
    customerId: 'cust-5', customerName: 'Delta LLC',
    type: 'One-Time',
    items: [
      { id: 'ii-5', productId: 'prod-1', productName: 'Laptop Pro 14', orderedQty: 10, shippedQty: 0, billedQty: 0, unitPrice: 1200, discount: 22, taxPercent: 15, lineTotal: 0 },
    ],
    subtotal: 0, discount: 0, tax: 0, total: 0,
    status: 'Draft', dueDate: '2026-10-15', paidAmount: 0,
    payments: [],
    createdAt: '2026-08-25T09:00:00Z', updatedAt: '2026-08-25T09:00:00Z',
    deliveryReconciled: false, reconciliationNote: 'Pending approval',
  },
];

// ─── Subscriptions ────────────────────────────────────────────
export const SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1', quotationId: 'quot-1042', quotationNumber: 'Q-1042',
    customerId: 'cust-1', customerName: 'Acme Corp',
    plan: 'Care Plan 2yr', status: 'Active', cycle: 'Monthly',
    currentAmount: 50.6, nextBillDate: '2026-10-01', startDate: '2026-09-01',
    items: [
      { productId: 'prod-6', productName: 'Care Plan 2yr', recurringPrice: 46, cycle: 'Monthly', discount: 0, tax: 4.6 },
    ],
    billingHistory: [INVOICES[1]],
    prorationHistory: [],
    createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-15T00:00:00Z',
  },
  {
    id: 'sub-2', quotationId: 'quot-1039', quotationNumber: 'Q-1039',
    customerId: 'cust-2', customerName: 'Beta Industries',
    plan: 'Support SLA', status: 'Active', cycle: 'Monthly',
    currentAmount: 132, nextBillDate: '2026-11-01', startDate: '2026-08-01',
    items: [
      { productId: 'prod-7', productName: 'Support SLA', recurringPrice: 120, cycle: 'Monthly', discount: 0, tax: 12 },
    ],
    billingHistory: [],
    prorationHistory: [],
    createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'sub-3', quotationId: 'quot-1035', quotationNumber: 'Q-1035',
    customerId: 'cust-3', customerName: 'Nova Retail',
    plan: 'Care Plan 2yr', status: 'Paused', cycle: 'Monthly',
    currentAmount: 50.6, nextBillDate: '2026-11-01', startDate: '2026-06-01',
    items: [
      { productId: 'prod-6', productName: 'Care Plan 2yr', recurringPrice: 46, cycle: 'Monthly', discount: 0, tax: 4.6 },
    ],
    billingHistory: [],
    prorationHistory: [
      { id: 'pror-1', subscriptionId: 'sub-3', previousAmount: 50.6, newAmount: 0, remainingDays: 15, prorationAmount: -25.3, effectiveDate: '2026-09-01', reason: 'Plan paused by customer request' },
    ],
    createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
  },
];

// ─── Deal Health Flags ─────────────────────────────────────────
export const DEAL_HEALTH_FLAGS: DealHealthFlag[] = [
  {
    id: 'dhf-1', quotationId: 'quot-1040', quotationNumber: 'Q-1040',
    customerName: 'Zenith Co', type: 'Stalled', severity: 'MEDIUM',
    description: 'Quote idle for 9 days without activity',
    detectedAt: '2026-08-23T00:00:00Z', actionTaken: 'Nudge sent to Jasmine Rao',
  },
  {
    id: 'dhf-2', quotationId: 'quot-1041', quotationNumber: 'Q-1041',
    customerName: 'Delta LLC', type: 'Discount Anomaly', severity: 'HIGH',
    description: 'Discount 22% vs rep average 8% — 14pt anomaly detected',
    detectedAt: '2026-08-23T08:00:00Z', actionTaken: 'Escalated to Sales Manager',
  },
  {
    id: 'dhf-3', quotationId: 'quot-1039', quotationNumber: 'Q-1039',
    customerName: 'Beta Industries', type: 'Delivery Slippage', severity: 'MEDIUM',
    description: 'Promise delivery date at risk — approval pending 4 days',
    detectedAt: '2026-08-25T00:00:00Z',
  },
  {
    id: 'dhf-4', quotationId: 'quot-1035', quotationNumber: 'Q-1035',
    customerName: 'Nova Retail', type: 'Stalled', severity: 'LOW',
    description: 'Draft quote inactive for 7 days',
    detectedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'dhf-5', quotationId: 'quot-1042', quotationNumber: 'Q-1042',
    customerName: 'Acme Corp', type: 'Inventory Risk', severity: 'LOW',
    description: 'East Depot low on Docking Station stock (backorder: 1 unit)',
    detectedAt: '2026-08-26T00:00:00Z', resolvedAt: '2026-08-28T10:00:00Z',
  },
];

// ─── Audit Log ─────────────────────────────────────────────────
export const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'aud-1', userId: 'user-2', userName: 'Jasmine Rao', userRole: 'SALES_REP', action: 'Quotation Created', entity: 'Quotation', entityId: 'quot-1042', newValue: 'Q-1042 — Acme Corp', timestamp: '2026-08-18T09:15:00Z' },
  { id: 'aud-2', userId: 'user-2', userName: 'Jasmine Rao', userRole: 'SALES_REP', action: 'Discount Applied', entity: 'QuotationItem', entityId: 'qi-2', previousValue: '0%', newValue: '18%', timestamp: '2026-08-18T09:20:00Z' },
  { id: 'aud-3', userId: 'user-2', userName: 'Jasmine Rao', userRole: 'SALES_REP', action: 'Quotation Submitted', entity: 'Quotation', entityId: 'quot-1042', previousValue: 'Draft', newValue: 'Pending Approval', timestamp: '2026-08-18T09:30:00Z' },
  { id: 'aud-4', userId: 'user-3', userName: 'Mihail Shah', userRole: 'SALES_MANAGER', action: 'Approval Returned', entity: 'ApprovalRequest', entityId: 'apr-1', reason: 'Justification needed', timestamp: '2026-08-21T14:15:00Z' },
  { id: 'aud-5', userId: 'user-2', userName: 'Jasmine Rao', userRole: 'SALES_REP', action: 'Quotation Resubmitted', entity: 'Quotation', entityId: 'quot-1042', newValue: 'Pending Approval', timestamp: '2026-08-22T09:00:00Z' },
  { id: 'aud-6', userId: 'user-3', userName: 'Mihail Shah', userRole: 'SALES_MANAGER', action: 'Approval Approved', entity: 'ApprovalRequest', entityId: 'apr-1', timestamp: '2026-08-22T16:00:00Z' },
  { id: 'aud-7', userId: 'user-4', userName: 'Riya Iyer', userRole: 'FINANCE', action: 'Deal Confirmed', entity: 'Quotation', entityId: 'quot-1042', previousValue: 'Approved', newValue: 'Confirmed', timestamp: '2026-08-23T11:30:00Z' },
  { id: 'aud-8', userId: 'user-5', userName: 'Tom Acme', userRole: 'CUSTOMER', action: 'Negotiation Submitted', entity: 'Negotiation', entityId: 'neg-1', timestamp: '2026-08-24T10:00:00Z' },
  { id: 'aud-9', userId: 'user-2', userName: 'Jasmine Rao', userRole: 'SALES_REP', action: 'Invoice Generated', entity: 'Invoice', entityId: 'inv-1042a', newValue: 'INV-1042 — $3,136.74', timestamp: '2026-08-25T10:00:00Z' },
  { id: 'aud-10', userId: 'user-4', userName: 'Riya Iyer', userRole: 'FINANCE', action: 'Payment Recorded', entity: 'Payment', entityId: 'pay-1', newValue: '$3,136.74 via Bank Transfer', timestamp: '2026-09-10T15:00:00Z' },
];

// ─── Notifications ─────────────────────────────────────────────
export const NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', userId: 'user-3', title: 'Approval Required', message: 'Q-1039 (Beta Industries) requires your approval. Risk: MEDIUM.', type: 'warning', read: false, relatedEntity: 'Quotation', relatedEntityId: 'quot-1039', createdAt: '2026-08-21T10:00:00Z' },
  { id: 'notif-2', userId: 'user-4', title: 'Finance Review Required', message: 'Q-1041 (Delta LLC) has been approved by Sales Manager and requires Finance confirmation.', type: 'warning', read: false, relatedEntity: 'Quotation', relatedEntityId: 'quot-1041', createdAt: '2026-08-24T10:00:00Z' },
  { id: 'notif-3', userId: 'user-2', title: 'Customer Negotiation', message: 'Acme Corp has submitted a negotiation request on Q-1042.', type: 'info', read: true, relatedEntity: 'Negotiation', relatedEntityId: 'neg-1', createdAt: '2026-08-24T10:05:00Z' },
  { id: 'notif-4', userId: 'user-3', title: 'Stalled Deal Alert', message: 'Q-1040 (Zenith Co) has been idle for 9 days. Consider nudging the sales rep.', type: 'warning', read: false, relatedEntity: 'Quotation', relatedEntityId: 'quot-1040', createdAt: '2026-08-23T08:00:00Z' },
  { id: 'notif-5', userId: 'user-2', title: 'Deal Confirmed', message: 'Q-1042 (Acme Corp) has been confirmed by Finance. Proceed to fulfillment.', type: 'success', read: true, relatedEntity: 'Quotation', relatedEntityId: 'quot-1042', createdAt: '2026-08-23T11:35:00Z' },
  { id: 'notif-6', userId: 'user-2', title: 'Payment Received', message: 'INV-1042 paid in full by Acme Corp — $3,136.74.', type: 'success', read: true, relatedEntity: 'Invoice', relatedEntityId: 'inv-1042a', createdAt: '2026-09-10T15:05:00Z' },
];

// ─── Activity Feed ─────────────────────────────────────────────
export const ACTIVITY_FEED: ActivityItem[] = [
  { id: 'act-feed-1', message: 'Acme Corp quotation Q-1042 confirmed by Finance (Riya Iyer)', type: 'approval', timestamp: '2026-08-23T11:30:00Z', relatedTo: 'Q-1042' },
  { id: 'act-feed-2', message: 'Beta Industries requested a discount change on Q-1039', type: 'negotiation', timestamp: '2026-08-24T10:00:00Z', relatedTo: 'Q-1039' },
  { id: 'act-feed-3', message: 'Fulfillment created for Q-1042 — Main Warehouse allocated', type: 'fulfillment', timestamp: '2026-08-23T12:00:00Z', relatedTo: 'Q-1042' },
  { id: 'act-feed-4', message: 'Customer negotiation opened on Q-1042 by Tom Acme', type: 'negotiation', timestamp: '2026-08-24T10:05:00Z', relatedTo: 'Q-1042' },
  { id: 'act-feed-5', message: 'Invoice INV-1042 payment recorded — $3,136.74', type: 'payment', timestamp: '2026-09-10T15:00:00Z', relatedTo: 'INV-1042' },
  { id: 'act-feed-6', message: 'Q-1041 (Delta LLC) flagged: Discount anomaly 22% vs avg 8%', type: 'alert', timestamp: '2026-08-23T08:00:00Z', relatedTo: 'Q-1041' },
  { id: 'act-feed-7', message: 'Subscription Care Plan activated for Acme Corp', type: 'invoice', timestamp: '2026-09-01T00:00:00Z', relatedTo: 'sub-1' },
  { id: 'act-feed-8', message: 'Q-1039 (Beta Industries) submitted for Sales Manager approval', type: 'approval', timestamp: '2026-08-21T10:00:00Z', relatedTo: 'Q-1039' },
];
