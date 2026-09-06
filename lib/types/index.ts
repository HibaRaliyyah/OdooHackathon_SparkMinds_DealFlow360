// ============================================================
// DealFlow360 — Shared Type Definitions
// ============================================================

// ─── Roles & Permissions ─────────────────────────────────────
export type UserRole = 'ADMIN' | 'SALES_REP' | 'SALES_MANAGER' | 'FINANCE' | 'CUSTOMER';
export type { Permission } from '@/lib/services/permissionService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarInitials: string;
  company?: string;
  createdAt: string;
}

// ─── Customers ──────────────────────────────────────────────
export type CustomerTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type Currency = 'USD' | 'EUR';

export interface Customer {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  tier: CustomerTier;
  currency: Currency;
  priceListId: string;
  paymentTerms: string;
  createdAt: string;
  userId?: string; // linked portal user
}

// ─── Products & Variants ────────────────────────────────────
export type ProductType = 'Hardware' | 'Services' | 'Subscription' | 'Software';
export type RecurringCycle = 'Monthly' | 'Quarterly' | 'Yearly' | 'Weekly';

export interface ProductVariantValue {
  id: string;
  attribute: string;
  value: string;
  extraPrice: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  sku: string;
  description: string;
  basePrice: number;
  unit: string;
  taxPercent: number;
  type: ProductType;
  isSubscription: boolean;
  recurringCycle?: RecurringCycle;
  recurringPrice?: number;
  status: 'Active' | 'Inactive';
  variants: ProductVariantValue[];
  quantityOnHand: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  discountCeiling: number; // max discount %
}

// ─── Price Lists ─────────────────────────────────────────────
export interface PriceListItem {
  productId: string;
  variantId?: string;
  price: number;
  currency: Currency;
}

export interface PriceList {
  id: string;
  name: string;
  tier: CustomerTier;
  currency: Currency;
  rule: 'no_adjustment' | 'percent_off_base';
  ruleValue?: number; // e.g. 10 = 10% off base
  items: PriceListItem[];
}

// ─── Customer Tiers ─────────────────────────────────────────
export interface TierPolicy {
  tier: CustomerTier;
  discountCeiling: number;
}

// ─── Discount & Risk ────────────────────────────────────────
export type DiscountStatus = 'OK' | 'WARNING' | 'OVER';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface LineDiscountResult {
  allowedDiscount: number;
  actualDiscount: number;
  difference: number;
  status: DiscountStatus;
  violations: string[];
  marginImpact: number;
}

export interface BlendedRiskResult {
  riskScore: number;
  riskLevel: RiskLevel;
  worstLine: string | null;
  violations: string[];
  estimatedMargin: number;
  estimatedMarginPercent: number;
  requiresApproval: boolean;
  approvalLevel: 'AUTO_APPROVED' | 'SALES_MANAGER' | 'SALES_MANAGER_AND_FINANCE';
  explanation: string[];
}

// ─── Quotation ───────────────────────────────────────────────
export type QuotationStage =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Negotiation'
  | 'Awaiting Allocation'
  | 'Allocated'
  | 'Confirmed'
  | 'Rejected'
  | 'Returned'
  | 'Cancelled'
  | 'Fulfillment'
  | 'Partially Fulfilled'
  | 'Fulfilled'
  | 'Invoiced'
  | 'Paid';

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number; // actual given %
  allowedDiscount: number; // computed from tier+category
  taxPercent: number;
  lineTotal: number;
  margin: number;
  discountStatus: DiscountStatus;
  discountDifference: number;
  isSubscription: boolean;
  recurringCycle?: RecurringCycle;
  recurringPrice?: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  priceListId: string;
  currency: Currency;
  stage: QuotationStage;
  items: QuotationItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  oneTimeTotal: number;
  recurringTotal: number;
  blendedRisk: BlendedRiskResult;
  assignedTo: string; // user name
  assignedToId: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// ─── Approvals ──────────────────────────────────────────────
export type ApprovalStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Returned'
  | 'Confirmed'
  | 'Auto-Approved';

export interface ApprovalAction {
  id: string;
  approvalRequestId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'Submitted' | 'Approved' | 'Rejected' | 'Returned' | 'Resubmitted' | 'Confirmed' | 'Auto-Approved';
  reason?: string;
  comment?: string;
  timestamp: string;
}

export interface ApprovalRequest {
  id: string;
  quotationId: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  stage: 'Sales Manager' | 'Finance' | 'Auto-Approved' | 'Completed' | 'Rejected';
  status: ApprovalStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  actions: ApprovalAction[];
  createdAt: string;
  updatedAt: string;
}

// ─── Negotiations ────────────────────────────────────────────
export type NegotiationStatus = 'Open' | 'Resolved' | 'Rejected' | 'Counter-Offered';

export interface NegotiationMessage {
  id: string;
  negotiationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole | 'CUSTOMER';
  message: string;
  timestamp: string;
  read?: boolean;
}

