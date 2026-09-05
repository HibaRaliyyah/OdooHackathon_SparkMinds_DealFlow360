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
} from 'lucide-react';

export function SalesRepDashboard() {
  const { quotations, customers, products, negotiations, fulfillmentOrders, addNegotiation, updateNegotiation } = useStore();

  const [showNegotiationsModal, setShowNegotiationsModal] = useState(false);
  const [selectedNegId, setSelectedNegId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

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

  return (
    <div className="space-y-8">
      {/* Sales Rep Hero Banner */}
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
            <Button
              variant="outline"
              size="lg"
              leftIcon={<MessageSquare className="w-4 h-4 text-cyan-400" />}
              onClick={() => setShowNegotiationsModal(true)}
              className="border-cyan-500/30 text-white hover:bg-cyan-950/40"
            >
              Negotiations ({negotiations.length})
            </Button>
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
              {negotiations.length} Requests
            </div>
            <div className="text-xs text-cyan-400 font-semibold mt-2">Counter-Offers Pending Response</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Acme, Beta, Delta & Zenith</span>
            <button
              onClick={() => setShowNegotiationsModal(true)}
              className="text-cyan-400 hover:underline text-xs font-bold cursor-pointer"
            >
              View All →
            </button>
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
            <Link href="/quotations" className="text-purple-400 hover:underline">
              View Upsells →
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
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
                            Customer Tier: <strong className="text-amber-400">{cust?.tier || 'Gold'} Tier</strong> · Assigned Rep: <strong className="text-white">Jasmine Rao</strong>
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
                                  : 'bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 ml-6 mr-0'
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
