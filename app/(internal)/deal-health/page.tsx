'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
} from 'lucide-react';

export default function DealHealthPage() {
  const { dealHealthFlags, quotations, addActivity, addNotification } = useStore();
  const [escalatedNotice, setEscalatedNotice] = useState('');

  const handleTriggerNudge = (flagId: string, quoteNumber: string) => {
    addActivity({
      id: `act-${Date.now()}`,
      type: 'alert',
      message: `Automated Slack/Email escalation nudge dispatched to assigned Sales Rep for Quote #${quoteNumber}.`,
      relatedTo: flagId,
      timestamp: new Date().toISOString(),
    });

    addNotification({
      id: `notif-${Date.now()}`,
      userId: 'user-2',
      title: `Deal Health Escalation: ${quoteNumber}`,
      message: `Deal has been inactive for >5 days or has a discount anomaly. Please follow up.`,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString(),
    });

    setEscalatedNotice(`Automated escalation notification & Slack reminder sent for Quote #${quoteNumber}!`);
    setTimeout(() => setEscalatedNotice(''), 5000);
  };

  // Group by Anomaly Types (B9: Stalled Deals, Discount Anomalies, Delivery Slippage)
  const stalledDeals = dealHealthFlags.filter((f) => f.type === 'Stalled');
  const discountAnomalies = dealHealthFlags.filter((f) => f.type === 'Discount Anomaly');
  const deliverySlippages = dealHealthFlags.filter((f) => f.type === 'Delivery Slippage' || f.type === 'Inventory Risk');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
            B9 Deal Health Telemetry
          </span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
          Deal Health & Anomaly Detection Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated rule engine monitoring stalled quotations, discount outliers exceeding rep averages, and delivery promise slippage.
        </p>
      </div>

      {escalatedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{escalatedNotice}</span>
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
          <p className="text-[11px] text-slate-400">Warehouse backorder splits requiring ETA recalibration.</p>
        </div>
      </div>

      {/* Active Anomaly Alerts Table with Direct Open & Automated Nudge Actions */}
      <div className="card p-6 bg-[var(--bg-card)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Active Anomaly Alerts & Escalation Center
          </h2>
          <span className="text-xs text-slate-400">Clicking alert opens quotation directly</span>
        </div>

        <Table
          data={dealHealthFlags}
          keyExtractor={(f) => f.id}
          columns={[
            {
              header: 'Quotation #',
              cell: (f) => {
                const q = quotations.find((q) => q.id === f.quotationId);
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
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Detected: {new Date(f.detectedAt).toLocaleDateString()}</div>
                </div>
              ),
            },
            {
              header: 'Automated Actions',
              cell: (f) => (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Bell className="w-3 h-3 text-amber-400" />}
                    onClick={() => handleTriggerNudge(f.id, f.quotationNumber || f.quotationId)}
                  >
                    Trigger Escalation Nudge
                  </Button>
                  <Link href={`/quotations/${f.quotationId}`}>
                    <Button size="sm" variant="primary">
                      Open Deal
                    </Button>
                  </Link>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
