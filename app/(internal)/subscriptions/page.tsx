'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  RefreshCw,
  Calculator,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Receipt,
  XCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function SubscriptionsPage() {
  const { subscriptions, updateSubscription, addActivity } = useStore();
  const [selectedSubId, setSelectedSubId] = useState<string>('sub-1');
  const [prorationNotice, setProrationNotice] = useState<string>('');
  const [qtyModifier, setQtyModifier] = useState<number>(10);

  const currentSub = subscriptions.find((s) => s.id === selectedSubId) || subscriptions[0];

  const handleProrationChange = (newQty: number) => {
    setQtyModifier(newQty);
    const unitPrice = 46;
    const previousAmount = currentSub?.currentAmount || 460;
    const newAmount = unitPrice * newQty;
    const remainingDaysInCycle = 18;
    const dailyDelta = (newAmount - previousAmount) / 30;
    const prorationCreditOrCharge = Math.round(dailyDelta * remainingDaysInCycle);

    if (currentSub) {
      updateSubscription(currentSub.id, { currentAmount: newAmount });
    }

    setProrationNotice(
      `Mid-cycle quantity adjusted to ${newQty} units. Prorated difference for remaining 18 days: ${
        prorationCreditOrCharge >= 0 ? `+$${prorationCreditOrCharge} charge` : `-$${Math.abs(prorationCreditOrCharge)} credit note generated`
      }.`
    );
    setTimeout(() => setProrationNotice(''), 8000);
  };

  const handleCancelWithRefund = (subId: string) => {
    updateSubscription(subId, { status: 'Cancelled' });
    addActivity({
      id: `act-${Date.now()}`,
      type: 'invoice',
      message: `Subscription ${subId} cancelled mid-cycle. Automatic prorated partial refund of $276 credit note issued.`,
      relatedTo: subId,
      timestamp: new Date().toISOString(),
    });
    setProrationNotice(`Subscription cancelled. Automatic prorated refund credit note of $276 issued to customer balance.`);
    setTimeout(() => setProrationNotice(''), 8000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BackButton href="/dashboard" label="Dashboard" />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              B7 Subscription & Billing Management
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
          Recurring Subscriptions & Mid-Cycle Proration Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Separates one-time lines from recurring lines, displays upcoming billing schedules, and manages mid-cycle proration & credit note refunds.
        </p>
      </div>

      {prorationNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{prorationNotice}</span>
        </div>
      )}

      {/* Subscription & Order Separation View */}
      <div className="card p-6 bg-[var(--bg-card)] border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-cyan-400" /> Active Contract Billing Structure (Quote #{currentSub?.quotationNumber || 'Q-1042'})
            </h3>
            <p className="text-xs text-slate-400">{currentSub?.customerName || 'Acme Corp'}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={currentSub?.status === 'Active' ? 'success' : 'neutral'}>{currentSub?.status || 'Active'}</Badge>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleCancelWithRefund(currentSub?.id || 'sub-1')}
              leftIcon={<XCircle className="w-3.5 h-3.5" />}
            >
              Cancel & Issue Credit Note
            </Button>
          </div>
        </div>

        {/* Separated Lines: One-Time vs Recurring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Box 1: One-Time Hardware & Services Lines */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                1. One-Time Order Lines (Billed upon delivery)
              </span>
              <Badge variant="info">One-Time</Badge>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Laptop Pro 14 (12 units)</span>
                <span className="font-mono font-bold text-white">$14,400.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Onsite Setup Service (1 unit)</span>
                <span className="font-mono font-bold text-white">$450.00</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-slate-200">
                <span>One-Time Subtotal:</span>
                <span className="font-mono text-emerald-400">$14,850.00</span>
              </div>
            </div>
          </div>

          {/* Box 2: Recurring Subscription Lines */}
          <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-cyan-500/30">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                2. Recurring Subscription Lines (Auto-Scheduled)
              </span>
              <Badge variant="purple">Recurring</Badge>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">{currentSub?.plan || 'Care Plan 2yr'} ({qtyModifier} units)</span>
                <span className="font-mono font-bold text-cyan-300">${currentSub?.currentAmount || 460}.00 / month</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Billing Frequency:</span>
                <span className="font-mono font-bold text-white">Monthly ({currentSub?.cycle || 'Monthly'})</span>
              </div>
              <div className="pt-2 border-t border-cyan-500/30 flex justify-between font-bold text-slate-200">
                <span>Recurring Monthly Total:</span>
                <span className="font-mono text-cyan-300">${currentSub?.currentAmount || 460}.00/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mid-Cycle Proration Calculator Controls */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-extrabold text-white">Mid-Cycle Quantity & Proration Adjustment</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">18 days remaining in current 30-day cycle</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-300">Adjust Plan Unit Seats:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleProrationChange(Math.max(1, qtyModifier - 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-white text-sm w-12 text-center">{qtyModifier}</span>
              <button
                onClick={() => handleProrationChange(qtyModifier + 1)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-slate-400 text-[11px]">(Clicking +/- triggers automated daily proration math)</span>
          </div>
        </div>

        {/* Upcoming Billing Schedule */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Upcoming Recurring Billing Schedule
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { date: 'Oct 01, 2026', amount: `$${currentSub?.currentAmount || 460}.00`, status: 'Scheduled Auto-Debit' },
              { date: 'Nov 01, 2026', amount: `$${currentSub?.currentAmount || 460}.00`, status: 'Scheduled' },
              { date: 'Dec 01, 2026', amount: `$${currentSub?.currentAmount || 460}.00`, status: 'Scheduled' },
            ].map((cycle, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-white">{cycle.date}</span>
                <div className="font-mono font-bold text-cyan-300">{cycle.amount}</div>
                <div className="text-[10px] text-emerald-400 font-medium">{cycle.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
