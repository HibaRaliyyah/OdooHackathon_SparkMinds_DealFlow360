'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  FileText,
  RefreshCw,
  Receipt,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Truck,
  CheckCircle2,
  Sliders,
  Check,
} from 'lucide-react';

export function CustomerDashboard() {
  const { quotations, fulfillmentOrders, invoices, subscriptions, updateInvoice, updateQuotation, addActivity } = useStore();
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [confirmingQuoteId, setConfirmingQuoteId] = useState<string | null>(null);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  // Filter items for Acme Corp
  const acmeQuotes = quotations.filter((q) => q.customerId === 'cust-1' || q.customerName.includes('Acme'));
  const acmeFulfillments = fulfillmentOrders.filter((f) => f.customerName.includes('Acme'));
  const acmeInvoices = invoices.filter((i) => i.customerName.includes('Acme'));
  const acmeSubs = subscriptions.filter((s) => s.customerName.includes('Acme'));

  const handlePayInvoice = (invId: string) => {
    setPayingInvoiceId(invId);
    setTimeout(() => {
      updateInvoice(invId, { status: 'Paid' });
      addActivity({
        id: `act-${Date.now()}`,
        type: 'payment',
        message: 'Tom Acme completed credit card payment for invoice.',
        relatedTo: invId,
        timestamp: new Date().toISOString(),
      });
      setPayingInvoiceId(null);
    }, 600);
  };

  const handle1ClickConfirmTerms = (quoteId: string) => {
    setConfirmingQuoteId(quoteId);
    setTimeout(() => {
      updateQuotation(quoteId, { stage: 'Confirmed' });
      addActivity({
        id: `act-${Date.now()}`,
        type: 'negotiation',
        message: 'Tom Acme (Customer) confirmed final contract terms with 1-click accept.',
        relatedTo: quoteId,
        timestamp: new Date().toISOString(),
      });
      setConfirmingQuoteId(null);
      setConfirmedSuccess(true);
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Customer Portal Banner with Duties */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-8 rounded-3xl border border-teal-500/20 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-400" /> Customer (Portal User)
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Acme Corp Gold Tier Client
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-3">
              Online Quotation Viewer & Interactive Negotiation
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              View quotations online, request line-level changes, ask line questions, counter discounts, and confirm final contract terms with one click.
            </p>

            {/* Customer Duties Checklist */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Views Quotations Online
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Requests Changes, Asks Line Questions & Counters Discounts
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Confirms Final Terms with One Click
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/portal/quotation">
              <Button variant="primary" size="lg" leftIcon={<MessageSquare className="w-4 h-4" />}>
                Line-Level Negotiation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Customer Portal Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Online Proposals */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-teal-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Online Proposals</span>
            <div className="p-2.5 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-teal-300 tracking-tight">
              {acmeQuotes.length} Quotes
            </div>
            <div className="text-xs text-teal-400 font-semibold mt-2">Latest: Q-1042 ($34,420)</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Special Terms: Net 30</span>
            <Link href="/portal/quotation" className="text-teal-400 hover:underline">
              View Online →
            </Link>
          </div>
        </div>

        {/* KPI 2: Live Shipments */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Shipments</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-white tracking-tight">
              {acmeFulfillments.length || 1} Orders
            </div>
            <div className="text-xs text-indigo-300 font-semibold mt-2">12 of 20 Units Dispatched</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>East Depot Split</span>
            <span className="text-indigo-400">In Transit</span>
          </div>
        </div>

        {/* KPI 3: Subscriptions */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-cyan-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Care Subscriptions</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-cyan-300 tracking-tight">
              {acmeSubs.length || 1} Plan
            </div>
            <div className="text-xs text-cyan-300 font-semibold mt-2">Care Plan 2yr (Active)</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Next billing: 1st of month</span>
            <span className="text-cyan-400">$46/mo</span>
          </div>
        </div>

        {/* KPI 4: Invoices */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unpaid Invoices</span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-amber-300 tracking-tight">
              {acmeInvoices.filter((i) => i.status === 'Unpaid').length} Invoices
            </div>
            <div className="text-xs text-amber-400 font-semibold mt-2">Partial Billing Enforced</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Only shipped goods</span>
            <span className="text-amber-400">Verified</span>
          </div>
        </div>
      </div>

      {/* Online Proposal & 1-Click Term Confirmation Card */}
      <div className="card p-6 bg-[var(--bg-card)] border-teal-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                LATEST PROPOSAL
              </span>
              <h3 className="text-lg font-extrabold text-white">Quotation Q-1042 (Acme Enterprise Expansion)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Prepared by Jasmine Rao (Sales Rep) · Review line items, request changes, or confirm final contract terms.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/portal/quotation">
              <Button variant="outline" size="md" leftIcon={<MessageSquare className="w-4 h-4" />}>
                Counter / Ask Questions
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Check className="w-4 h-4" />}
              isLoading={confirmingQuoteId === 'quote-1'}
              onClick={() => handle1ClickConfirmTerms('quote-1')}
            >
              {confirmedSuccess ? 'Terms Confirmed!' : '1-Click Confirm Terms'}
            </Button>
          </div>
        </div>

        {confirmedSuccess && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Success! Contract terms confirmed with 1-click acceptance. Deal locked for warehouse fulfillment.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400">Hardware & Services Total</div>
            <div className="text-xl font-bold font-mono text-white mt-1">$33,868.00</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400">Recurring Monthly Subscriptions</div>
            <div className="text-xl font-bold font-mono text-teal-300 mt-1">$552.00/mo</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400">Total Contract Value</div>
            <div className="text-xl font-black font-mono text-indigo-300 mt-1">$34,420.00</div>
          </div>
        </div>
      </div>

      {/* Shipments & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Shipments */}
        <div className="card p-6 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-400" /> Equipment Shipments & Delivery
            </h3>
            <Badge variant="warning">Partial Delivery</Badge>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-white">Laptop Pro 14 (Order #FO-8812)</span>
                <span className="font-mono text-indigo-300">12 of 20 Delivered</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Main Hub: 12 Units Dispatched · East Depot: 8 Units Backordered
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-[60%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Invoices & Pay Online */}
        <div className="card p-6 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-teal-400" /> Invoices & Online Payment
            </h3>
            <span className="text-xs text-slate-400">Net 30 Terms</span>
          </div>

          <div className="space-y-3">
            {acmeInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{inv.invoiceNumber}</div>
                  <div className="text-slate-400 text-[11px]">
                    ${inv.total.toLocaleString()} — {inv.items.length} line items (shipped only)
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                  {inv.status === 'Unpaid' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                      isLoading={payingInvoiceId === inv.id}
                      onClick={() => handlePayInvoice(inv.id)}
                    >
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
