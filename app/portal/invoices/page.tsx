'use client';

import React from 'react';
import { useStore } from '@/lib/data/store';
import { InvoiceCard } from '@/components/customer/InvoiceCard';
import { Receipt, CreditCard, DollarSign } from 'lucide-react';

export default function CustomerInvoicesPage() {
  const { invoices } = useStore();

  const customerInvoices = invoices.length > 0 ? invoices : [
    {
      id: 'inv-1001',
      quotationId: 'quot-1042',
      quotationNumber: 'Q-1042',
      customerId: 'cust-1',
      customerName: 'Acme Corp',
      amount: 3036.35,
      paidAmount: 3036.35,
      dueAmount: 0,
      status: 'Paid' as const,
      paymentMethod: 'Credit Card',
      transactionReference: 'TXN-994821',
      invoiceDate: '2026-08-25',
      dueDate: '2026-09-25',
      createdAt: '2026-08-25T14:00:00Z',
    },
    {
      id: 'inv-1002',
      quotationId: 'quot-1039',
      quotationNumber: 'Q-1039',
      customerId: 'cust-1',
      customerName: 'Acme Corp',
      amount: 8496.0,
      paidAmount: 0,
      dueAmount: 8496.0,
      status: 'Pending' as const,
      paymentMethod: 'Net 30',
      transactionReference: '',
      invoiceDate: '2026-09-01',
      dueDate: '2026-10-01',
      createdAt: '2026-09-01T10:00:00Z',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Billing & Invoices
          </span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Your Invoices & Payments</h1>
        <p className="text-xs text-slate-400 mt-1">
          View generated billing statements, check payment due dates, and complete secure payments.
        </p>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {customerInvoices.map((inv: any) => (
          <InvoiceCard
            key={inv.id}
            invoiceNumber={inv.invoiceNumber || inv.id}
            orderNumber={inv.quotationNumber}
            invoiceDate={inv.invoiceDate || (inv.createdAt ? inv.createdAt.split('T')[0] : '2026-09-01')}
            dueDate={inv.dueDate || '2026-10-01'}
            amount={inv.total || inv.amount || 0}
            status={inv.status}
          />
        ))}
      </div>
    </div>
  );
}
