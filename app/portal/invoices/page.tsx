'use client';

import React from 'react';
import { useStore } from '@/lib/data/store';
import { InvoiceCard } from '@/components/customer/InvoiceCard';
import { downloadInvoicePDF, downloadInvoiceXLS } from '@/lib/utils/documentExporter';
import { Receipt, CreditCard, DollarSign } from 'lucide-react';
import { calculateNextBillingDate } from '@/lib/services/billingService';
import { processCustomerPayment } from '@/lib/services/fulfillmentService';

export default function CustomerInvoicesPage() {
  const {
    invoices,
    quotations,
    updateQuotation,
    fulfillmentOrders,
    updateFulfillmentOrder,
    addSubscription,
    updateInvoice,
    addInvoice,
    addNotification,
    addActivity,
    inventory,
    updateInventory,
  } = useStore();

  // Deduplicate and merge all store invoices with current active orders/quotations
  const invoicesMap = new Map<string, any>();

  // 1. Add all explicit store invoices
  (invoices || []).forEach((inv) => {
    if (inv && inv.id) {
      invoicesMap.set(inv.id, inv);
    }
  });

  // 2. Synthesize invoice cards for active/confirmed/awaiting quotation orders not yet in invoices map
  (quotations || []).forEach((q) => {
    if (['Awaiting Allocation', 'Allocated', 'Confirmed', 'Approved', 'Fulfillment', 'Fulfilled', 'Paid'].includes(q.stage)) {
      const existing = Array.from(invoicesMap.values()).find(
        (i) => i.quotationNumber === q.quoteNumber || i.quotationId === q.id
      );
      if (!existing) {
        const invId = `inv-auto-${q.id}`;
        const isPaid = q.stage === 'Paid';
        const autoInv = {
          id: invId,
          invoiceNumber: `INV-2026-${q.quoteNumber ? q.quoteNumber.replace(/[^0-9]/g, '') : '9744'}`,
          quotationId: q.id,
          quotationNumber: q.quoteNumber,
          customerId: q.customerId,
          customerName: q.customerName,
          amount: q.oneTimeTotal || q.subtotal || 9177,
          total: q.oneTimeTotal || q.subtotal || 9177,
          subtotal: q.subtotal || 7980,
          tax: q.totalTax || 1197,
          discount: q.totalDiscount || 0,
          paidAmount: isPaid ? (q.oneTimeTotal || q.subtotal || 9177) : 0,
          dueAmount: isPaid ? 0 : (q.oneTimeTotal || q.subtotal || 9177),
          status: isPaid ? 'Paid' : 'Unpaid',
          invoiceDate: q.createdAt ? q.createdAt.split('T')[0] : new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        };
        invoicesMap.set(invId, autoInv);
      }
    }
  });

  const customerInvoices = Array.from(invoicesMap.values());

  const handlePayInvoice = (inv: any, details?: { type: 'One-Time' | 'Recurring'; cycle?: 'Monthly' | 'Quarterly' | 'Yearly'; amount: number }) => {
    const payType = details?.type || 'One-Time';
    const payAmount = details?.amount || inv.total || inv.amount || 0;

    const matchedQuotation = quotations.find(
      (q) => q.id === inv.quotationId || q.quoteNumber === inv.quotationNumber
    );

    if (matchedQuotation) {
      processCustomerPayment(
        matchedQuotation,
        {
          amount: payAmount,
          billingType: payType === 'Recurring' ? 'recurring' : 'onetime',
          recurringCycle: details?.cycle,
          method: 'Credit Card',
        },
        {
          updateQuotation,
          fulfillmentOrders,
          updateFulfillmentOrder,
          invoices,
          updateInvoice,
          addInvoice,
          addSubscription,
          addNotification,
          addActivity,
          inventory,
          updateInventory,
        }
      );
    } else {
      if (updateInvoice) {
        updateInvoice(inv.id, {
          type: payType,
          status: 'Paid',
          paidAmount: payAmount,
          dueAmount: 0,
          payments: [
            ...(inv.payments || []),
            {
              id: `pay-user-${Date.now()}`,
              invoiceId: inv.id,
              amount: payAmount,
              currency: 'USD',
              paymentDate: new Date().toISOString().slice(0, 10),
              method: 'Credit Card',
              reference: `ONLINE-PAY-${Date.now()}`,
              status: 'Confirmed',
            },
          ],
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">
            Billing & Invoices
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Invoices & Payments</h1>
        <p className="text-xs text-slate-600 mt-1">
          View generated billing statements, verify warehouse allocation status, and process secure online payments.
        </p>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {customerInvoices.map((inv: any) => {
          const matchingQuotation = quotations.find(
            (q) => q.id === inv.quotationId || q.quoteNumber === inv.quotationNumber
          );
          const matchingFulfillment = fulfillmentOrders.find(
            (f) => f.quotationId === inv.quotationId || f.quotationNumber === inv.quotationNumber
          );

          const isAllocationPending =
            matchingQuotation?.stage === 'Awaiting Allocation' ||
            matchingFulfillment?.status === 'Awaiting';

          const effectiveStatus =
            matchingQuotation?.stage === 'Paid'
              ? 'Paid'
              : isAllocationPending
              ? 'Awaiting Allocation'
              : inv.status || 'Unpaid';

          return (
            <InvoiceCard
              key={inv.id}
              invoiceNumber={inv.invoiceNumber || inv.id}
              orderNumber={inv.quotationNumber || inv.quotationId || 'Q-2026-9744'}
              invoiceDate={inv.invoiceDate || (inv.createdAt ? inv.createdAt.split('T')[0] : '2026-09-01')}
              dueDate={inv.dueDate || '2026-10-01'}
              amount={inv.total || inv.amount || 0}
              status={effectiveStatus}
              isAllocationPending={isAllocationPending}
              onPay={(details) => handlePayInvoice(inv, details)}
              onDownloadPDF={() => downloadInvoicePDF(inv)}
              onDownloadXLS={() => downloadInvoiceXLS(inv)}
            />
          );
        })}
      </div>
    </div>
  );
}
