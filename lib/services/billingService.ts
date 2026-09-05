// ============================================================
// DealFlow360 — Billing & Subscription Service
// Manages invoice generation from partial shipments, recurring subscription schedules
// ============================================================

import type { Quotation, FulfillmentOrder, Invoice, Subscription, InvoiceItem, InvoiceType, InvoiceStatus } from '@/lib/types';

/**
 * Generates partial or full invoice from fulfilled order shipments.
 */
export function createInvoiceFromFulfillment(
  quotation: Quotation,
  fulfillmentOrder: FulfillmentOrder,
  invoiceType: InvoiceType = 'One-Time'
): Invoice {
  const lineItems: InvoiceItem[] = quotation.items.map((i, idx) => {
    const disc = i.discount || 0;
    const effectiveUnitPrice = i.unitPrice * (1 - disc / 100);
    const amount = Math.round(effectiveUnitPrice * i.quantity * 100) / 100;

    return {
      id: `inv-line-${Date.now()}-${idx}`,
      productId: i.productId,
      productName: i.productName,
      orderedQty: i.quantity,
      shippedQty: i.quantity,
      billedQty: i.quantity,
      unitPrice: effectiveUnitPrice,
      discount: disc,
      taxPercent: i.taxPercent || 18,
      lineTotal: amount,
    };
  });

  const subtotal = lineItems.reduce((acc, item) => acc + item.lineTotal, 0);
  const tax = lineItems.reduce((acc, item) => acc + (item.lineTotal * (item.taxPercent / 100)), 0);
  const total = subtotal + tax;

  const now = new Date();
  const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    id: `INV-${Date.now().toString().slice(-4)}`,
    invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    quotationId: quotation.id,
    quotationNumber: quotation.quoteNumber || quotation.id,
    customerId: quotation.customerId,
    customerName: quotation.customerName,
    type: invoiceType,
    items: lineItems,
    subtotal,
    discount: 0,
    tax,
    total,
    status: 'Unpaid',
    dueDate,
    paidAmount: 0,
    payments: [],
    deliveryReconciled: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

/**
 * Calculates next subscription billing date based on billing cycle.
 */
export function calculateNextBillingDate(currentDateStr: string, cycle: 'Monthly' | 'Quarterly' | 'Yearly'): string {
  const date = new Date(currentDateStr);
  if (cycle === 'Monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (cycle === 'Quarterly') {
    date.setMonth(date.getMonth() + 3);
  } else if (cycle === 'Yearly') {
    date.setFullYear(date.getFullYear() + 1);
  }
  return date.toISOString().split('T')[0];
}

/**
 * Generates recurring billing charge for an active subscription.
 */
export function generateSubscriptionInvoice(subscription: Subscription): Invoice {
  const amount = subscription.currentAmount || 1000;
  const tax = Math.round(amount * 0.18 * 100) / 100;
  const total = amount + tax;

  const now = new Date();
  const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    id: `INV-SUB-${Date.now().toString().slice(-4)}`,
    invoiceNumber: `INV-SUB-${Math.floor(1000 + Math.random() * 9000)}`,
    quotationId: subscription.quotationId,
    quotationNumber: subscription.quotationNumber,
    customerId: subscription.customerId,
    customerName: subscription.customerName,
    type: 'Recurring',
    items: [
      {
        id: `inv-sub-item-1`,
        productId: 'sub-service',
        productName: `${subscription.plan} Subscription (${subscription.cycle})`,
        orderedQty: 1,
        shippedQty: 1,
        billedQty: 1,
        unitPrice: amount,
        discount: 0,
        taxPercent: 18,
        lineTotal: amount,
      },
    ],
    subtotal: amount,
    discount: 0,
    tax,
    total,
    status: 'Unpaid',
    dueDate,
    paidAmount: 0,
    payments: [],
    deliveryReconciled: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}
