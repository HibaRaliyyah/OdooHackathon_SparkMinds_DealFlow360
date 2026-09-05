'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  Server,
  Users,
  Settings,
  Activity,
  Sliders,
  Database,
  Lock,
  Package,
  Boxes,
  RefreshCw,
  BarChart3,
  CheckCircle2,
  Clock,
  UserCheck,
  ArrowRight,
  Eye,
} from 'lucide-react';

export function AdminDashboard() {
  const {
    users,
    tierPolicies,
    productCategories,
    products,
    warehouses,
    subscriptions,
    auditEvents,
    dealHealthFlags,
    approvalRequests,
  } = useStore();

  const pendingApprovals = approvalRequests.filter((r) => r.status === 'Pending');

  // Helper to display authorized approver role & assigned person based on RBAC matrix
  const getAuthorizedApprover = (req: typeof approvalRequests[0]) => {
    if (req.status === 'Approved' || req.status === 'Rejected') {
      const lastAction = req.actions && req.actions.length > 0 ? req.actions[req.actions.length - 1] : null;
      if (lastAction) {
        return `Completed by ${lastAction.userName} (${lastAction.userRole})`;
      }
      return req.status === 'Approved' ? 'Completed (Approved)' : 'Completed (Rejected)';
    }

    if (req.status === 'Auto-Approved' || req.stage === 'Auto-Approved') {
      return 'System Auto-Rules Engine (Level 0)';
    }

    if (req.stage === 'Sales Manager') {
      const manager = users.find((u) => u.role === 'SALES_MANAGER');
      return `Step 1: Sales Manager (${manager ? manager.name : 'Mihail Shah'})`;
    }

    if (req.stage === 'Finance') {
      const financeUser = users.find((u) => u.role === 'FINANCE');
      return `Step 2: Finance / Operations (${financeUser ? financeUser.name : 'Riya Iyer'})`;
    }

    return 'Authorized System Approver';
  };

  return (
    <div className="space-y-8">
      {/* Admin Hero Header with Duties */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl border border-indigo-500/20 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Admin Official Console
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Backend Setup & Platform Analytics
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-3">
              Backend Configuration & Platform-Wide Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Configure master products, price lists, discount tiers, warehouses, and subscription plans, while monitoring platform-wide analytics and approval governance.
            </p>

            {/* Admin Duties Checklist */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Master Products & Price Lists
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Discount Ceilings & Warehouses
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Approval Routing & Risk Governance
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Platform-Wide Reporting
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/admin">
              <Button variant="primary" size="md" leftIcon={<Sliders className="w-4 h-4" />}>
                Manage Backend Setup
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" size="md" leftIcon={<BarChart3 className="w-4 h-4" />}>
                Platform Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Backend Setup Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Products & Catalog */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Catalog</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-white tracking-tight">{products.length} Products</div>
            <div className="text-xs text-emerald-400 font-semibold mt-2">Active SKUs & Variants</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>{productCategories.length} Categories</span>
            <Link href="/products" className="text-indigo-400 hover:underline">Manage SKUs →</Link>
          </div>
        </div>

        {/* KPI 2: Warehouses */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warehouses Configured</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">{warehouses.length} Depots</div>
            <div className="text-xs text-emerald-300 font-semibold mt-2">Main Hub & East Depot</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Fulfillment Routing</span>
            <Link href="/fulfillment" className="text-emerald-400 hover:underline">View Routing →</Link>
          </div>
        </div>

        {/* KPI 3: Discount Tiers */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Discount Tiers</span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-white tracking-tight">{tierPolicies.length} Tiers</div>
            <div className="text-xs text-amber-400 font-semibold mt-2">Bronze, Silver, Gold, Platinum</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Policy Enforced</span>
            <Link href="/admin" className="text-amber-400 hover:underline">Edit Ceilings →</Link>
          </div>
        </div>

        {/* KPI 4: Pending Approvals Monitored */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monitored Approvals</span>
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-purple-300 tracking-tight">{pendingApprovals.length} Pending</div>
            <div className="text-xs text-purple-300 font-semibold mt-2">Routed to Manager / Finance</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>RBAC Matrix Enforced</span>
            <Link href="/approvals" className="text-purple-400 hover:underline">Approvals Hub →</Link>
          </div>
        </div>
      </div>

      {/* ─── QUOTATION APPROVALS & AUTHORIZED APPROVERS SECTION ─── */}
      <div className="card p-6 bg-[var(--bg-card)] border border-indigo-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Quotation Approvals & Authorized Approvers
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitors active quotation approval routing and designated operational approvers (Step 1: Sales Manager, Step 2: Finance / Operations).
            </p>
          </div>
          <Badge variant="neutral">{approvalRequests.length} Total Monitored</Badge>
        </div>

        <div className="space-y-3">
          {approvalRequests.map((req) => {
            const authorizedRoleStr = getAuthorizedApprover(req);

            return (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/quotations/${req.quotationId}`} className="font-mono text-sm font-extrabold text-white hover:text-indigo-400">
                      Quote {req.quotationNumber}
                    </Link>
                    <span className="text-xs text-slate-400">— {req.customerName}</span>
                    <Badge variant={req.riskLevel === 'HIGH' ? 'danger' : 'warning'}>
                      Score: {req.riskScore}/100 ({req.riskLevel})
                    </Badge>
                  </div>

                  {/* Authorized Approver Display */}
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Authorized Approver:</span>
                    <strong className="text-indigo-300 font-mono">{authorizedRoleStr}</strong>
                  </div>
                </div>

                {/* Inspect Link & Approval Status Badge (No Direct Approve/Reject Buttons in Admin View) */}
                <div className="flex items-center gap-3">
                  <Badge variant={req.status === 'Approved' || req.status === 'Auto-Approved' ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning'}>
                    {req.status}
                  </Badge>
                  <Link href={`/quotations/${req.quotationId}`}>
                    <Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                      Inspect Quote
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backend Setup Modules & User Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tier Policies Card */}
        <div className="card p-6 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" /> Customer Tier Discount Ceilings
              </h3>
              <p className="text-xs text-slate-400">Enforced across Quotations and Approval Routing</p>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Edit Policies
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {tierPolicies.map((tp) => (
              <div
                key={tp.tier}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-extrabold text-sm text-white">{tp.tier} Tier</span>
                  <p className="text-xs text-slate-400">Maximum standard discount permitted</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-black text-indigo-300">{tp.discountCeiling}%</span>
                  <span className="block text-[10px] text-slate-500">Auto-Approval Cap</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Governance Table */}
        <div className="card p-6 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" /> Provisioned System Officials
              </h3>
              <p className="text-xs text-slate-400">Active accounts and assigned responsibilities</p>
            </div>
            <Badge variant="success">All Provisioned</Badge>
          </div>

          <div className="space-y-3">
            {users.map((u, idx) => (
              <div
                key={`${u.id}-${idx}`}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {u.avatarInitials}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </div>
                </div>
                <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'FINANCE' ? 'warning' : 'neutral'}>
                  {u.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Audit Log */}
      <div className="card p-6 bg-[var(--bg-card)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" /> System Audit & Event Stream
            </h3>
            <p className="text-xs text-slate-400">Immutable trace log for CPQ transactions and governance changes</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Compliance Ready
          </span>
        </div>

        <div className="space-y-3">
          {auditEvents.slice(0, 5).map((ev) => (
            <div
              key={ev.id}
              className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <div>
                  <span className="font-bold text-white">{ev.action}</span>
                  <span className="text-slate-400 ml-2">by {ev.userName}</span>
                </div>
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
