'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Calculator,
  Receipt,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Boxes,
  Truck,
  AlertOctagon,
  FileCheck,
} from 'lucide-react';

export function FinanceDashboard() {
  const { invoices, subscriptions, approvalRequests, fulfillmentOrders, updateApprovalStage, addApprovalAction, addActivity } = useStore();

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((acc, inv) => acc + inv.total, 0);
  const totalUnpaid = invoices.filter((i) => i.status === 'Unpaid' || i.status === 'Overdue').reduce((acc, inv) => acc + inv.total, 0);

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'Active');
  const mrrTotal = activeSubscriptions.reduce((acc, s) => acc + (s.currentAmount || 46), 0);

  const secondLevelApprovals = approvalRequests.filter((r) => r.status === 'Pending' && (r.stage === 'Finance' || r.riskLevel === 'HIGH'));

  const handleConfirm = (reqId: string, quoteId: string) => {
    addApprovalAction(reqId, {
      id: `act-${Date.now()}`,
      approvalRequestId: reqId,
      action: 'Confirmed',
      userId: 'user-4',
      userName: 'Riya Iyer',
      userRole: 'FINANCE',
      comment: 'Second level financial verification and credit terms passed. Confirmed deal.',
      timestamp: new Date().toISOString(),
    });
    updateApprovalStage(reqId, 'Completed', 'Approved');
    addActivity({
      id: `act-${Date.now()}`,
      type: 'approval',
      message: `Riya Iyer signed off second-level approval and confirmed deal for fulfillment.`,
      relatedTo: quoteId,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8">
      {/* Finance Hero Banner with Duties */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950 p-8 rounded-3xl border border-emerald-500/20 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" /> Finance / Operations User Console
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                2nd-Level Approvals & Fulfillment Splits
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-3">
              Financial Controls, Fulfillment Splits & Recurring Billing
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Handle second level approvals for high risk discounts, manage warehouse fulfillment splits and backorder decisions, and reconcile recurring billing and credit notes.
            </p>

            {/* Finance Duties Checklist */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Handles 2nd-Level Approvals for High-Risk Discounts
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Manages Warehouse Fulfillment Splits & Backorders
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Reconciles Recurring Billing & Credit Notes
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/invoices">
              <Button variant="primary" size="md" leftIcon={<Receipt className="w-4 h-4" />}>
                Billing & Credit Notes
              </Button>
            </Link>
            <Link href="/fulfillment">
              <Button variant="outline" size="md" leftIcon={<Boxes className="w-4 h-4" />}>
                Fulfillment Splits
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Second Level Approvals */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">2nd-Level Approvals</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-emerald-300 tracking-tight">
              {secondLevelApprovals.length} Pending
            </div>
            <div className="text-xs text-emerald-400 font-semibold mt-2">High-Risk Discount Sign-Offs</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Credit & Terms Gate</span>
            <Link href="/approvals" className="text-emerald-400 hover:underline">Review Queue →</Link>
          </div>
        </div>

        {/* KPI 2: Warehouse Fulfillment Splits */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fulfillment Splits</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-indigo-300 tracking-tight">
              {fulfillmentOrders.length} Splits
            </div>
            <div className="text-xs text-indigo-300 font-semibold mt-2">Main Hub & East Depot Backorders</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Partial Billing Ready</span>
            <Link href="/fulfillment" className="text-indigo-400 hover:underline">Manage Splits →</Link>
          </div>
        </div>

        {/* KPI 3: Recurring Billing Reconciliation */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-cyan-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recurring Billing MRR</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-cyan-300 tracking-tight">
              ${mrrTotal.toLocaleString()}/mo
            </div>
            <div className="text-xs text-cyan-300 font-semibold mt-2">Reconciled Subscription Care Plans</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>{activeSubscriptions.length} Subscriptions</span>
            <Link href="/subscriptions" className="text-cyan-400 hover:underline">Reconcile →</Link>
          </div>
        </div>

        {/* KPI 4: Invoices & Credit Notes */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recognized Invoices</span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-amber-300 tracking-tight">
              ${totalInvoiced.toLocaleString()}
            </div>
            <div className="text-xs text-amber-300 font-semibold mt-2">${totalPaid.toLocaleString()} Collected</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Unpaid: ${totalUnpaid.toLocaleString()}</span>
            <Link href="/invoices" className="text-amber-400 hover:underline">Invoices →</Link>
          </div>
        </div>
      </div>

      {/* Second Level Approvals Action Queue */}
      {secondLevelApprovals.length > 0 && (
        <div className="card p-6 bg-[var(--bg-card)] border-emerald-500/30">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Second-Level High-Risk Approvals Queue
              </h3>
              <p className="text-xs text-slate-400">Confirm exceptional discounts and validate payment terms prior to warehouse release</p>
            </div>
          </div>

          <div className="space-y-3">
            {secondLevelApprovals.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">Quote #{req.quotationNumber}</span>
                    <span className="text-xs text-slate-400">— {req.customerName}</span>
                    <Badge variant="danger">{req.riskLevel} Risk ({req.riskScore}/100)</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Stage: <strong className="text-emerald-400">{req.stage}</strong> · Sales Manager Sign-off completed. Requires 2nd-level confirmation.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => handleConfirm(req.id, req.quotationId)}
                >
                  Confirm 2nd Level Sign-off
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warehouse Splits & Invoices Reconciliation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Warehouse Splits & Backorders */}
        <div className="card p-6 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-400" /> Warehouse Fulfillment Splits & Backorders
            </h3>
            <Link href="/fulfillment">
              <Button variant="outline" size="sm">
                Manage Splits
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {fulfillmentOrders.slice(0, 3).map((fo) => (
              <div
                key={fo.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Order {fo.quotationNumber} — {fo.customerName}</span>
                  <Badge variant="warning">{fo.status}</Badge>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Allocations: {fo.allocations.length} Warehouse Hubs · Backorder Decisions Handled
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices & Billing Reconciliation */}
        <div className="card p-6 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" /> Invoices & Recurring Billing Reconciliation
            </h3>
            <Link href="/invoices">
              <Button variant="outline" size="sm">
                View Invoices
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {invoices.slice(0, 4).map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{inv.invoiceNumber}</div>
                  <div className="text-slate-400 text-[11px]">{inv.customerName} (Strict Partial Delivery)</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400">${inv.total.toLocaleString()}</div>
                  <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
