'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
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
  Warehouse,
  Boxes,
  Truck,
  MapPin,
  PackageCheck,
  MessageSquare,
  Search,
  User,
  Building2,
  Send,
} from 'lucide-react';

export function SalesManagerDashboard() {
  const {
    approvalRequests,
    quotations,
    dealHealthFlags,
    fulfillmentOrders,
    warehouses,
    negotiations,
    customers,
    addApprovalAction,
    updateApprovalStage,
    addActivity,
    updateNegotiation,
  } = useStore();

  const [showNegotiationsModal, setShowNegotiationsModal] = useState(false);
  const [selectedNegId, setSelectedNegId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

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

  const handleSendReply = (negId: string) => {
    if (!replyText.trim()) return;

    const targetNeg = (negotiations || []).find((n) => n.id === negId);
    if (!targetNeg) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      negotiationId: negId,
      senderId: 'user-3',
      senderName: 'Mihail Shah',
      senderRole: 'SALES_MANAGER' as const,
      message: replyText.trim(),
      timestamp: new Date().toISOString(),
    };

    updateNegotiation(negId, {
      messages: [...targetNeg.messages, newMsg],
      status: 'Counter-Offered',
    });

    setReplyText('');
  };

  const filteredNegotiations = (negotiations || []).filter((n) =>
    (n.customerName || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (n.quotationNumber || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

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
            <Button
              variant="outline"
              size="md"
              leftIcon={<MessageSquare className="w-4 h-4 text-cyan-400" />}
              onClick={() => setShowNegotiationsModal(true)}
              className="border-cyan-500/30 text-white hover:bg-cyan-950/40"
            >
              Negotiations ({(negotiations || []).length})
            </Button>
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

      {/* Recommended Warehouse Split & Multi-Depot Stock Allocation */}
      <div className="card p-6 bg-[var(--bg-card)] border border-indigo-500/20 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                <Truck className="w-4 h-4" />
              </span>
              <h3 className="text-base font-extrabold text-white">
                Recommended Warehouse Split & Fulfillment Allocation
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-depot parcel split optimizer automatically allocating inventory from Main Hub & regional depots to minimize freight costs and lead times.
            </p>
          </div>
          <Link href="/fulfillment">
            <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              View Fulfillment Optimizer
            </Button>
          </Link>
        </div>

        {/* Live Warehouse Depot Status Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {warehouses.map((wh) => (
            <div key={wh.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-800 text-indigo-400">
                  <Warehouse className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{wh.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-slate-500" />
                    <span>{wh.location}</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Stock Active
              </span>
            </div>
          ))}
        </div>

        {/* Recommended Split Orders List */}
        <div className="space-y-4 pt-1">
          {fulfillmentOrders.map((order) => (
            <div key={order.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-extrabold text-white text-sm">Order #{order.quotationNumber}</span>
                  <span className="text-slate-400">— {order.customerName}</span>
                  <Badge variant={order.status === 'Completed' || order.status === 'Allocated' ? 'success' : 'warning'}>
                    {order.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" /> Multi-Depot Split Calculated
                  </span>
                </div>
              </div>

              {/* Sub-allocations grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(order.allocations || []).map((alloc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{alloc.warehouseName}</span>
                      </span>
                      <span className="font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {alloc.allocatedQty} Unit{alloc.allocatedQty > 1 ? 's' : ''} Allocated
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] flex justify-between">
                      <span className="text-slate-300 font-medium">Item: {alloc.productName}</span>
                      <span className="text-slate-400">Parcel 1/1</span>
                    </div>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-900">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <PackageCheck className="w-3 h-3 text-emerald-400" /> Stock Reserved
                      </span>
                      <span className="font-mono text-slate-400">Freight: $35.00 est.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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

      {/* ─── CUSTOMER NEGOTIATIONS HISTORY MODAL ─── */}
      {showNegotiationsModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowNegotiationsModal(false)}
          title="Customer Negotiation History & Proposal Threads"
          subtitle="All previous customer counter-offers, requested discount changes, and thread message logs."
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search negotiations by Customer Name or Quote #..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* List of Previous Negotiations */}
            <div className="space-y-5 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredNegotiations.map((neg) => {
                const cust = (customers || []).find((c) => c.id === neg.customerId);

                return (
                  <div
                    key={neg.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-all"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm">{neg.customerName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              Quote #{neg.quotationNumber}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Customer Tier: <strong className="text-amber-400">{cust?.tier || 'Gold'} Tier</strong> · Manager Review: <strong className="text-white">Mihail Shah</strong>
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={
                          neg.status === 'Resolved'
                            ? 'success'
                            : neg.status === 'Counter-Offered'
                            ? 'info'
                            : 'warning'
                        }
                      >
                        {neg.status}
                      </Badge>
                    </div>

                    {/* Customer & Account Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Primary Contact</span>
                        <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                          <User className="w-3 h-3 text-cyan-400" />
                          {cust?.contact || 'Tom Acme'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">{cust?.email || 'tom@acme.demo'}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Negotiation Date</span>
                        <span className="font-semibold text-slate-300 block mt-0.5">
                          {new Date(neg.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-400">Updated: {new Date(neg.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Reapproval Status</span>
                        <span className={`font-bold block mt-0.5 ${neg.triggeredReapproval ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {neg.triggeredReapproval ? 'Requires Manager Reapproval' : 'Standard Rep Authority'}
                        </span>
                      </div>
                    </div>

                    {/* Requested Changes Breakdown */}
                    {neg.requestedChanges && neg.requestedChanges.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                          Requested Changes & Discount Outliers:
                        </span>
                        <div className="space-y-2">
                          {neg.requestedChanges.map((chg, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div>
                                <span className="font-bold text-white">{chg.productName}</span>
                                {chg.comment && <p className="text-[11px] text-slate-300 mt-0.5">"{chg.comment}"</p>}
                              </div>
                              {chg.requestedDiscount && (
                                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30 text-xs shrink-0">
                                  Requested Discount: {chg.requestedDiscount}%
                                </span>
                              )}
                              {chg.requestedDeliveryDate && (
                                <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30 text-xs shrink-0">
                                  Requested Date: {chg.requestedDeliveryDate}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Previous Message Thread History */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Message History Thread ({neg.messages.length}):
                      </span>

                      <div className="space-y-2.5 max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 scrollbar-thin">
                        {neg.messages.map((msg) => {
                          const isCustomer = msg.senderRole === 'CUSTOMER';

                          return (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-xl text-xs space-y-1 ${
                                isCustomer
                                  ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 ml-0 mr-6'
                                  : 'bg-purple-950/40 border border-purple-500/30 text-purple-200 ml-6 mr-0'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-extrabold text-white flex items-center gap-1.5">
                                  <User className="w-3 h-3 text-slate-400" />
                                  {msg.senderName} ({msg.senderRole})
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-300 text-[11px] leading-relaxed">{msg.message}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reply / Counter-Offer Input */}
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Reply to ${neg.customerName}...`}
                        value={selectedNegId === neg.id ? replyText : ''}
                        onFocus={() => setSelectedNegId(neg.id)}
                        onChange={(e) => {
                          setSelectedNegId(neg.id);
                          setReplyText(e.target.value);
                        }}
                        className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                        onClick={() => handleSendReply(neg.id)}
                      >
                        Send Reply
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
