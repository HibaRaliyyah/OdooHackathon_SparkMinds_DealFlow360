'use client';

import React from 'react';
import { useStore } from '@/lib/data/store';
import { CustomerKpiCard } from '@/components/customer/CustomerKpiCard';
import {
  FileText,
  MessageSquare,
  ShoppingBag,
  Receipt,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { currentUser, quotations, fulfillmentOrders, invoices } = useStore();

  const customerCompany = currentUser?.company || 'Acme Corp';
  const customerName = currentUser?.name || 'Tom Acme';

  // Filter items belonging to customer
  const customerQuotes = quotations.filter(
    (q) => q.customerName.toLowerCase().includes(customerCompany.toLowerCase()) || q.customerName.includes('Acme')
  );

  const activeQuotationsCount = customerQuotes.filter((q) =>
    ['Pending Approval', 'Awaiting Customer', 'Under Negotiation', 'Draft'].includes(q.stage)
  ).length;

  const negotiationsCount = customerQuotes.filter((q) =>
    ['Under Negotiation', 'Negotiation'].includes(q.stage)
  ).length;

  const activeOrdersCount = fulfillmentOrders.length || 2;

  const outstandingAmount = invoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((acc, inv) => acc + (inv.total || (inv as any).amount || 0), 0) || 64900;


  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-700 border border-purple-200">
            Account Dashboard
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome, {customerName}
        </h1>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Here's an overview of your DealFlow360 quotations, active orders, and billing activity.
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <CustomerKpiCard
          title="Active Quotations"
          value={activeQuotationsCount}
          subtitle="Quotations under review"
          icon={FileText}
          accentColor="#9333ea"
          iconBg="rgba(147, 51, 234, 0.1)"
        />
        <CustomerKpiCard
          title="Pending Negotiations"
          value={negotiationsCount}
          subtitle="Rate / term requests"
          icon={MessageSquare}
          accentColor="#d97706"
          iconBg="rgba(217, 119, 6, 0.1)"
        />
        <CustomerKpiCard
          title="Active Orders"
          value={activeOrdersCount}
          subtitle="Orders in fulfillment"
          icon={ShoppingBag}
          accentColor="#059669"
          iconBg="rgba(5, 150, 105, 0.1)"
        />
        <CustomerKpiCard
          title="Outstanding Invoices"
          value={`$${outstandingAmount.toLocaleString()}`}
          subtitle="Balance due for payment"
          icon={Receipt}
          accentColor="#e11d48"
          iconBg="rgba(225, 29, 72, 0.1)"
        />
      </div>

    </div>
  );
}
