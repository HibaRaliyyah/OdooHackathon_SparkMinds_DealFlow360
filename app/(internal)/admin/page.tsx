'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
  Lock,
  UserCheck,
  Zap,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { canConfigureAdmin } from '@/lib/services/permissionService';

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
    currentUser,
    addProduct,
    deleteProduct,
  } = useStore();

  const adminAuth = canConfigureAdmin(currentUser?.role);

  const [activeTab, setActiveTab] = useState<'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7'>('A2');

  // New product form state
  const [showAddProdModal, setShowAddProdModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(1200);
  const [newProdCategory, setNewProdCategory] = useState('cat-1');
  const [newProdType, setNewProdType] = useState<'Hardware' | 'Services' | 'Subscription'>('Hardware');

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

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const prodId = `prod-${Date.now()}`;
    const newProduct = {
      id: prodId,
      name: newProdName,
      sku: newProdSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: newProdCategory,
      description: `${newProdName} - Custom configured product for enterprise deals.`,
      basePrice: Number(newProdPrice) || 500,
      unit: 'Unit',
      taxPercent: 10,
      type: newProdType,
      isSubscription: newProdType === 'Subscription',
      status: 'Active' as const,
      variants: [],
      quantityOnHand: 45,
    };

    addProduct(newProduct);
    setNewProdName('');
    setNewProdSku('');
    setShowAddProdModal(false);
  };

  if (!adminAuth.allowed) {
    return (
      <div className="max-w-2xl mx-auto p-8 mt-12 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl text-center space-y-4 shadow-2xl animate-in fade-in">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Backend Administration Restricted</h2>
        <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
          {adminAuth.reason} Your current role is <strong>{currentUser?.role || 'Guest'}</strong>.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="primary" size="md">
              Return to Sales Workspace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton href="/dashboard" label="Dashboard" />
        <Badge variant="info">Platform Governance Center</Badge>
      </div>

      {/* Backend Configuration Header */}
      <div className="relative overflow-hidden bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-subtle)] shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Sales Backend Configuration Area
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Full System Administration
              </span>
            </div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight mt-3">
              Platform Setup, Pricing Governance & Rules Engine
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              Configure products and variant attributes, tier discount ceilings and multi-stage approval chains, warehouse auto-splits, subscription proration policies, and AI recommendation rules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="primary" size="md" leftIcon={<ArrowRight className="w-4 h-4" />}>
                Open Sales Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 7 Navigation Tabs (A1 to A7) ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-subtle)] scrollbar-thin">
        {[
          { id: 'A1', label: 'A1) Authentication & Access', icon: KeyRound },
          { id: 'A2', label: 'A2) Products & Price Lists', icon: Package },
          { id: 'A3', label: 'A3) Discount Tiers & Approval Chains', icon: Sliders },
          { id: 'A4', label: 'A4) Warehouses & Fulfillment', icon: Boxes },
          { id: 'A5', label: 'A5) Subscriptions & Proration', icon: RefreshCw },
          { id: 'A6', label: 'A6) Upsell / Cross-Sell Rules', icon: Sparkles },
          { id: 'A7', label: 'A7) Reporting & Operations', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
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
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-400" /> A1) User Provisioning & Portal Access
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Internal official accounts and Customer portal access configuration (magic links & credentials)
                </p>
              </div>
              <Badge variant="success">5 Active Users</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Internal Official Accounts</h4>
                {users.map((u, idx) => (
                  <div key={`${u.id}-${idx}`} className="p-3.5 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">{u.name}</span>
                      <div className="text-[11px] text-[var(--text-secondary)] font-mono">{u.email}</div>
                    </div>
                    <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'CUSTOMER' ? 'info' : 'warning'}>
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Customer Portal Access Credentials</h4>
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--text-primary)]">Acme Corp Client Access Token</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                      TOKEN_ACTIVE
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-[11px]">
                    Direct Customer Portal Link: <span className="font-mono text-cyan-400 font-bold">/portal/quotation</span>
                  </p>
                  <Link href="/portal/quotation">
                    <Button variant="primary" size="sm">
                      Test Customer Portal View
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
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-400" /> A2) Product Catalog & Variant Attributes
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Configure products, base prices, SKUs, tax rates, units, and variant attributes
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddProdModal(true)}
              >
                Add New Product
              </Button>
            </div>

            {/* Products Listing */}
            <div className="space-y-4">
              {products.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[var(--text-primary)] text-sm">{p.name}</span>
                          <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-card)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                            {p.sku}
                          </span>
                          <Badge variant={p.type === 'Hardware' ? 'info' : p.type === 'Subscription' ? 'purple' : 'neutral'}>
                            {p.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{p.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-mono text-lg font-black text-emerald-400">${p.basePrice.toLocaleString()}</span>
                        <span className="block text-[10px] text-[var(--text-secondary)]">Tax: {p.taxPercent}% · Stock: {p.quantityOnHand}</span>
                      </div>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Variants */}
                  {p.variants && p.variants.length > 0 && (
                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 block">
                        Configured Variant Attributes & Extra Pricing:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {p.variants.map((v) => (
                          <span
                            key={v.id}
                            className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] flex items-center gap-1.5"
                          >
                            <span className="text-[var(--text-secondary)]">{v.attribute}:</span>
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
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Customer Tier-Based Price Lists & Currency Rules
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Base currencies supported: USD ($), EUR (€) with account tier indexation (Bronze, Silver, Gold, Platinum)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Bronze Tier (USD)', code: 'PL-001', status: 'Standard' },
                { name: 'Silver Tier (USD)', code: 'PL-002', status: '5% Indexed' },
                { name: 'Gold Tier (USD)', code: 'PL-003', status: '10% Preferred' },
                { name: 'Platinum Tier (EUR)', code: 'PL-004', status: 'VIP Global' },
              ].map((tier, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] space-y-1 text-xs">
                  <span className="font-bold text-[var(--text-primary)]">{tier.name}</span>
                  <div className="text-[var(--text-secondary)] text-[11px]">Price List #{tier.code}</div>
                  <div className="text-emerald-400 font-mono font-bold mt-2">{tier.status}</div>
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
            <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" /> Customer Tier Discount Ceilings
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Standard allowable discount threshold per account tier</p>
              </div>

              <div className="space-y-3">
                {tierPolicies.map((tp) => (
                  <div key={tp.tier} className="p-3.5 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-[var(--text-primary)]">{tp.tier} Tier Account</span>
                      <p className="text-[var(--text-secondary)] text-[11px]">Automatic auto-approval limit</p>
                    </div>
                    <span className="font-mono text-base font-black text-indigo-400">Up to {tp.discountCeiling}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Specific Ceilings */}
            <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" /> Category-Specific Discount Ceilings
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Discretionary limits allowed per product category</p>
              </div>

              <div className="space-y-3">
                {productCategories.map((cat) => (
                  <div key={cat.id} className="p-3.5 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-[var(--text-primary)]">{cat.name}</span>
                      <p className="text-[var(--text-secondary)] text-[11px]">Category discretion ceiling</p>
                    </div>
                    <span className="font-mono text-base font-black text-purple-400">Max {cat.discountCeiling}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Approval Chain Matrix */}
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> Approval Chain Routing Matrix & Blended Risk Engine
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                When quotations mix categories with different ceilings, the system computes a blended risk score and routes to the highest required level.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-emerald-500/30 space-y-2 text-xs">
                <Badge variant="success">Auto-Approved (Level 0)</Badge>
                <div className="font-bold text-[var(--text-primary)] text-sm">Within Tier & Category Limits</div>
                <p className="text-[var(--text-secondary)] text-[11px]">
                  Discount is at or below customer tier ceiling and category limit. Moves straight to fulfillment.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-amber-500/30 space-y-2 text-xs">
                <Badge variant="warning">Sales Manager Only (Level 1)</Badge>
                <div className="font-bold text-[var(--text-primary)] text-sm">Discount Breach &le; 10% Over Limit</div>
                <p className="text-[var(--text-secondary)] text-[11px]">
                  Requires single-stage review and sign-off by Sales Manager (Mihail Shah).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-rose-500/30 space-y-2 text-xs">
                <Badge variant="danger">Sales Manager + Finance (Level 2)</Badge>
                <div className="font-bold text-[var(--text-primary)] text-sm">Discount Breach &gt; 10% / High Risk</div>
                <p className="text-[var(--text-secondary)] text-[11px]">
                  Requires two-tier sequential approval: Sales Manager followed by Finance Controller (Riya Iyer).
                </p>
              </div>
            </div>
          </div>

          {/* Immutable Audit Log */}
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" /> Compliance Audit Trail Log
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                User · Timestamp · Reason
              </span>
            </div>

            <div className="space-y-2.5">
              {auditEvents.map((ev) => (
                <div key={ev.id} className="p-3 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[var(--text-primary)]">{ev.action}</span>
                    <span className="text-[var(--text-secondary)] ml-2">by {ev.userName} ({ev.userRole})</span>
                    {ev.reason && <p className="text-[11px] text-indigo-400 mt-0.5">Reason: {ev.reason}</p>}
                  </div>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">
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
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-400" /> A4) Warehouses, Stock Levels & Auto-Split Cost Weighting
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Define shipping cost weighting used by the auto-split algorithm to minimize total shipments and delivery cost.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {warehouses.map((wh) => (
                <div key={wh.id} className="p-5 rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                        <Boxes className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[var(--text-primary)] text-sm">{wh.name}</h4>
                        <span className="text-[11px] text-[var(--text-secondary)]">{wh.location}</span>
                      </div>
                    </div>
                    <Badge variant="success">Active Hub</Badge>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-primary)]">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Replenishment Trigger Rule:</span>
                      <strong>Auto-Reorder at &le; 10 units</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Shipping Weighting Factor:</span>
                      <strong className="text-indigo-400 font-mono">{wh.name.includes('Main') ? '1.0x (Priority)' : '1.3x (Depot)'}</strong>
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
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" /> A5) Subscription Plans & Mid-Cycle Proration Setup
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Recurring plans (Monthly, Quarterly, Yearly), mid-cycle proration formulas, and automatic credit note triggers upon cancellation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] space-y-2 text-xs">
                <span className="font-bold text-[var(--text-primary)] text-sm">Monthly Care Plan</span>
                <div className="text-cyan-400 font-mono font-bold text-base">$46 / month</div>
                <p className="text-[var(--text-secondary)] text-[11px]">
                  Daily Proration: <code className="text-[var(--text-primary)] font-bold">($46 / 30) &times; remaining_days</code>
                </p>
                <div className="text-[10px] text-emerald-400 font-medium">Auto-Credit Note on Cancel</div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] space-y-2 text-xs">
                <span className="font-bold text-[var(--text-primary)] text-sm">Quarterly Enterprise SLA</span>
                <div className="text-cyan-400 font-mono font-bold text-base">$130 / quarter</div>
                <p className="text-[var(--text-secondary)] text-[11px]">
                  Daily Proration: <code className="text-[var(--text-primary)] font-bold">($130 / 90) &times; remaining_days</code>
                </p>
                <div className="text-[10px] text-emerald-400 font-medium">Auto-Credit Note on Cancel</div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] space-y-2 text-xs">
                <span className="font-bold text-[var(--text-primary)] text-sm">Annual Software License</span>
                <div className="text-cyan-400 font-mono font-bold text-base">$499 / year</div>
                <p className="text-[var(--text-secondary)] text-[11px]">
                  Daily Proration: <code className="text-[var(--text-primary)] font-bold">($499 / 365) &times; remaining_days</code>
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
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> A6) AI Upsell & Cross-Sell Pairing Engine
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Product pairings based on historical co-purchase data, active promotional tags, and minimum margin threshold guardrails.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { primary: 'Laptop Pro 14 (Hardware)', suggested: 'Care Plan 2yr (Subscription)', marginDelta: '+3.5%', tag: 'Promoted', coPurchaseRate: '84%' },
                { primary: 'Laptop Pro 14 (Hardware)', suggested: 'USB4 Docking Station (Hardware)', marginDelta: '+2.1%', tag: 'Promoted', coPurchaseRate: '72%' },
                { primary: 'Laptop Pro 14 (Hardware)', suggested: 'Onsite Setup Service (Services)', marginDelta: '+4.0%', tag: 'Standard', coPurchaseRate: '61%' },
              ].map((rule, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-secondary)]">When Cart Has:</span>
                      <strong className="text-[var(--text-primary)]">{rule.primary}</strong>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-purple-400 font-semibold">&rarr; Recommend:</span>
                      <strong className="text-indigo-400">{rule.suggested}</strong>
                      <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 text-[10px] font-bold">
                        {rule.tag}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400 font-bold">{rule.marginDelta} Margin Impact</span>
                    <span className="block text-[10px] text-[var(--text-secondary)]">Co-Purchase: {rule.coPurchaseRate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB A7: Reporting & Operations ─── */}
      {activeTab === 'A7' && (
        <div className="space-y-6">
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> A7) Reporting & Operations Performance Filters
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)]">
              {/* Period Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  1. Period Range
                </label>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month (Q3)</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              {/* Sales Rep Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  2. Sales Rep / Team
                </label>
                <select
                  value={reportRep}
                  onChange={(e) => setReportRep(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Sales Reps</option>
                  <option value="jasmine">Jasmine Rao</option>
                  <option value="david">David Miller</option>
                  <option value="sarah">Sarah Jenkins</option>
                </select>
              </div>

              {/* Approval Status Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  3. Approval Status
                </label>
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Approvals</option>
                  <option value="approved">Approved Quotes</option>
                  <option value="rejected">Rejected Quotes</option>
                </select>
              </div>

              {/* Product Category Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  4. Product / Category
                </label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
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
              <div className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-secondary)]">Total Filtered Pipeline</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">$482,900</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-secondary)]">Average Discount Applied</span>
                <div className="text-2xl font-black font-mono text-amber-400 mt-1">11.4%</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-secondary)]">Deal Win Rate</span>
                <div className="text-2xl font-black font-mono text-indigo-400 mt-1">74.2%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProdModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">Add New Catalog Product</h3>
                <p className="text-xs text-[var(--text-secondary)]">Configure base price & product details</p>
              </div>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Server X10"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SKU-8890"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value) || 0)}
                    className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Product Type</label>
                <select
                  value={newProdType}
                  onChange={(e) => setNewProdType(e.target.value as any)}
                  className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Services">Services</option>
                  <option value="Subscription">Subscription</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddProdModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" leftIcon={<Plus className="w-4 h-4" />}>
                  Create Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
