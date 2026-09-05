'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BackButton } from '@/components/ui/BackButton';
import {
  RefreshCw,
  Calendar,
  CheckCircle2,
  Building2,
  Crown,
  CreditCard,
  Repeat,
  Sparkles,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  PauseCircle,
  PlayCircle,
  Sliders,
  DollarSign,
  Plus,
  Minus,
} from 'lucide-react';
import type { Subscription, RecurringCycle, SubscriptionStatus } from '@/lib/types';

// Extended Subscription Item for Customer View
interface CustomerSubscriptionView {
  id: string;
  customerId: string;
  customerName: string;
  contactName: string;
  contactEmail: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  quotationNumber: string;
  planName: string;
  status: SubscriptionStatus;
  activeCycle: 'Monthly' | 'Quarterly' | 'Yearly';
  monthlyRate: number;
  quarterlyRate: number;
  yearlyRate: number;
  seats: number;
  nextBillDate: string;
  startDate: string;
  paymentMethod: string;
}

export default function SubscriptionsPage() {
  const { subscriptions, customers, updateSubscription, addActivity } = useStore();

  // Active Billing Frequency Filter Tab
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<'all' | 'Monthly' | 'Quarterly' | 'Yearly'>('all');

  // Selected Subscription for Detail Modal
  const [selectedSubView, setSelectedSubView] = useState<CustomerSubscriptionView | null>(null);

  // Seat modifier for proration inside detail modal
  const [seatCount, setSeatCount] = useState<number>(5);
  const [modalCycle, setModalCycle] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [notice, setNotice] = useState<string>('');

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 6000);
  };

  // Build enriched customer subscription view list combining customers + subscriptions
  const customerSubscriptionViews: CustomerSubscriptionView[] = [
    {
      id: 'sub-1',
      customerId: 'cust-1',
      customerName: 'Acme Corp',
      contactName: 'Tom Acme',
      contactEmail: 'tom@acmecorp.com',
      tier: 'Gold',
      quotationNumber: 'Q-1042',
      planName: 'Enterprise SLA Care Plan (24/7 VIP Support)',
      status: 'Active',
      activeCycle: 'Monthly',
      monthlyRate: 50.60,
      quarterlyRate: 144.00,
      yearlyRate: 520.00,
      seats: 3,
      nextBillDate: '2026-10-01',
      startDate: '2026-09-01',
      paymentMethod: 'Credit Card Auto-Debit',
    },
    {
      id: 'sub-2',
      customerId: 'cust-2',
      customerName: 'Beta Industries',
      contactName: 'Sarah Bet',
      contactEmail: 'sarah@betaind.com',
      tier: 'Silver',
      quotationNumber: 'Q-1039',
      planName: 'Cloud Infrastructure & Managed Maintenance SLA',
      status: 'Active',
      activeCycle: 'Quarterly',
      monthlyRate: 132.00,
      quarterlyRate: 375.00,
      yearlyRate: 1380.00,
      seats: 10,
      nextBillDate: '2026-11-01',
      startDate: '2026-08-01',
      paymentMethod: 'Bank ACH Auto-Pay',
    },
    {
      id: 'sub-3',
      customerId: 'cust-3',
      customerName: 'Nova Retail',
      contactName: 'James Nova',
      contactEmail: 'james@novaretail.com',
      tier: 'Gold',
      quotationNumber: 'Q-1035',
      planName: 'Hardware Fleet Care & Replacement Plan',
      status: 'Paused',
      activeCycle: 'Monthly',
      monthlyRate: 50.60,
      quarterlyRate: 144.00,
      yearlyRate: 520.00,
      seats: 2,
      nextBillDate: '2026-11-01',
      startDate: '2026-06-01',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: 'sub-4',
      customerId: 'cust-4',
      customerName: 'Zenith Co',
      contactName: 'Priya Zen',
      contactEmail: 'priya@zenithco.com',
      tier: 'Bronze',
      quotationNumber: 'Q-1040',
      planName: 'Standard Operations & Software Maintenance',
      status: 'Active',
      activeCycle: 'Yearly',
      monthlyRate: 45.00,
      quarterlyRate: 125.00,
      yearlyRate: 450.00,
      seats: 1,
      nextBillDate: '2027-01-15',
      startDate: '2026-01-15',
      paymentMethod: 'Credit Card Auto-Debit',
    },
    {
      id: 'sub-5',
      customerId: 'cust-5',
      customerName: 'Delta LLC',
      contactName: 'Carlos Del',
      contactEmail: 'carlos@deltallc.com',
      tier: 'Platinum',
      quotationNumber: 'Q-1041',
      planName: 'VIP Executive Premier SLA & Custom API Infrastructure',
      status: 'Active',
      activeCycle: 'Yearly',
      monthlyRate: 250.00,
      quarterlyRate: 700.00,
      yearlyRate: 2500.00,
      seats: 25,
      nextBillDate: '2027-04-01',
      startDate: '2026-04-01',
      paymentMethod: 'Corporate Wire Net 15',
    },
  ];

  // Filter list by billing cycle filter tab
  const filteredSubViews = customerSubscriptionViews.filter((item) => {
    if (selectedCycleFilter === 'all') return true;
    return item.activeCycle === selectedCycleFilter;
  });

  // Calculate high level metrics
  const totalMRR = customerSubscriptionViews.reduce((acc, sub) => acc + sub.monthlyRate * sub.seats, 0);
  const totalARR = totalMRR * 12;
  const activeCount = customerSubscriptionViews.filter((s) => s.status === 'Active').length;

  const handleOpenDetailModal = (subView: CustomerSubscriptionView) => {
    setSelectedSubView(subView);
    setSeatCount(subView.seats);
    setModalCycle(subView.activeCycle);
  };

  const handleToggleStatus = (subView: CustomerSubscriptionView) => {
    const newStatus: SubscriptionStatus = subView.status === 'Active' ? 'Paused' : 'Active';
    showNotice(`Subscription for ${subView.customerName} status updated to ${newStatus.toUpperCase()}.`);
    addActivity({
      id: `act-${Date.now()}`,
      type: 'invoice',
      message: `Admin updated subscription status for ${subView.customerName} to ${newStatus}.`,
      relatedTo: subView.id,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard" label="Dashboard" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Customer Subscriptions & Billing Plans
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Customer account details, subscription tiers, and monthly / quarterly / yearly billing cycles.
            </p>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="text-emerald-400 hover:text-white text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Customer Plans</span>
            <div className="text-xl font-black text-white font-mono mt-1">{activeCount} Accounts</div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block font-semibold">100% Billing Uptime</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly MRR</span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
              ${totalMRR.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Recurring Monthly Revenue</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Annual ARR Run-Rate</span>
            <div className="text-xl font-black text-cyan-400 font-mono mt-1">
              ${totalARR.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-cyan-400/80 mt-0.5 block font-semibold">Contracted Annualized</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Repeat className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Billing Schedules</span>
            <div className="text-xl font-black text-purple-400 font-mono mt-1">3 Frequencies</div>
            <span className="text-[10px] text-purple-300 mt-0.5 block">Monthly, Quarterly, Yearly</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── BILLING FREQUENCY FILTER TABS ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#111827] p-2 rounded-2xl border border-slate-800 gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCycleFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedCycleFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>All Subscription Tiers ({customerSubscriptionViews.length})</span>
          </button>

          <button
            onClick={() => setSelectedCycleFilter('Monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedCycleFilter === 'Monthly'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-300" />
            <span>Monthly Billing ({customerSubscriptionViews.filter((s) => s.activeCycle === 'Monthly').length})</span>
          </button>

          <button
            onClick={() => setSelectedCycleFilter('Quarterly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedCycleFilter === 'Quarterly'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-300" />
            <span>Quarterly Billing ({customerSubscriptionViews.filter((s) => s.activeCycle === 'Quarterly').length})</span>
          </button>

          <button
            onClick={() => setSelectedCycleFilter('Yearly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedCycleFilter === 'Yearly'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-300" />
            <span>Yearly / Annual ({customerSubscriptionViews.filter((s) => s.activeCycle === 'Yearly').length})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium px-3">
          Filter customer subscriptions by billing schedule frequency
        </span>
      </div>

      {/* ─── CUSTOMER SUBSCRIPTIONS LIST / TABLE ─── */}
      <div className="card p-6 bg-[var(--bg-card)] border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Building2 className="w-4.5 h-4.5 text-indigo-400" /> Customer Subscription Accounts & Billing Plans
        </h3>

        <Table
          data={filteredSubViews}
          keyExtractor={(sub) => sub.id}
          onRowClick={(sub) => handleOpenDetailModal(sub)}
          columns={[
            {
              header: 'Customer Details',
              cell: (sub) => (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-xs">{sub.customerName}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        sub.tier === 'Gold'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : sub.tier === 'Platinum'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : sub.tier === 'Silver'
                          ? 'bg-slate-400/20 text-slate-200 border-slate-400/40'
                          : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                      }`}
                    >
                      {sub.tier} Tier
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {sub.contactName}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {sub.contactEmail}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Ref Quotation: <span className="text-indigo-400 font-bold">{sub.quotationNumber}</span>
                  </div>
                </div>
              ),
            },
            {
              header: 'Subscription Plan',
              cell: (sub) => (
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs">{sub.planName}</div>
                  <div className="text-[10px] text-slate-400">
                    Seats: <strong className="text-white font-mono">{sub.seats} units</strong>
                  </div>
                </div>
              ),
            },
            {
              header: 'Billing Frequency Rates',
              cell: (sub) => (
                <div className="space-y-1">
                  {/* Monthly, Quarterly, Yearly Pill Row */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        sub.activeCycle === 'Monthly'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Monthly: ${sub.monthlyRate.toFixed(2)}/mo
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        sub.activeCycle === 'Quarterly'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Quarterly: ${sub.quarterlyRate.toFixed(2)}/qtr
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        sub.activeCycle === 'Yearly'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Yearly: ${sub.yearlyRate.toFixed(2)}/yr
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Active Cycle: <strong className="text-emerald-400">{sub.activeCycle} Billing</strong>
                  </div>
                </div>
              ),
            },
            {
              header: 'Renewal & Payment',
              cell: (sub) => (
                <div className="space-y-0.5 text-xs">
                  <div className="font-mono text-[11px] text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Next: {sub.nextBillDate}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                    <span>{sub.paymentMethod}</span>
                  </div>
                </div>
              ),
            },
            {
              header: 'Status',
              cell: (sub) => (
                <div className="space-y-1">
                  <Badge variant={sub.status === 'Active' ? 'success' : 'neutral'}>{sub.status}</Badge>
                </div>
              ),
            },
            {
              header: 'Actions',
              cell: (sub) => (
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDetailModal(sub)}
                    leftIcon={<Sliders className="w-3.5 h-3.5 text-indigo-400" />}
                  >
                    Manage Plan
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* ─── CUSTOMER SUBSCRIPTION DETAIL MODAL ─── */}
      {selectedSubView && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSubView(null)}
          title={`Customer Subscription — ${selectedSubView.customerName}`}
          subtitle={`${selectedSubView.planName} (${selectedSubView.tier} Tier Account)`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Customer Profile Box */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{selectedSubView.customerName}</h3>
                    <p className="text-xs text-slate-400">
                      Contact: <strong>{selectedSubView.contactName}</strong> ({selectedSubView.contactEmail})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {selectedSubView.tier} Tier Customer
                  </span>
                  <Badge variant={selectedSubView.status === 'Active' ? 'success' : 'neutral'}>
                    {selectedSubView.status}
                  </Badge>
                </div>
              </div>

              {/* Sub Meta Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Quotation Ref</span>
                  <div className="font-mono font-bold text-indigo-400">{selectedSubView.quotationNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Start Date</span>
                  <div className="font-mono text-slate-200">{selectedSubView.startDate}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Next Billing Date</span>
                  <div className="font-mono text-emerald-400 font-bold">{selectedSubView.nextBillDate}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Channel</span>
                  <div className="text-slate-300 font-medium">{selectedSubView.paymentMethod}</div>
                </div>
              </div>
            </div>

            {/* ─── SUBSCRIPTION BILLING FREQUENCY SELECTOR (Monthly vs Quarterly vs Yearly) ─── */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Subscription Billing Schedule Frequency Options
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: Monthly */}
                <div
                  onClick={() => setModalCycle('Monthly')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    modalCycle === 'Monthly'
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-lg ring-1 ring-cyan-400'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Monthly Billing
                    </span>
                    {modalCycle === 'Monthly' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500 text-black">Active</span>
                    )}
                  </div>
                  <div className="text-lg font-black text-cyan-300 font-mono">
                    ${selectedSubView.monthlyRate.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ mo</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Standard monthly recurring invoice issued every 30 days.</p>
                </div>

                {/* Option 2: Quarterly */}
                <div
                  onClick={() => setModalCycle('Quarterly')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    modalCycle === 'Quarterly'
                      ? 'bg-blue-950/50 border-blue-400 shadow-lg ring-1 ring-blue-400'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      Quarterly Billing
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Save 5%
                    </span>
                  </div>
                  <div className="text-lg font-black text-blue-300 font-mono">
                    ${selectedSubView.quarterlyRate.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ qtr</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Quarterly billing cycle billed every 3 months.</p>
                </div>

                {/* Option 3: Yearly */}
                <div
                  onClick={() => setModalCycle('Yearly')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    modalCycle === 'Yearly'
                      ? 'bg-purple-950/50 border-purple-400 shadow-lg ring-1 ring-purple-400'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-400" />
                      Yearly / Annual Billing
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Save 15%
                    </span>
                  </div>
                  <div className="text-lg font-black text-purple-300 font-mono">
                    ${selectedSubView.yearlyRate.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ yr</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Annual lump sum billing with maximum tier discount.</p>
                </div>
              </div>
            </div>

            {/* Mid-Cycle Seat / Capacity Adjuster */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Manage Plan License Seats & Proration
                </span>
                <span className="text-[10px] text-slate-400 font-mono">18 days remaining in current cycle</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-300">Total Contracted Seats:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-white text-base w-8 text-center">{seatCount}</span>
                  <button
                    type="button"
                    onClick={() => setSeatCount(seatCount + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200 flex justify-between items-center">
                <span>Calculated Recurring Amount ({modalCycle}):</span>
                <strong className="font-mono text-emerald-400 text-xs">
                  $
                  {(
                    (modalCycle === 'Monthly'
                      ? selectedSubView.monthlyRate
                      : modalCycle === 'Quarterly'
                      ? selectedSubView.quarterlyRate
                      : selectedSubView.yearlyRate) * seatCount
                  ).toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <Button
                variant={selectedSubView.status === 'Active' ? 'danger' : 'success'}
                size="sm"
                onClick={() => {
                  handleToggleStatus(selectedSubView);
                  setSelectedSubView(null);
                }}
              >
                {selectedSubView.status === 'Active' ? 'Pause Subscription' : 'Activate Subscription'}
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedSubView(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    showNotice(
                      `Updated ${selectedSubView.customerName} subscription schedule to ${modalCycle} (${seatCount} seats).`
                    );
                    setSelectedSubView(null);
                  }}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Save Plan Changes
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