export interface NegotiationRequest {
  id: string;
  quotationId: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  status: NegotiationStatus;
  requestedChanges: {
    lineId?: string;
    productName?: string;
    requestedDiscount?: number;
    requestedDeliveryDate?: string;
    requestedQuantity?: number;
    comment: string;
  }[];
  messages: NegotiationMessage[];
  triggeredReapproval: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Warehouses & Inventory ──────────────────────────────────
export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface InventoryItem {
  id: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productName: string;
  inStock: number;
  reserved: number;
  available: number;
}

// ─── Fulfillment ─────────────────────────────────────────────
export type FulfillmentStatus =
  | 'Awaiting'
  | 'Allocated'
  | 'Partially Shipped'
  | 'Shipped'
  | 'Backorder'
  | 'Split Pending'
  | 'Completed';

export interface WarehouseAllocation {
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productName: string;
  requestedQty: number;
  allocatedQty: number;
  shippedQty: number;
  backorderQty: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  warehouseId: string;
  warehouseName: string;
  items: { productId: string; productName: string; quantity: number }[];
  shippedAt: string;
  estimatedDelivery: string;
  shippingCost: number;
  status: 'Scheduled' | 'In Transit' | 'Delivered';
}

export interface FulfillmentOrder {
  id: string;
  quotationId: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  status: FulfillmentStatus;
  allocations: WarehouseAllocation[];
  shipments: Shipment[];
  createdAt: string;
  updatedAt: string;
}

// ─── Invoices & Payments ─────────────────────────────────────
export type InvoiceStatus = 'Draft' | 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';
export type InvoiceType = 'One-Time' | 'Recurring';

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  orderedQty: number;
  shippedQty: number;
  billedQty: number;
  unitPrice: number;
  discount: number;
  taxPercent: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  type: InvoiceType;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAmount: number;
  dueAmount?: number;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
  // Reconciliation
  deliveryReconciled: boolean;
  reconciliationNote?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: Currency;
  paymentDate: string;
  method: 'Bank Transfer' | 'Credit Card' | 'Check' | 'Wire';
  reference: string;
  status: 'Pending' | 'Confirmed';
}

// ─── Credit Notes & Reconciliation ────────────────────────────
export type CreditNoteStatus = 'Draft' | 'Approved' | 'Applied' | 'Refunded';
export type CreditNoteReason =
  | 'Product Return / RMA'
  | 'Billing / Tax Correction'
  | 'Volume Rebate & Discount'
  | 'SLA Breach Penalty'
  | 'Goodwill Customer Credit';

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  quotationNumber?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: CreditNoteReason;
  status: CreditNoteStatus;
  issuedDate: string;
  reconciledDate?: string;
  appliedInvoiceNumber?: string;
  notes?: string;
  createdAt: string;
}

// ─── Subscriptions ───────────────────────────────────────────
export type SubscriptionStatus = 'Active' | 'Paused' | 'Cancelled' | 'Trial';

export interface SubscriptionItem {
  productId: string;
  productName: string;
  recurringPrice: number;
  cycle: RecurringCycle;
  discount: number;
  tax: number;
}

export interface ProrationRecord {
  id: string;
  subscriptionId: string;
  previousAmount: number;
  newAmount: number;
  remainingDays: number;
  prorationAmount: number;
  effectiveDate: string;
  reason: string;
}

export interface Subscription {
  id: string;
  quotationId: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  plan: string;
  status: SubscriptionStatus;
  cycle: RecurringCycle;
  currentAmount: number;
  nextBillDate: string;
  startDate: string;
  items: SubscriptionItem[];
  billingHistory: Invoice[];
  prorationHistory: ProrationRecord[];
  createdAt: string;
  updatedAt: string;
}

// ─── Deal Health ─────────────────────────────────────────────
export interface DealHealthFlag {
  id: string;
  quotationId: string;
  quotationNumber: string;
  customerName: string;
  type: 'Stalled' | 'Discount Anomaly' | 'Delivery Slippage' | 'Payment Overdue' | 'Inventory Risk';
  severity: RiskLevel;
  description: string;
  detectedAt: string;
  actionTaken?: string;
  resolvedAt?: string;
}

export interface DealHealthScore {
  quotationId: string;
  score: number; // 0-100, higher = healthier
  level: RiskLevel;
  dimensions: {
    pricingRisk: number;
    approvalRisk: number;
    inventoryRisk: number;
    deliveryRisk: number;
    paymentRisk: number;
    customerRisk: number;
  };
  flags: string[];
  recommendedActions: string[];
  calculatedAt: string;
}

// ─── Audit & Notifications ───────────────────────────────────
export interface AuditEvent {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  relatedEntity?: string;
  relatedEntityId?: string;
  createdAt: string;
}

// ─── AI ──────────────────────────────────────────────────────
export interface AIRecommendation {
  productId: string;
  productName: string;
  reason: string;
  confidence: number;
  estimatedRevenue: number;
  estimatedMargin: number;
  type: 'Upsell' | 'Cross-sell';
}

export interface AIResponse {
  recommendations: AIRecommendation[];
  summary?: string;
  usedFallback: boolean;
}

// ─── Reports ─────────────────────────────────────────────────
export interface ReportKPI {
  label: string;
  value: string | number;
  change?: number; // % change vs previous period
  trend?: 'up' | 'down' | 'flat';
}

// ─── Dashboard ───────────────────────────────────────────────
export interface DashboardStats {
  pendingApprovals: number;
  openQuotations: number;
  atRiskDeals: number;
  confirmedDeals: number;
  revenue: number;
  recurringRevenue: number;
  unpaidInvoices: number;
  backorders: number;
}

export interface ActivityItem {
  id: string;
  message: string;
  type: 'approval' | 'negotiation' | 'fulfillment' | 'invoice' | 'payment' | 'alert';
  timestamp: string;
  relatedTo?: string;
}
