'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  ShieldAlert,
  Clock,
  TrendingDown,
  Truck,
  ArrowRight,
  Zap,
  CheckCircle2,
  Bell,
  AlertOctagon,
  MessageSquare,
  Mail,
  Send,
  Check,
  Building2,
  Sliders,
  Sparkles,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import type { DealHealthFlag } from '@/lib/types';

export default function DealHealthPage() {
  const { dealHealthFlags, quotations, addActivity, addNotification, currentUser } = useStore();

  // Active Notice Banner
  const [escalatedNotice, setEscalatedNotice] = useState('');

  // Selected Flag for Action Choice Modal
  const [selectedFlag, setSelectedFlag] = useState<DealHealthFlag | null>(null);

  // Target Destination: 'nudge' (Sales Rep) | 'escalate' (Sales Manager)
  const [actionTarget, setActionTarget] = useState<'nudge' | 'escalate'>('nudge');

  // Track dispatched flag IDs in local state for live UI updates
  const [dispatchedFlags, setDispatchedFlags] = useState<Record<string, string>>({});

  // Modal Channels Selection State
  const [sendSlack, setSendSlack] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);
  const [sendCalendar, setSendCalendar] = useState(true);
  const [nudgeMessage, setNudgeMessage] = useState('');

  const handleOpenNudgeModal = (flag: DealHealthFlag) => {
    const q = quotations.find((item) => item.id === flag.quotationId);
    const qNum = q?.quoteNumber || flag.quotationNumber || flag.quotationId;
    const repName = q?.assignedTo || 'Jasmine Rao';

    const defaultTarget = flag.severity === 'HIGH' || flag.type === 'Discount Anomaly' ? 'escalate' : 'nudge';
    setActionTarget(defaultTarget);
    setSelectedFlag(flag);

    if (defaultTarget === 'escalate') {
      setNudgeMessage(
        `HIGH RISK ESCALATION: Quotation #${qNum} for ${flag.customerName} requires executive Sales Manager review. Anomaly: ${flag.description}. Please intervene or override margin limits.`
      );
    } else {
      setNudgeMessage(
        `TELEMETRY NUDGE to ${repName}: Quotation #${qNum} for ${flag.customerName} requires attention. Root Cause: ${flag.description}. Please re-engage customer within 24 hours.`
      );
    }
  };

  const handleTargetChange = (target: 'nudge' | 'escalate') => {
    setActionTarget(target);
    if (!selectedFlag) return;

    const q = quotations.find((item) => item.id === selectedFlag.quotationId);
    const qNum = q?.quoteNumber || selectedFlag.quotationNumber || selectedFlag.quotationId;
    const repName = q?.assignedTo || 'Jasmine Rao';

    if (target === 'escalate') {
      setNudgeMessage(
        `HIGH RISK ESCALATION: Quotation #${qNum} for ${selectedFlag.customerName} requires executive Sales Manager review. Anomaly: ${selectedFlag.description}. Please intervene or override margin limits.`
      );
    } else {
      setNudgeMessage(
        `TELEMETRY NUDGE to ${repName}: Quotation #${qNum} for ${selectedFlag.customerName} requires attention. Root Cause: ${selectedFlag.description}. Please re-engage customer within 24 hours.`
      );
    }
  };

  const handleDispatchNudge = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFlag) return;

    const q = quotations.find((item) => item.id === selectedFlag.quotationId);
    const qNum = q?.quoteNumber || selectedFlag.quotationNumber || selectedFlag.quotationId;
    const repName = q?.assignedTo || 'Jasmine Rao';
    const managerName = 'Sales Manager';

    if (actionTarget === 'nudge') {
      const statusText = `Nudge sent to ${repName}`;

      addActivity({
        id: `act-${Date.now()}`,
        type: 'alert',
        message: `Telemetry Nudge dispatched to Sales Rep ${repName} for Quote #${qNum} (${selectedFlag.customerName}).`,
        relatedTo: selectedFlag.id,
        timestamp: new Date().toISOString(),
      });

      addNotification({
        id: `notif-${Date.now()}`,
        userId: 'user-2', // Sales Rep
        title: `Telemetry Nudge Received (${repName})`,
        message: `Quote #${qNum}: ${selectedFlag.description}`,
        type: 'warning',
        read: false,
        createdAt: new Date().toISOString(),
      });

      setDispatchedFlags((prev) => ({
        ...prev,
        [selectedFlag.id]: statusText,
      }));

      setEscalatedNotice(
        `Telemetry Nudge successfully dispatched to Sales Rep ${repName} for Quote #${qNum} via Slack & Email!`
      );
    } else {
      const statusText = 'Escalated to Sales Manager';

      addActivity({
        id: `act-${Date.now()}`,
        type: 'approval',
        message: `Deal Anomaly Quote #${qNum} (${selectedFlag.customerName}) escalated to Sales Manager for executive intervention.`,
        relatedTo: selectedFlag.id,
        timestamp: new Date().toISOString(),
      });

      addNotification({
        id: `notif-${Date.now()}`,
        userId: 'user-1', // Sales Manager
        title: `Urgent Escalation to Sales Manager`,
        message: `High-Risk Deal Anomaly on Quote #${qNum} (${selectedFlag.customerName}): ${selectedFlag.description}`,
        type: 'error',
        read: false,
        createdAt: new Date().toISOString(),
      });

      setDispatchedFlags((prev) => ({
        ...prev,
        [selectedFlag.id]: statusText,
      }));

      setEscalatedNotice(
        `Deal Anomaly Quote #${qNum} (${selectedFlag.customerName}) successfully escalated to Sales Manager!`
      );
    }

    setSelectedFlag(null);
    setTimeout(() => setEscalatedNotice(''), 7000);
  };

  // Telemetry Aggregation Metrics
  const highRiskFlags = dealHealthFlags.filter((f) => f.severity === 'HIGH');
  const stalledQuotes = dealHealthFlags.filter((f) => f.type === 'Stalled');
  const discountAnomalies = dealHealthFlags.filter((f) => f.type === 'Discount Anomaly');
  const deliverySlippages = dealHealthFlags.filter((f) => f.type === 'Delivery Slippage');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BackButton href="/dashboard" label="Dashboard" />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              A6 Deal Health Telemetry & Anomaly Radar
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
          Deal Health Telemetry & Anomaly Radar
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated rule engine detecting stalled deals, discount threshold breaches, delivery slippages, and multi-warehouse risks.
        </p>
      </div>

      {/* Global Notification Banner */}
      {escalatedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{escalatedNotice}</span>
          </div>
          <button
            onClick={() => setEscalatedNotice('')}
            className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-1 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Anomaly Telemetry Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Stalled Deals */}
        <div className="card p-6 bg-[var(--bg-card)] border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-4 h-4" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">Stalled Quote Telemetry</h3>
            </div>
            <Badge variant="warning">{stalledQuotes.length} Alert(s)</Badge>
          </div>
          <div className="text-2xl font-black font-mono text-amber-300">{stalledQuotes.length} Deals Idle</div>
          <p className="text-[11px] text-slate-400">Quotes pending without customer activity exceeding 7 days threshold.</p>
        </div>

        {/* Card 2: Discount Anomalies */}
        <div className="card p-6 bg-[var(--bg-card)] border border-rose-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <TrendingDown className="w-4 h-4" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">Discount Anomaly Radar</h3>
            </div>
            <Badge variant="danger">{discountAnomalies.length} Flagged</Badge>
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">{discountAnomalies.length} High Breach</div>
          <p className="text-[11px] text-slate-400">Discounts significantly above rep historical average (2.5x standard).</p>
        </div>

        {/* Card 3: Delivery Slippage */}
        <div className="card p-6 bg-[var(--bg-card)] border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400">
              <Truck className="w-4 h-4" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">Delivery Promise Slippage</h3>
            </div>
            <Badge variant="info">{deliverySlippages.length} Orders</Badge>
          </div>
          <div className="text-2xl font-black font-mono text-indigo-300">{deliverySlippages.length} Shipments</div>
          <p className="text-[11px] text-slate-400">Warehouse inventory status requiring ETA recalibration.</p>
        </div>
      </div>

      {/* Active Anomaly Alerts Table */}
      <div className="card p-6 bg-[var(--bg-card)] border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Active Anomaly Alerts & Escalation Center
          </h2>
          <span className="text-xs text-slate-400">
            Click action button to select Telemetry Nudge (Sales Rep) or Escalation (Sales Manager)
          </span>
        </div>

        <Table
          data={dealHealthFlags}
          keyExtractor={(f) => f.id}
          minWidth="1150px"
          columns={[
            {
              header: 'Quotation #',
              cell: (f) => {
                const q = quotations.find((item) => item.id === f.quotationId);
                const qNum = q?.quoteNumber || f.quotationNumber || f.quotationId;
                return (
                  <Link href={`/quotations/${f.quotationId}`} className="group block">
                    <span className="font-mono font-bold text-xs text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                      {qNum} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <div className="text-[10px] text-slate-400">{f.customerName}</div>
                  </Link>
                );
              },
            },
            {
              header: 'Anomaly Category',
              cell: (f) => (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {f.type}
                </span>
              ),
            },
            {
              header: 'Severity',
              cell: (f) => (
                <Badge variant={f.severity === 'HIGH' ? 'danger' : 'warning'}>
                  {f.severity} RISK
                </Badge>
              ),
            },
            {
              header: 'Description & Telemetry Root Cause',
              cell: (f) => (
                <div>
                  <div className="text-xs font-semibold text-slate-200">{f.description}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Detected: {new Date(f.detectedAt).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] font-medium text-amber-400 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3 text-amber-400" />
                    <span>{dispatchedFlags[f.id] || f.actionTaken || 'Nudge / Escalation Available'}</span>
                  </div>
                </div>
              ),
            },
            {
              header: 'Automated Actions',
              cell: (f) => {
                const q = quotations.find((item) => item.id === f.quotationId);
                const repName = q?.assignedTo || 'Jasmine Rao';
                const actionLabel = dispatchedFlags[f.id] || f.actionTaken || `Nudge / Escalate`;
                const isDispatched = Boolean(dispatchedFlags[f.id] || f.actionTaken);
                const isEscalated = actionLabel.toLowerCase().includes('manager') || actionLabel.toLowerCase().includes('escalat');

                return (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenNudgeModal(f)}
                      title="Click to select Nudge to Sales Rep or Escalation to Sales Manager"
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-md active:scale-95 ${
                        isDispatched
                          ? isEscalated
                            ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40 hover:border-rose-500/60'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40 hover:border-emerald-500/60'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 hover:border-amber-500/60'
                      }`}
                    >
                      <Bell className={`w-3.5 h-3.5 ${isEscalated ? 'text-rose-400' : isDispatched ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
                      <span>{actionLabel}</span>
                    </button>

                    <Link href={`/quotations/${f.quotationId}`}>
                      <Button size="sm" variant="primary">
                        Open Deal
                      </Button>
                    </Link>
                  </div>
                );
              },
            },
          ]}
        />
      </div>

      {/* ─── ACTION DESTINATION CHOICE MODAL (NUDGE vs ESCALATION) ─── */}
      {selectedFlag && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedFlag(null)}
          title={`Action Dispatch Center — ${selectedFlag.customerName}`}
          subtitle={`Deal Health Anomaly Alert: ${selectedFlag.type} (${selectedFlag.severity} RISK)`}
          maxWidth="lg"
        >
          <form onSubmit={handleDispatchNudge} className="space-y-5">
            {/* Anomaly Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  {selectedFlag.description}
                </span>
                <Badge variant={selectedFlag.severity === 'HIGH' ? 'danger' : 'warning'}>
                  {selectedFlag.severity} RISK
                </Badge>
              </div>
              <p className="text-slate-400">
                Telemetry detected anomaly on Quote #{quotations.find((q) => q.id === selectedFlag.quotationId)?.quoteNumber || selectedFlag.quotationNumber}. Choose operational action below.
              </p>
            </div>

            {/* ACTION TARGET CHOICE CARDS (Sales Rep Nudge vs Sales Manager Escalation) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                Select Operational Action & Recipient
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Nudge to Sales Rep */}
                <div
                  onClick={() => handleTargetChange('nudge')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    actionTarget === 'nudge'
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      Nudge Sales Rep
                    </span>
                    <input
                      type="radio"
                      name="actionTarget"
                      checked={actionTarget === 'nudge'}
                      onChange={() => handleTargetChange('nudge')}
                      className="text-amber-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Triggers direct telemetry notification to Sales Rep <strong>({quotations.find((q) => q.id === selectedFlag.quotationId)?.assignedTo || 'Jasmine Rao'})</strong> requesting customer re-engagement.
                  </p>
                </div>

                {/* Option 2: Escalate to Sales Manager */}
                <div
                  onClick={() => handleTargetChange('escalate')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    actionTarget === 'escalate'
                      ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg ring-1 ring-rose-500/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-xs text-rose-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-rose-400" />
                      Escalate to Sales Manager
                    </span>
                    <input
                      type="radio"
                      name="actionTarget"
                      checked={actionTarget === 'escalate'}
                      onChange={() => handleTargetChange('escalate')}
                      className="text-rose-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Escalates high-risk anomaly to Sales Manager for executive intervention, margin override, or discount review.
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Channels Checklist */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                Dispatch Communication Channels
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    sendSlack ? 'bg-indigo-950/50 border-indigo-500 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sendSlack}
                    onChange={(e) => setSendSlack(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold flex items-center gap-1 text-xs">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Slack DM Alert
                    </div>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    sendEmail ? 'bg-indigo-950/50 border-indigo-500 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold flex items-center gap-1 text-xs">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Telemetry
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Message Text Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Action Message & Context</label>
              <textarea
                rows={3}
                value={nudgeMessage}
                onChange={(e) => setNudgeMessage(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedFlag(null)}>
                Cancel
              </Button>
              <Button
                variant={actionTarget === 'escalate' ? 'danger' : 'primary'}
                size="sm"
                type="submit"
                leftIcon={<Send className="w-4 h-4" />}
              >
                {actionTarget === 'escalate' ? 'Escalate to Sales Manager' : 'Send Nudge to Sales Rep'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
