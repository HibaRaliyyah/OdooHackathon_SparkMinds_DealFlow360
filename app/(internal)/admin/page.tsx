'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import {
  Sliders,
  Package,
  Boxes,
  RefreshCw,
  Sparkles,
  BarChart3,
  Shield,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Download,
  DollarSign,
  Layers,
  ArrowRight,
  Database,
  Building,
  KeyRound,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';

export default function AdminBackendPage() {
  const {
    products,
    productCategories,
    tierPolicies,
    warehouses,
    inventory,
    subscriptions,
    users,
    auditEvents,
    priceLists,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7'>('A2');

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(1200);
  const [newProdCategory, setNewProdCategory] = useState('cat-1');

  // A7 Reporting filter states
  const [reportPeriod, setReportPeriod] = useState('month');
  const [reportRep, setReportRep] = useState('all');
  const [reportStatus, setReportStatus] = useState('all');
  const [reportCategory, setReportCategory] = useState('all');
  const [exportedMsg, setExportedMsg] = useState('');

  const handleExport = (format: 'PDF' | 'XLS') => {
    setExportedMsg(`Exporting sales operations report as ${format}...`);
    setTimeout(() => {
      setExportedMsg(`Report_${new Date().toISOString().slice(0, 10)}.${format.toLowerCase()} downloaded successfully!`);
      setTimeout(() => setExportedMsg(''), 4000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Backend Configuration Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl border border-indigo-500/20 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" /> A) Sales Backend Configuration Area
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Full System Administration
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-3">
              Platform Setup, Pricing Governance & Rules Engine
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Configure products and variant attributes, tier discount ceilings and multi-stage approval chains, warehouse auto-splits, subscription proration policies, and upsell recommendation rules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="primary" size="md" leftIcon={<ArrowRight className="w-4 h-4" />}>
                Open Sales Workspace (B)
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 7 Navigation Tabs (A1 to A7) ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'A1', label: 'A1) Authentication & Access', icon: KeyRound },
          { id: 'A2', label: 'A2) Products & Price Lists', icon: Package },
          { id: 'A3', label: 'A3) Discount Tiers & Approval Chains', icon: Sliders },
          { id: 'A4', label: 'A4) Warehouses & Fulfillment', icon: Boxes },
          { id: 'A5', label: 'A5) Subscriptions & Proration', icon: RefreshCw },
          { id: 'A6', label: 'A6) Upsell / Cross-Sell Rules', icon: Sparkles },
          { id: 'A7', label: 'A7) Reporting & Dashboards', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB A1: Authentication & Access ─── */}
      {activeTab === 'A1' && (
        <div className="space-y-6">
          <div className="card p-6 bg-[var(--bg-card)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-400" /> A1) User Provisioning & Portal Access
                </h3>
                <p className="text-xs text-slate-400">
                  Internal official accounts and Customer portal login configuration (magic links & credentials)
                </p>
              </div>
              <Badge variant="success">5 Provisioned</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Internal Officials</h4>
                {users.map((u) => (
                  <div key={u.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{u.name}</span>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </div>
                    <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'CUSTOMER' ? 'info' : 'warning'}>
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Customer Portal Access Links</h4>
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Acme Corp Client Token</span>
                    <span className="text-[10px] text-emerald-400 font-mono">TOKEN_ACTIVE</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Magic Link URL: <span className="font-mono text-cyan-300">https://dealflow360.demo/portal/quotation?token=acme_8812</span>
                  </p>
                  <Link href="/portal/quotation">
                    <Button variant="primary" size="sm">
                      Test Customer Portal
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB A2: Products & Price Lists ─── */}
      {activeTab === 'A2' && (
        <div className="space-y-6">
          <div className="card p-6 bg-[var(--bg-card)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-400" /> A2) Product Catalog & Variant Attributes
                </h3>
                <p className="text-xs text-slate-400">
                  General Info: Name, Category, Price, Unit, Tax, Description, and Variant Attribute configurations
                </p>
              </div>
            </div>

            {/* Products Table with Variants */}
            <div className="space-y-4">
              {products.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{p.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {p.sku}
                          </span>
                          <Badge variant={p.type === 'Hardware' ? 'info' : p.type === 'Subscription' ? 'purple' : 'neutral'}>
                            {p.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-lg font-black text-emerald-400">${p.basePrice.toLocaleString()}</span>
                      <span className="block text-[10px] text-slate-500">Tax: {p.taxPercent}% · Unit: {p.unit}</span>
                    </div>
                  </div>

                  {/* Variants List */}
                  {p.variants && p.variants.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                        Configured Variant Attributes & Extra Pricing:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {p.variants.map((v) => (
                          <span
                            key={v.id}
                            className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/60 text-xs text-slate-200 flex items-center gap-1.5"
                          >
                            <span className="text-slate-400">{v.attribute}:</span>
                            <strong>{v.value}</strong>
                            {v.extraPrice > 0 && (
                              <span className="font-mono text-emerald-400 text-[11px]">(+${v.extraPrice})</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Price Lists Card */}
          <div className="card p-6 bg-[var(--bg-card)]">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Customer Tier-Based Price Lists & Currency Rules
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Base currencies supported: USD ($), EUR (€) with customer tier indexation (Bronze, Silver, Gold, Platinum)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Bronze Tier (USD)', 'Silver Tier (USD)', 'Gold Tier (USD)', 'Platinum Tier (EUR)'].map((tier, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
                  <span className="font-bold text-white">{tier}</span>
                  <div className="text-slate-400 text-[11px]">Price List #PL-00{idx + 1}</div>
                  <div className="text-emerald-400 font-mono font-bold mt-2">Active Standard</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB A3: Discount Tiers & Approval Chains ─── */}
      {activeTab === 'A3' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Tier Ceilings */}
            <div className="card p-6 bg-[var(--bg-card)]">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-1">
                <Sliders className="w-4 h-4 text-indigo-400" /> Customer Tier Discount Ceilings
              </h3>
              <p className="text-xs text-slate-400 mb-4">Standard allowable discount threshold per account tier</p>

              <div className="space-y-3">
                {tierPolicies.map((tp) => (
                  <div key={tp.tier} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-white">{tp.tier} Tier Account</span>
                      <p className="text-slate-400 text-[11px]">Automatic auto-approval limit</p>
                    </div>
                    <span className="font-mono text-base font-black text-indigo-300">Up to {tp.discountCeiling}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Specific Ceilings */}
            <div className="card p-6 bg-[var(--bg-card)]">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-1">
                <Sliders className="w-4 h-4 text-purple-400" /> Category-Specific Discount Ceilings
              </h3>
              <p className="text-xs text-slate-400 mb-4">Discretionary limits allowed per product category</p>

              <div className="space-y-3">
                {productCategories.map((cat) => (
                  <div key={cat.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-white">{cat.name}</span>
                      <p className="text-slate-400 text-[11px]">Category discretion ceiling</p>
                    </div>
                    <span className="font-mono text-base font-black text-purple-300">Max {cat.discountCeiling}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Approval Chain Matrix */}
          <div className="card p-6 bg-[var(--bg-card)]">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-amber-400" /> Approval Chain Routing Matrix & Blended Risk Engine
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              When quotations mix categories with different ceilings, the system computes a blended risk score and routes to the highest required level.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30 space-y-2 text-xs">
                <Badge variant="success">Auto-Approved (Level 0)</Badge>
                <div className="font-bold text-white text-sm">Within Tier & Category Limits</div>
                <p className="text-slate-400 text-[11px]">
                  Discount is at or below the customer tier ceiling and category limit. Moves straight to fulfillment.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30 space-y-2 text-xs">
                <Badge variant="warning">Sales Manager Only (Level 1)</Badge>
                <div className="font-bold text-white text-sm">Discount Breach &le; 10% Over Limit</div>
                <p className="text-slate-400 text-[11px]">
                  Requires single-stage review and sign-off by Sales Manager (Mihail Shah).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/30 space-y-2 text-xs">
                <Badge variant="danger">Sales Manager + Finance (Level 2)</Badge>
                <div className="font-bold text-white text-sm">Discount Breach &gt; 10% / High Risk</div>
                <p className="text-slate-400 text-[11px]">
                  Requires two-tier sequential approval: Sales Manager followed by Finance Controller (Riya Iyer).
                </p>
              </div>
            </div>
          </div>

          {/* Immutable Audit Log */}
          <div className="card p-6 bg-[var(--bg-card)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" /> Compliance Audit Trail Log
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                User · Timestamp · Reason
              </span>
            </div>

            <div className="space-y-2.5">
              {auditEvents.map((ev) => (
                <div key={ev.id} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{ev.action}</span>
                    <span className="text-slate-400 ml-2">by {ev.userName} ({ev.userRole})</span>
                    {ev.reason && <p className="text-[11px] text-indigo-300 mt-0.5">Reason: {ev.reason}</p>}
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB A4: Warehouses & Fulfillment ─── */}
      {activeTab === 'A4' && (
        <div className="space-y-6">
          <div className="card p-6 bg-[var(--bg-card)]">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-1">
              <Boxes className="w-4 h-4 text-indigo-400" /> A4) Warehouses, Stock Levels & Auto-Split Cost Weighting
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Define shipping cost weighting used by the auto-split algorithm to minimize total shipments and delivery cost.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {warehouses.map((wh) => (
                <div key={wh.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                        <Boxes className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{wh.name}</h4>
                        <span className="text-[11px] text-slate-400">{wh.location}</span>
                      </div>
                    </div>
                    <Badge variant="success">Active Hub</Badge>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Replenishment Trigger Rule:</span>
                      <strong className="text-white">Auto-Reorder at &le; 10 units</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shipping Weighting Factor:</span>
                      <strong className="text-indigo-300 font-mono">{wh.name.includes('Main') ? '1.0x (Priority)' : '1.3x (Depot)'}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB A5: Subscriptions & Proration ─── */}
      {activeTab === 'A5' && (
        <div className="space-y-6">
          <div className="card p-6 bg-[var(--bg-card)]">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-cyan-400" /> A5) Subscription Plans & Mid-Cycle Proration Setup
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Recurring plans (Monthly, Quarterly, Yearly), mid-cycle proration formulas, and automatic refund / credit note triggers upon cancellation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white text-sm">Monthly Care Plan</span>
                <div className="text-cyan-300 font-mono font-bold text-base">$46 / month</div>
                <p className="text-slate-400 text-[11px]">
                  Daily Proration: <code className="text-white">($46 / 30) &times; remaining_days</code>
                </p>
                <div className="text-[10px] text-emerald-400 font-medium">Auto-Credit Note on Cancel</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white text-sm">Quarterly Enterprise SLA</span>
                <div className="text-cyan-300 font-mono font-bold text-base">$130 / quarter</div>
                <p className="text-slate-400 text-[11px]">
                  Daily Proration: <code className="text-white">($130 / 90) &times; remaining_days</code>
                </p>
                <div className="text-[10px] text-emerald-400 font-medium">Auto-Credit Note on Cancel</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white text-sm">Annual Software License</span>
                <div className="text-cyan-300 font-mono font-bold text-base">$499 / year</div>
                <p className="text-slate-400 text-[11px]">
                  Daily Proration: <code className="text-white">($499 / 365) &times; remaining_days</code>
                </p>
                <div className="text-[10px] text-emerald-400 font-medium">Auto-Credit Note on Cancel</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB A6: Upsell / Cross-Sell Rules ─── */}
      {activeTab === 'A6' && (
        <div className="space-y-6">
          <div className="card p-6 bg-[var(--bg-card)]">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" /> A6) AI Upsell & Cross-Sell Pairing Engine
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Product pairings based on historical co-purchase data, active promotional tags, and minimum margin threshold guardrails.
            </p>

            <div className="space-y-3">
              {[
                { primary: 'Laptop Pro 14 (Hardware)', suggested: 'Care Plan 2yr (Subscription)', marginDelta: '+3.5%', tag: 'Promoted', coPurchaseRate: '84%' },
                { primary: 'Laptop Pro 14 (Hardware)', suggested: 'USB4 Docking Station (Hardware)', marginDelta: '+2.1%', tag: 'Promoted', coPurchaseRate: '72%' },
                { primary: 'Laptop Pro 14 (Hardware)', suggested: 'Onsite Setup Service (Services)', marginDelta: '+4.0%', tag: 'Standard', coPurchaseRate: '61%' },
              ].map((rule, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">When Cart Has:</span>
                      <strong className="text-white">{rule.primary}</strong>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-purple-400 font-semibold">&rarr; Recommend:</span>
                      <strong className="text-indigo-300">{rule.suggested}</strong>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                        {rule.tag}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400 font-bold">{rule.marginDelta} Margin Impact</span>
                    <span className="block text-[10px] text-slate-500">Co-Purchase: {rule.coPurchaseRate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB A7: Reporting & Dashboards ─── */}
      {activeTab === 'A7' && (
        <div className="space-y-6">
          <div className="card p-6 bg-[var(--bg-card)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> A7) Reporting & Sales Performance Filters
                </h3>
                <p className="text-xs text-slate-400">
                  Filter quotations and orders by Period, Sales Rep, Approval Status, and Category, with 1-click PDF/XLS exports.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5 text-rose-400" />} onClick={() => handleExport('PDF')}>
                  Export PDF
                </Button>
                <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />} onClick={() => handleExport('XLS')}>
                  Export XLS
                </Button>
              </div>
            </div>

            {exportedMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{exportedMsg}</span>
              </div>
            )}

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              {/* Period Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  1. Period Range
                </label>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month (Q3)</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              {/* Sales Rep Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  2. Sales Rep / Team
                </label>
                <select
                  value={reportRep}
                  onChange={(e) => setReportRep(e.target.value)}
                  className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Sales Reps</option>
                  <option value="jasmine">Jasmine Rao</option>
                  <option value="david">David Miller</option>
                  <option value="sarah">Sarah Jenkins</option>
                </select>
              </div>

              {/* Approval Status Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  3. Approval Status
                </label>
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value)}
                  className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Approvals</option>
                  <option value="approved">Approved Quotes</option>
                  <option value="rejected">Rejected Quotes</option>
                </select>
              </div>

              {/* Product Category Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  4. Product / Category
                </label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Categories</option>
                  <option value="hardware">Hardware</option>
                  <option value="services">Services</option>
                  <option value="subscriptions">Subscriptions</option>
                </select>
              </div>
            </div>

            {/* Filtered Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Total Filtered Pipeline</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">$482,900</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Average Discount Applied</span>
                <div className="text-2xl font-black font-mono text-amber-300 mt-1">11.4%</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Deal Win Rate</span>
                <div className="text-2xl font-black font-mono text-indigo-300 mt-1">74.2%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
