'use client';

import React from 'react';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/ui/BackButton';

export default function InvoicesPage() {
  const { invoices } = useStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <BackButton href="/dashboard" label="Dashboard" />
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Invoice Operations & Partial Invoicing</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Track partial shipments, final invoices, payment status, and due dates
          </p>
        </div>
      </div>

      <div className="card p-6 bg-[var(--bg-card)]">
        <Table
          data={invoices}
          keyExtractor={(inv) => inv.id}
          columns={[
            {
              header: 'Invoice #',
              cell: (inv) => <span className="font-mono font-bold text-[var(--text-primary)]">{inv.invoiceNumber}</span>,
            },
            {
              header: 'Customer',
              cell: (inv) => <span className="font-semibold text-xs text-[var(--text-primary)]">{inv.customerName}</span>,
            },
            {
              header: 'Type',
              cell: (inv) => (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--accent-indigo)]/15 text-[var(--accent-purple-light)]">
                  {inv.type}
                </span>
              ),
            },
            {
              header: 'Total Amount',
              cell: (inv) => (
                <span className="font-mono text-xs font-bold text-emerald-400">
                  ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              ),
            },
            {
              header: 'Due Date',
              cell: (inv) => <span className="font-mono text-xs text-[var(--text-secondary)]">{inv.dueDate}</span>,
            },
            {
              header: 'Status',
              cell: (inv) => <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>{inv.status}</Badge>,
            },
          ]}
        />
      </div>
    </div>
  );
}
