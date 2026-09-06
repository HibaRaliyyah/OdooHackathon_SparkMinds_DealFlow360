'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
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
  Building2,
  User,
  Send,
  Check,
  Search,
  AlertCircle,
  Bell,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export function SalesRepDashboard() {
  const {
    quotations,
    customers,
    products,
    negotiations,
    fulfillmentOrders,
    dealHealthFlags,
    notifications,
    addActivity,
    addNotification,
    currentUser,
    updateNegotiation,
  } = useStore();

  const [showNegotiationsModal, setShowNegotiationsModal] = useState(false);
  const [selectedNegId, setSelectedNegId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Local state for Sales Rep Telemetry Nudge re-engagements
  const [reEngagedFlags, setReEngagedFlags] = useState<Record<string, string>>({});
  const [reEngageSuccessMsg, setReEngageSuccessMsg] = useState('');

  const handleReEngageCustomer = (flagId: string, quoteNum: string, custName: string) => {
    const statusText = `✓ Customer Re-engaged by Jasmine Rao`;
    setReEngagedFlags((prev) => ({
      ...prev,
      [flagId]: statusText,
    }));

    addActivity({
      id: `act-${Date.now()}`,
      type: 'alert',
      message: `Jasmine Rao re-engaged customer ${custName} for Quote #${quoteNum} following Telemetry Nudge.`,
      relatedTo: flagId,
      timestamp: new Date().toISOString(),
    });

    addNotification({
      id: `notif-${Date.now()}`,
      userId: 'user-3', // Sales Manager
      title: `Telemetry Nudge Resolved by Rep`,
      message: `Jasmine Rao re-engaged ${custName} on Quote #${quoteNum}.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    });

    setReEngageSuccessMsg(`Successfully logged re-engagement activity for ${custName} (Quote #${quoteNum})!`);
    setTimeout(() => setReEngageSuccessMsg(''), 6000);
  };

  const activeQuotations = quotations.filter((q) => q.stage !== 'Cancelled' && q.stage !== 'Rejected');
  const pipelineValue = activeQuotations.reduce((acc, q) => acc + q.oneTimeTotal + q.recurringTotal, 0);
  const openNegotiations = negotiations.filter((n) => n.status === 'Open' || n.status === 'Counter-Offered');

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

  const handleSendReply = (negId: string) => {
    if (!replyText.trim()) return;

    const targetNeg = negotiations.find((n) => n.id === negId);
    if (!targetNeg) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      negotiationId: negId,
      senderId: 'user-2',
      senderName: 'Jasmine Rao',
      senderRole: 'SALES_REP' as const,
      message: replyText.trim(),
      timestamp: new Date().toISOString(),
    };

    updateNegotiation(negId, {
      messages: [...targetNeg.messages, newMsg],
      status: 'Counter-Offered',
    });

    setReplyText('');
  };

  const filteredNegotiations = negotiations.filter((n) =>
    (n.customerName || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (n.quotationNumber || '').toLowerCase().includes(searchFilter.toLowerCase())
  );
  const incomingCustomerMsgsCount = (negotiations || []).reduce(
    (acc, neg) => acc + (neg.messages || []).filter((m) => m.senderRole === 'CUSTOMER' && m.read === false).length,
    0
  );
  const unreadCustNotifsCount = (notifications || []).filter(
    (n) => !n.read && (n.title.includes('Negotiation') || n.title.includes('Customer'))
  ).length;

  const totalIncomingNegBadge = incomingCustomerMsgsCount > 0 ? incomingCustomerMsgsCount : unreadCustNotifsCount > 0 ? unreadCustNotifsCount : openNegotiations.length;

  return (
    <div className="space-y-8">
      {/* Sales Rep Hero Banner */}
      <div className="relative overflow-hidden bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-700" /> Sales Representative Console
              </span>
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                CPQ & Customer Negotiations
              </span>
              {totalIncomingNegBadge > 0 && (
                <span className="px-2.5 py-1 text-[10px] font-mono font-black uppercase rounded-full bg-purple-600 text-white border border-purple-300 flex items-center gap-1 animate-pulse shadow-sm">
                  <MessageSquare className="w-3 h-3 text-white" /> {totalIncomingNegBadge} Incoming Message{totalIncomingNegBadge > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              Quotation Builder, Upsell & Deal Operations
            </h1>
            <p className="text-xs text-slate-700 font-medium mt-1 max-w-xl">
              Build custom quotations with dynamic discounts and AI upsell items, monitor approval statuses and fulfillment progress, and respond to customer negotiations.
            </p>

            {/* Sales Rep Duties Checklist */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-200 text-xs text-slate-700 font-medium">
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Builds Quotations, Applies Discounts, Adds Upsell Items
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Tracks Approval Status & Fulfillment Progress
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Responds to Customer Negotiation Requests
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              leftIcon={<MessageSquare className="w-4 h-4 text-purple-700" />}
              onClick={() => setShowNegotiationsModal(true)}
              className="bg-white border-slate-300 text-slate-900 hover:bg-slate-100 font-bold relative"
            >
              <span>Negotiations ({negotiations.length})</span>
              {totalIncomingNegBadge > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-purple-600 text-white animate-pulse border border-purple-200">
                  {totalIncomingNegBadge} New
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Active Pipeline */}
        <div className="card p-6 bg-white border border-slate-200 shadow-sm hover:border-amber-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">My Active Pipeline</span>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-slate-900 tracking-tight">
              ${pipelineValue.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{activeQuotations.length} Active Deals</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-700 font-medium">
            <span>Target: $500k</span>
            <span className="text-amber-800 font-bold">84% of Goal</span>
          </div>
        </div>

        {/* KPI 2: Customer Negotiations */}
        <div className="card p-6 bg-white border border-slate-200 shadow-sm hover:border-purple-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Customer Negotiations</span>
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800 border border-purple-300">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-slate-900 tracking-tight">
              {negotiations.length} Requests
            </div>
            <div className="text-xs text-purple-800 font-bold mt-2">Counter-Offers Pending Response</div>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-700 font-medium">
            <span>Acme, Beta, Delta & Zenith</span>
            <button
              onClick={() => setShowNegotiationsModal(true)}
              className="text-purple-700 hover:underline text-xs font-bold cursor-pointer"
            >
              View All →
            </button>
          </div>
        </div>

        {/* KPI 3: Fulfillment Progress */}
        <div className="card p-6 bg-white border border-slate-200 shadow-sm hover:border-emerald-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Fulfillment Tracking</span>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-slate-900 tracking-tight">{fulfillmentOrders.length} Orders</div>
            <div className="text-xs text-emerald-800 font-bold mt-2">Main Hub & East Depot Splits</div>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-700 font-medium">
            <span>Partial Shipments</span>
            <Link href="/fulfillment" className="text-emerald-700 hover:underline font-bold">
              Track Status →
            </Link>
          </div>
        </div>

        {/* KPI 4: AI Upsell Recommendations */}
        <div className="card p-6 bg-white border border-slate-200 shadow-sm hover:border-purple-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">AI Upsell & Cross-Sell</span>
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800 border border-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-purple-900 tracking-tight">Active</div>
            <div className="text-xs text-purple-800 font-bold mt-2">Care Plans & Docking Accessories</div>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-700 font-medium">
            <span>AI Margin Helper</span>
            <Link href="/quotations" className="text-purple-700 hover:underline font-bold">
              View Upsells →
            </Link>
          </div>
        </div>
      </div>

      {/* Global Telemetry Re-engagement Success Banner */}
      {reEngageSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{reEngageSuccessMsg}</span>
          </div>
          <button
            onClick={() => setReEngageSuccessMsg('')}
            className="text-emerald-800 hover:text-emerald-950 text-xs font-bold px-2 py-1 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── ACTIVE TELEMETRY NUDGES & ANOMALY ALERTS (SALES REP CONSOLE) ─── */}
      <div className="card p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600 animate-pulse" />
              Active Telemetry Nudges & Deal Anomaly Alerts
            </h3>
            <p className="text-xs text-slate-700 font-medium mt-0.5">
              Real-time telemetry nudges dispatched to Sales Rep (Jasmine Rao) requesting customer re-engagement
            </p>
          </div>
          <Link href="/deal-health">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Anomaly Radar
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(dealHealthFlags || []).map((f) => {
            const q = quotations.find((item) => item.id === f.quotationId);
            const qNum = q?.quoteNumber || f.quotationNumber || f.quotationId;
            const currentStatus = reEngagedFlags[f.id] || f.actionTaken || `Nudge sent to Jasmine Rao`;
            const isReEngaged = currentStatus.includes('Re-engaged') || currentStatus.includes('Resolved');

            return (
              <div
                key={f.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isReEngaged
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-xs text-slate-900">Quote #{qNum}</span>
                    <span className="text-xs text-slate-800 font-bold">({f.customerName})</span>
                  </div>
                  <Badge variant={f.severity === 'HIGH' ? 'danger' : 'warning'}>
                    {f.severity} RISK
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-extrabold text-slate-900 leading-snug">{f.description}</p>
                  <div className="text-[10px] text-slate-700 font-mono font-bold mt-1">
                    Detected: {new Date(f.detectedAt).toLocaleDateString()} · Category: {f.type}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 ${
                      isReEngaged
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {isReEngaged ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Bell className="w-3.5 h-3.5 text-amber-700" />
                    )}
                    <span>{currentStatus}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {!isReEngaged && (
                      <button
                        onClick={() => handleReEngageCustomer(f.id, qNum, f.customerName)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
                      >
                        <Send className="w-3 h-3 text-white" />
                        <span>Re-engage Customer</span>
                      </button>
                    )}

                    <Link href={`/quotations/${f.quotationId}`}>
                      <Button size="sm" variant="outline">
                        Open Deal
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Quotations Table */}
      <div className="card p-6 bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              My Active Quotations & Proposals
            </h3>
            <p className="text-xs text-slate-700 font-medium">Track deal stages, customer negotiations, and blended risk ratings</p>
          </div>
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
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* List of Previous Negotiations */}
            <div className="space-y-5 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredNegotiations.map((neg) => {
                const cust = customers.find((c) => c.id === neg.customerId);
                const isSelected = selectedNegId === neg.id;

                return (
                  <div
                    key={neg.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm hover:border-purple-300 transition-all"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800 border border-purple-300">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{neg.customerName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
                              Quote #{neg.quotationNumber}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-700 font-medium">
                            Customer Tier: <strong className="text-amber-800 font-extrabold">{cust?.tier || 'Gold'} Tier</strong> · Assigned Rep: <strong className="text-slate-900 font-bold">Jasmine Rao</strong>
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-sm">
                      <div>
                        <span className="text-[10px] text-slate-700 uppercase font-extrabold block">Primary Contact</span>
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                          <User className="w-3 h-3 text-purple-700" />
                          {cust?.contact || 'Tom Acme'}
                        </span>
                        <span className="text-[10px] text-slate-700 block font-mono font-medium">{cust?.email || 'tom@acme.demo'}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-700 uppercase font-extrabold block">Negotiation Date</span>
                        <span className="font-bold text-slate-900 block mt-0.5">
                          {new Date(neg.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-700 font-medium">Updated: {new Date(neg.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-700 uppercase font-extrabold block">Reapproval Status</span>
                        <span className={`font-bold block mt-0.5 ${neg.triggeredReapproval ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {neg.triggeredReapproval ? 'Requires Manager Reapproval' : 'Standard Rep Authority'}
                        </span>
                      </div>
                    </div>

                    {/* Requested Changes Breakdown */}
                    {neg.requestedChanges && neg.requestedChanges.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 block">
                          Requested Changes & Discount Outliers:
                        </span>
                        <div className="space-y-2">
                          {neg.requestedChanges.map((chg, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                            >
                              <div>
                                <span className="font-extrabold text-slate-900">{chg.productName}</span>
                                {chg.comment && <p className="text-[11px] text-slate-800 font-medium mt-0.5">"{chg.comment}"</p>}
                              </div>
                              {chg.requestedDiscount && (
                                <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-mono font-extrabold border border-amber-300 text-xs shrink-0">
                                  Requested Discount: {chg.requestedDiscount}%
                                </span>
                              )}
                              {chg.requestedDeliveryDate && (
                                <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-900 font-mono font-extrabold border border-indigo-300 text-xs shrink-0">
                                  Requested Date: {chg.requestedDeliveryDate}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Previous Message Thread History */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                        Message History Thread ({neg.messages.length}):
                      </span>

                      <div className="space-y-2.5 max-h-48 overflow-y-auto p-3 rounded-xl bg-white border border-slate-200 scrollbar-thin shadow-sm">
                        {neg.messages.map((msg) => {
                          const isCustomer = msg.senderRole === 'CUSTOMER';

                          return (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-xl text-xs space-y-1 ${
                                isCustomer
                                  ? 'bg-purple-50 border border-purple-200 text-slate-900 ml-0 mr-6'
                                  : 'bg-slate-100 border border-slate-200 text-slate-900 ml-6 mr-0'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                  <User className="w-3 h-3 text-purple-600" />
                                  {msg.senderName} ({msg.senderRole})
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono font-medium">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-800 text-[11px] font-medium leading-relaxed">{msg.message}</p>
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
                        className="flex-1 text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-indigo-500"
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
