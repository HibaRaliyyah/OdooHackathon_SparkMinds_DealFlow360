'use client';

import React from 'react';
import { useDealFlowStore } from '@/lib/store/useDealFlowStore';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Zap,
  Clock,
  ShieldCheck,
  Download,
} from 'lucide-react';

export default function SubscriptionsPage() {
  const currentCustomer = useDealFlowStore((state) => state.currentCustomer);

  const mockSubscriptions = [
    {
      id: 'SUB-2026-001',
      name: 'DealFlow Enterprise Pro Platform Tier',
      status: 'Active',
      plan: 'Enterprise Platinum',
      billingCycle: 'Annual',
      amount: '$14,999.00 / year',
      startDate: '2026-01-01',
      nextBillingDate: '2027-01-01',
      autoRenew: true,
      features: [
        'Priority Multi-Warehouse Shipping Routing',
        'Dedicated Key Account Manager',
        'Custom Negotiation Workflows & SLAs',
        'Unlimited Direct Quotation Access & Live Tracking',
        'Volume Discount Tiers (Up to 15% off standard catalog)',
      ],
    },
    {
      id: 'SUB-2026-002',
      name: 'Premium Support & Maintenance Package',
      status: 'Active',
      plan: '24/7 SLA Priority',
      billingCycle: 'Monthly',
      amount: '$499.00 / month',
      startDate: '2026-03-01',
      nextBillingDate: '2026-10-01',
      autoRenew: true,
      features: [
        'Sub-15 Minute Response Time',
        'Custom ERP / API Logistics Hooks',
        'Quarterly Business Review Meetings',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Active Subscriptions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your recurring service subscriptions, licensing plans, and billing cycles.
        </p>
      </div>

      {/* Subscription Cards */}
      <div className="grid grid-cols-1 gap-6">
        {mockSubscriptions.map((sub) => (
          <div
            key={sub.id}
            className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {sub.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{sub.id}</span>
                </div>
                <h2 className="text-lg font-bold text-foreground mt-1">{sub.name}</h2>
              </div>
              <div className="text-left md:text-right">
                <span className="text-2xl font-extrabold text-white">{sub.amount}</span>
                <p className="text-xs text-muted-foreground">Billed {sub.billingCycle.toLowerCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--border-subtle)] flex items-center gap-3">
                <Calendar className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-semibold text-foreground">{sub.startDate}</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--border-subtle)] flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Next Renewal</p>
                  <p className="text-sm font-semibold text-foreground">{sub.nextBillingDate}</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--border-subtle)] flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Auto Renewal</p>
                  <p className="text-sm font-semibold text-emerald-400">
                    {sub.autoRenew ? 'Enabled (Auto-charge)' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>

            {/* Included Features */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Plan Inclusions & Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sub.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition-colors flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Download Contract PDF
              </button>
              <button className="px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-sky-400 border border-sky-500/30 transition-colors flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Upgrade Plan Tiers
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
