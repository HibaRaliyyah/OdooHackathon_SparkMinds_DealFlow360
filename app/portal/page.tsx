'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { CustomerKpiCard } from '@/components/customer/CustomerKpiCard';
import { QuotationStatusBadge } from '@/components/customer/QuotationStatusBadge';
import {
  FileText,
  MessageSquare,
  ShoppingBag,
  Receipt,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { currentUser, quotations, fulfillmentOrders, invoices, activityFeed } = useStore();

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

  const pendingActionQuotes = customerQuotes.filter((q) =>
    ['Pending Approval', 'Awaiting Customer', 'Approved'].includes(q.stage)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Account Dashboard
          </span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Welcome, {customerName}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
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
          accentColor="#818cf8"
          iconBg="rgba(99, 102, 241, 0.15)"
        />
        <CustomerKpiCard
          title="Pending Negotiations"
          value={negotiationsCount}
          subtitle="Rate / term requests"
          icon={MessageSquare}
          accentColor="#f59e0b"
          iconBg="rgba(245, 158, 11, 0.15)"
        />
        <CustomerKpiCard
          title="Active Orders"
          value={activeOrdersCount}
          subtitle="Orders in fulfillment"
          icon={ShoppingBag}
          accentColor="#34d399"
          iconBg="rgba(16, 185, 129, 0.15)"
        />
        <CustomerKpiCard
          title="Outstanding Invoices"
          value={`$${outstandingAmount.toLocaleString()}`}
          subtitle="Balance due for payment"
          icon={Receipt}
          accentColor="#fb7185"
          iconBg="rgba(244, 63, 94, 0.15)"
        />
      </div>

      {/* Pending Actions & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Actions (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Pending Actions
            </h3>
            <Link
              href="/portal/quotations"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingActionQuotes.length === 0 ? (
            <div className="p-8 text-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <div className="text-sm font-bold text-white">All caught up!</div>
              <p className="text-xs text-slate-400 mt-1">You have no quotations requiring immediate action.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {pendingActionQuotes.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-indigo-300 text-sm">{q.quoteNumber}</span>
                      <QuotationStatusBadge stage={q.stage} />
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      Total: <span className="font-mono font-bold text-white">${((q.oneTimeTotal || 0) + (q.recurringTotal || 0)).toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Assigned Rep: {q.assignedTo}</div>
                  </div>

                  <Link
                    href={`/portal/quotations/${q.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:opacity-90 transition-opacity text-center shrink-0"
                  >
                    View Quote & Actions
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity (1 col) */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400" /> Recent Activity
          </h3>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
            {activityFeed.slice(0, 4).map((act) => (
              <div key={act.id} className="text-xs space-y-1 pb-3 border-b border-slate-800 last:border-0 last:pb-0">
                <p className="text-slate-300 font-medium">{act.message}</p>
                <div className="text-[10px] text-slate-500 font-mono">
                  {new Date(act.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
