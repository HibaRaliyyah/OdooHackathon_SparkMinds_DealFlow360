'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CheckSquare,
  ShieldAlert,
  TrendingUp,
  Award,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertOctagon,
  Sliders,
  Shield,
} from 'lucide-react';

export function SalesManagerDashboard() {
  const { approvalRequests, quotations, dealHealthFlags, addApprovalAction, updateApprovalStage, addActivity } = useStore();

  const pendingApprovals = approvalRequests.filter((r) => r.status === 'Pending');
  const highRiskQuotes = quotations.filter((q) => q.blendedRisk?.riskLevel === 'HIGH');
  const totalPipeline = quotations.reduce((acc, q) => acc + q.oneTimeTotal + q.recurringTotal, 0);
  const atRiskFlags = dealHealthFlags.filter((f) => f.severity === 'HIGH' || f.severity === 'MEDIUM');

  const handleApprove = (reqId: string, quoteId: string) => {
    addApprovalAction(reqId, {
      id: `act-${Date.now()}`,
      approvalRequestId: reqId,
      action: 'Approved',
      userId: 'user-3',
      userName: 'Mihail Shah',
      userRole: 'SALES_MANAGER',
      comment: 'Approved by Sales Manager after risk margin review.',
      timestamp: new Date().toISOString(),
    });
    updateApprovalStage(reqId, 'Finance', 'Pending');
    addActivity({
      id: `act-${Date.now()}`,
      type: 'approval',
      message: `Mihail Shah approved quotation and forwarded to Finance sign-off.`,
      relatedTo: quoteId,
      timestamp: new Date().toISOString(),
    });
  };

  const handleReject = (reqId: string, quoteId: string) => {
    addApprovalAction(reqId, {
      id: `act-${Date.now()}`,
      approvalRequestId: reqId,
      action: 'Rejected',
      userId: 'user-3',
      userName: 'Mihail Shah',
      userRole: 'SALES_MANAGER',
      comment: 'Discount excessive; margin below threshold. Please revise.',
      timestamp: new Date().toISOString(),
    });
    updateApprovalStage(reqId, 'Rejected', 'Rejected');
    addActivity({
      id: `act-${Date.now()}`,
      type: 'approval',
      message: `Mihail Shah rejected quotation due to margin breach.`,
      relatedTo: quoteId,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8">
      {/* Sales Manager Hero Header with Duties */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-8 rounded-3xl border border-purple-500/20 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-purple-400" /> Sales Manager / Approver Console
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {pendingApprovals.length} Approvals Pending
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-3">
              Quotation Approvals & Deal Health Monitoring
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Review and approve or reject threshold-exceeding quotations, configure discount tier guardrails and approval chains, and monitor at-risk deals.
            </p>

            {/* Sales Manager Duties Checklist */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Reviews & Approves/Rejects Quotes Exceeding Thresholds
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Configures Discount Tiers & Approval Chains
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Monitors Deal Health Dashboard for At-Risk Deals
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/approvals">
              <Button variant="primary" size="md" leftIcon={<CheckSquare className="w-4 h-4" />}>
                Approvals Hub
              </Button>
            </Link>
            <Link href="/deal-health">
              <Button variant="outline" size="md" leftIcon={<ShieldAlert className="w-4 h-4" />}>
                Deal Health Watchlist
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Pending Approvals */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-purple-300 tracking-tight">
              {pendingApprovals.length} Requests
            </div>
            <div className="text-xs text-amber-400 font-semibold mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Discount Threshold Exceeded</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Avg Review Time: 1.2 hrs</span>
            <span className="text-purple-400">SLA: 4 hrs</span>
          </div>
        </div>

        {/* KPI 2: Deal Health At-Risk Deals */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-rose-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">At-Risk Deals Monitored</span>
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-rose-400 tracking-tight">
              {atRiskFlags.length} Flags
            </div>
            <div className="text-xs text-rose-400 font-semibold mt-2">Stalled & Margin Anomalies</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Health Telemetry</span>
            <Link href="/deal-health" className="text-rose-400 hover:underline">Inspect Health →</Link>
          </div>
        </div>

        {/* KPI 3: Team Pipeline ARR */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team Pipeline ARR</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
              ${totalPipeline.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-300 font-semibold mt-2">+24% MoM Velocity</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Quota Target: $1.0M</span>
            <span className="text-emerald-400">92% Attained</span>
          </div>
        </div>

        {/* KPI 4: Approval Chains Configured */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approval Chains</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-indigo-300 tracking-tight">2 Stages</div>
            <div className="text-xs text-indigo-300 font-semibold mt-2">Sales Mgr → Finance Sign-off</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Tiers Configured</span>
            <Link href="/admin" className="text-indigo-400 hover:underline">Edit Tiers →</Link>
          </div>
        </div>
      </div>

      {/* Approvals Action Queue */}
      <div className="card p-6 bg-[var(--bg-card)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-purple-400" /> Threshold Violation Approvals Queue (Quick Decision)
            </h3>
            <p className="text-xs text-slate-400">Review quotes that exceeded standard discount limits and approve or reject</p>
          </div>
          <Link href="/approvals">
            <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              Open Approvals View
            </Button>
          </Link>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-white text-sm">All Clear!</p>
            <p className="text-slate-400">No pending quotation approvals at this stage.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-white text-sm">Quote #{req.quotationNumber}</span>
                    <span className="text-xs text-slate-400">— {req.customerName}</span>
                    <Badge variant={req.riskLevel === 'HIGH' ? 'danger' : 'warning'}>
                      {req.riskLevel} Risk ({req.riskScore}/100)
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Stage: <strong className="text-white">{req.stage}</strong> · Status: {req.status}
                  </p>
                  <p className="text-[11px] text-amber-400/90 font-medium">
                    Trigger Reason: Blended risk engine flagged line item discount limit violation.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/quotations/${req.quotationId}`}>
                    <Button variant="outline" size="sm">
                      Inspect
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    onClick={() => handleReject(req.id, req.quotationId)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    onClick={() => handleApprove(req.id, req.quotationId)}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Quota & High Risk Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Rep Leaderboard */}
        <div className="card p-6 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Sales Team Quota Attainment
            </h3>
            <span className="text-xs text-slate-400">Q3 2026</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Jasmine Rao', closed: '$420,000', quota: '$400k', pct: 105, status: 'Overachiever' },
              { name: 'David Miller', closed: '$310,000', quota: '$350k', pct: 88, status: 'On Track' },
              { name: 'Sarah Jenkins', closed: '$280,000', quota: '$300k', pct: 93, status: 'On Track' },
            ].map((rep) => (
              <div key={rep.name} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">{rep.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">{rep.pct}% ({rep.closed})</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      rep.pct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(rep.pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Risk Deals Flagged */}
        <div className="card p-6 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Deal Health & At-Risk Watchlist
            </h3>
            <Link href="/deal-health" className="text-xs text-indigo-400 hover:underline">
              View Deal Health →
            </Link>
          </div>

          <div className="space-y-3">
            {highRiskQuotes.map((q) => (
              <div
                key={q.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <Link href={`/quotations/${q.id}`} className="font-bold text-white hover:text-indigo-400">
                    {q.quoteNumber} — {q.customerName}
                  </Link>
                  <p className="text-[11px] text-slate-400">
                    Est. Margin: <strong className="text-rose-400">{q.blendedRisk?.estimatedMarginPercent || 18}%</strong> (Threshold 25%)
                  </p>
                </div>
                <div className="text-right font-mono font-bold text-white">
                  ${(q.oneTimeTotal + q.recurringTotal).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
