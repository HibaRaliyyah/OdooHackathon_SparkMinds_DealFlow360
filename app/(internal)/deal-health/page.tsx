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
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import type { DealHealthFlag } from '@/lib/types';

export default function DealHealthPage() {
  const { dealHealthFlags, quotations, addActivity, addNotification, currentUser } = useStore();

  const canTriggerNudge = currentUser?.role === 'SALES_MANAGER' || currentUser?.role === 'ADMIN';

  // Active Notice Banner
  const [escalatedNotice, setEscalatedNotice] = useState('');

  // Selected Flag for Escalation Modal
  const [selectedFlag, setSelectedFlag] = useState<DealHealthFlag | null>(null);

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

    setSelectedFlag(flag);
    setNudgeMessage(
      `URGENT DEAL ESCALATION: Quotation #${qNum} for ${flag.customerName} requires immediate review. Root Cause: ${flag.description}. Please re-engage customer or adjust margin settings within 24 hours.`
    );
  };

  const handleDispatchNudge = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFlag) return;

    const q = quotations.find((item) => item.id === selectedFlag.quotationId);
    const qNum = q?.quoteNumber || selectedFlag.quotationNumber || selectedFlag.quotationId;
    const repName = q?.assignedTo || 'Jasmine Rao';
    const statusText = `Nudge sent to ${repName}`;

    // Add activity log
    addActivity({
      id: `act-${Date.now()}`,
      type: 'alert',
      message: `Automated Slack/Email escalation nudge dispatched to ${repName} for Quote #${qNum} (${selectedFlag.customerName}).`,
      relatedTo: selectedFlag.id,
      timestamp: new Date().toISOString(),
    });

    // Add system notification
    addNotification({
      id: `notif-${Date.now()}`,
      userId: 'user-2',
      title: `Escalation Nudge Sent to ${repName}`,
      message: `Deal Health Alert (${selectedFlag.type}): ${selectedFlag.description}`,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Mark flag as dispatched with rep name status
    setDispatchedFlags((prev) => ({
      ...prev,
      [selectedFlag.id]: statusText,
    }));

    setEscalatedNotice(
      `Automated escalation nudge successfully dispatched to ${repName} for Quote #${qNum} (${selectedFlag.customerName}) via Slack & Email!`
    );
    setSelectedFlag(null);
    setTimeout(() => setEscalatedNotice(''), 7000);
  };

  // Helper to resolve user-role appropriate status badge text & styling
  const getFlagStatusInfo = (f: DealHealthFlag) => {
    const q = quotations.find((item) => item.id === f.quotationId);
    const repName = q?.assignedTo || 'Jasmine Rao';

    if (!canTriggerNudge) {
      // Sales Rep view: Nudges are submitted to the rep to follow up & evaluate
      if (f.severity === 'HIGH') {
        return {
          text: 'Escalated to Sales Manager — Under Review',
          variant: 'rose',
        };
      }
      return {
        text: 'Nudge Submitted to Rep to Evaluate',
        variant: 'amber',
      };
    }

    // Manager / Admin view
    const isDispatched = dispatchedFlags[f.id] || f.actionTaken;
    if (isDispatched) {
      return {
        text: dispatchedFlags[f.id] || f.actionTaken || `Nudge sent to ${repName}`,
        variant: 'emerald',
      };
    }
    if (f.severity === 'HIGH') {
      return {
        text: 'Escalated to Sales Manager',
        variant: 'rose',
      };
    }
    return {
      text: `Nudge sent to ${repName}`,
      variant: 'emerald',
    };
  };

  // Group by Anomaly Types (B9: Stalled Deals, Discount Anomalies, Delivery Slippage)
  const stalledDeals = dealHealthFlags.filter((f) => f.type === 'Stalled');
  const discountAnomalies = dealHealthFlags.filter((f) => f.type === 'Discount Anomaly');
  const deliverySlippages = dealHealthFlags.filter((f) => f.type === 'Delivery Slippage' || f.type === 'Inventory Risk');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BackButton href="/dashboard" label="Dashboard" />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              B9 Deal Health Telemetry & Escalations
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
          Deal Health & Anomaly Detection Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated rule engine monitoring stalled quotations, discount outliers exceeding rep averages, and delivery promise slippage.
        </p>
      </div>

      {/* Global Notification Banner */}
      {escalatedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{escalatedNotice}</span>
          </div>
          <button onClick={() => setEscalatedNotice('')} className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Sales Rep Live Nudge Notification Input Alert */}
      {!canTriggerNudge && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <span className="font-extrabold text-white">Sales Representative Nudge & Escalation Center:</span>
              <span className="ml-1.5 text-slate-300">
                You receive automated nudge notifications when quotation inputs, discount anomalies, or delivery slippages require rep action. Review live status badges below.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3 Anomaly Severity Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Stalled Deals */}
        <div className="card p-6 bg-[var(--bg-card)] border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-4 h-4" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">Stalled Deals (&gt;5 Days Inactive)</h3>
            </div>
            <Badge variant="warning">{stalledDeals.length} Deals</Badge>
          </div>
          <div className="text-2xl font-black font-mono text-white">{stalledDeals.length} Inactive Quotes</div>
          <p className="text-[11px] text-slate-400">Deals requiring sales re-engagement before expiration.</p>
        </div>

        {/* Card 2: Discount Anomalies */}
        <div className="card p-6 bg-[var(--bg-card)] border border-rose-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <TrendingDown className="w-4 h-4" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">Discount Anomalies</h3>
            </div>
            <Badge variant="danger">{discountAnomalies.length} Alerts</Badge>
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">{discountAnomalies.length} Outliers</div>
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

      {/* Active Anomaly Alerts Table with Direct Open & Automated Nudge Actions */}
      <div className="card p-6 bg-[var(--bg-card)] border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Active Anomaly Alerts & Escalation Center
          </h2>
          <span className="text-xs text-slate-400">
            {canTriggerNudge
              ? 'Click button to send nudge to assigned representative'
              : 'Automated telemetry monitoring & active escalation status'}
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
              cell: (f) => {
                const statusInfo = getFlagStatusInfo(f);

                return (
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{f.description}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Detected: {new Date(f.detectedAt).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] font-medium text-amber-400 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3 text-amber-400" />
                      <span>{statusInfo.text}</span>
                    </div>
                  </div>
                );
              },
            },
            {
              header: 'Automated Actions',
              cell: (f) => {
                const q = quotations.find((item) => item.id === f.quotationId);
                const repName = q?.assignedTo || 'Jasmine Rao';
                const statusInfo = getFlagStatusInfo(f);

                return (
                  <div className="flex items-center gap-2">
                    {canTriggerNudge ? (
                      dispatchedFlags[f.id] || f.actionTaken ? (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 cursor-default select-none">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{dispatchedFlags[f.id] || f.actionTaken}</span>
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Bell className="w-3.5 h-3.5 text-amber-400" />}
                          onClick={() => {
                            const nudgeText = `Nudge sent to ${repName}`;
                            setDispatchedFlags((prev) => ({
                              ...prev,
                              [f.id]: nudgeText,
                            }));
                            addActivity({
                              id: `act-${Date.now()}`,
                              type: 'alert',
                              message: `Escalation nudge dispatched to ${repName} for Quote ${f.quotationNumber || f.quotationId}.`,
                              relatedTo: f.id,
                              timestamp: new Date().toISOString(),
                            });
                            addNotification({
                              id: `notif-${Date.now()}`,
                              userId: 'user-2',
                              title: `Escalation Nudge Sent: Quote #${f.quotationNumber || f.quotationId}`,
                              message: `Nudge dispatched to ${repName}: ${f.description}`,
                              type: 'warning',
                              read: false,
                              createdAt: new Date().toISOString(),
                            });
                            setEscalatedNotice(`Nudge successfully sent to ${repName}!`);
                            setTimeout(() => setEscalatedNotice(''), 5000);
                          }}
                        >
                          Trigger Escalation Nudge
                        </Button>
                      )
                    ) : (
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-default select-none border ${
                          statusInfo.variant === 'rose'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {statusInfo.variant === 'rose' ? (
                          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>{statusInfo.text}</span>
                      </span>
                    )}

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

      {/* ─── DISPATCH ESCALATION NUDGE MODAL ─── */}
      {selectedFlag && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedFlag(null)}
          title={`Dispatch Escalation Nudge — ${selectedFlag.customerName}`}
          subtitle={`Deal Health Anomaly Alert: ${selectedFlag.type} (${selectedFlag.severity} RISK)`}
          maxWidth="lg"
        >
          <form onSubmit={handleDispatchNudge} className="space-y-5">
            {/* Anomaly Summary Box */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  {selectedFlag.description}
                </span>
                <Badge variant={selectedFlag.severity === 'HIGH' ? 'danger' : 'warning'}>
                  {selectedFlag.severity} RISK
                </Badge>
              </div>
              <p className="text-slate-300 text-[11px]">
                Triggering an escalation nudge will dispatch automated priority reminders across configured operational channels to assigned Reps and Sales Managers.
              </p>
            </div>

            {/* Escalation Channels Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Select Dispatch Escalation Channels
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Channel 1: Slack */}
                <label
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    sendSlack
                      ? 'bg-indigo-950/50 border-indigo-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sendSlack}
                    onChange={(e) => setSendSlack(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Slack Channel Alert
                    </div>
                    <div className="text-[10px] text-slate-400">Urgent DM & Deal Operations channel ping</div>
                  </div>
                </label>

                {/* Channel 2: Email */}
                <label
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    sendEmail
                      ? 'bg-indigo-950/50 border-indigo-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Telemetry Report
                    </div>
                    <div className="text-[10px] text-slate-400">Escalation digest to Rep & Approver Manager</div>
                  </div>
                </label>

                {/* Channel 3: In-App Notification */}
                <label
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    sendInApp
                      ? 'bg-indigo-950/50 border-indigo-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sendInApp}
                    onChange={(e) => setSendInApp(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-400" /> In-App Notification
                    </div>
                    <div className="text-[10px] text-slate-400">Posts high-priority alert on staff top bar</div>
                  </div>
                </label>

                {/* Channel 4: Calendar Task */}
                <label
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    sendCalendar
                      ? 'bg-indigo-950/50 border-indigo-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sendCalendar}
                    onChange={(e) => setSendCalendar(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> Calendar Follow-Up Task
                    </div>
                    <div className="text-[10px] text-slate-400">Schedules a 24h review task on rep calendar</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Nudge Message Text Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Escalation Message & Instructions</label>
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
              <Button variant="primary" size="sm" type="submit" leftIcon={<Send className="w-4 h-4" />}>
                Send Escalation Nudge Now
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
