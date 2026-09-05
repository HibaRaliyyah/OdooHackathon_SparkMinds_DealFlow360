'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Plus,
  DollarSign,
  TrendingUp,
  Sparkles,
  Users,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Package,
  CheckCircle2,
  Boxes,
  MessageSquare,
  Clock,
} from 'lucide-react';

export function SalesRepDashboard() {
  const { quotations, customers, products, negotiations, fulfillmentOrders } = useStore();

  const activeQuotations = quotations.filter((q) => q.stage !== 'Cancelled' && q.stage !== 'Rejected');
  const pipelineValue = activeQuotations.reduce((acc, q) => acc + q.oneTimeTotal + q.recurringTotal, 0);
  const draftQuotes = quotations.filter((q) => q.stage === 'Draft');
  const openNegotiations = negotiations.filter((n) => n.status === 'Open');

  const getStatusBadge = (stage: string) => {
    switch (stage) {
      case 'Approved':
      case 'Confirmed':
      case 'Paid':
        return <Badge variant="success">{stage}</Badge>;
      case 'Pending Approval':
      case 'Negotiation':
        return <Badge variant="warning">{stage}</Badge>;
      case 'Rejected':
        return <Badge variant="danger">{stage}</Badge>;
      default:
        return <Badge variant="neutral">{stage}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Sales Rep Hero Banner with Duties */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/70 via-indigo-950 to-slate-900 p-8 rounded-3xl border border-amber-500/20 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" /> Sales Representative Console
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                CPQ & Customer Negotiations
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-3">
              Quotation Builder, Upsell & Deal Operations
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Build custom quotations with dynamic discounts and AI upsell items, monitor approval statuses and fulfillment progress, and respond to customer negotiations.
            </p>

            {/* Sales Rep Duties Checklist */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Builds Quotations, Applies Discounts, Adds Upsell Items
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Tracks Approval Status & Fulfillment Progress
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Responds to Customer Negotiation Requests
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/quotations/new">
              <Button variant="primary" size="lg" leftIcon={<Plus className="w-5 h-5" />} className="shadow-xl">
                Build New Quotation
              </Button>
            </Link>
            <Link href="/portal/quotation">
              <Button variant="outline" size="lg" leftIcon={<MessageSquare className="w-4 h-4" />}>
                Negotiations ({openNegotiations.length})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Active Pipeline */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Active Pipeline</span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-white tracking-tight">
              ${pipelineValue.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{activeQuotations.length} Active Deals</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Target: $500k</span>
            <span className="text-amber-400">84% of Goal</span>
          </div>
        </div>

        {/* KPI 2: Customer Negotiations */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-cyan-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Negotiations</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-cyan-300 tracking-tight">
              {openNegotiations.length || 1} Requests
            </div>
            <div className="text-xs text-cyan-400 font-semibold mt-2">Counter-Offers Pending Response</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Acme Corp Counter</span>
            <Link href="/portal/quotation" className="text-cyan-400 hover:underline">
              Respond →
            </Link>
          </div>
        </div>

        {/* KPI 3: Fulfillment Progress */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fulfillment Tracking</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-white tracking-tight">{fulfillmentOrders.length} Orders</div>
            <div className="text-xs text-emerald-400 font-semibold mt-2">Main Hub & East Depot Splits</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Partial Shipments</span>
            <Link href="/fulfillment" className="text-emerald-400 hover:underline">
              Track Status →
            </Link>
          </div>
        </div>

        {/* KPI 4: AI Upsell Recommendations */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Upsell & Cross-Sell</span>
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-purple-300 tracking-tight">Active</div>
            <div className="text-xs text-purple-300 font-semibold mt-2">Care Plans & Docking Accessories</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>AI Margin Helper</span>
            <Link href="/quotations/new" className="text-purple-400 hover:underline">
              Add Upsells →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Quotations Table */}
      <div className="card p-6 bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              My Active Quotations & Proposals
            </h3>
            <p className="text-xs text-slate-400">Track deal stages, customer negotiations, and blended risk ratings</p>
          </div>
          <Link href="/quotations/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Build Quotation
            </Button>
          </Link>
        </div>

        <Table
          data={quotations}
          keyExtractor={(q) => q.id}
          columns={[
            {
              header: 'Quote #',
              cell: (q) => (
                <div>
                  <Link
                    href={`/quotations/${q.id}`}
                    className="font-bold text-white hover:text-indigo-400 transition-colors"
                  >
                    {q.quoteNumber}
                  </Link>
                  <div className="text-[10px] text-slate-500 font-mono">{q.customerName}</div>
                </div>
              ),
            },
            {
              header: 'Customer',
              cell: (q) => <span className="font-bold text-xs text-slate-200">{q.customerName}</span>,
            },
            {
              header: 'Risk Score',
              cell: (q) => (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white">{q.blendedRisk?.riskScore || 20} / 100</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      q.blendedRisk?.riskLevel === 'HIGH' ? 'bg-rose-400' : 'bg-emerald-400'
                    }`}
                  />
                </div>
              ),
            },
            {
              header: 'Deal Value',
              cell: (q) => (
                <span className="font-mono text-xs font-black text-amber-300">
                  ${(q.oneTimeTotal + q.recurringTotal).toLocaleString()}
                </span>
              ),
            },
            {
              header: 'Stage',
              cell: (q) => getStatusBadge(q.stage),
            },
            {
              header: 'Actions',
              cell: (q) => (
                <Link href={`/quotations/${q.id}`}>
                  <Button variant="outline" size="sm">
                    Open
                  </Button>
                </Link>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
