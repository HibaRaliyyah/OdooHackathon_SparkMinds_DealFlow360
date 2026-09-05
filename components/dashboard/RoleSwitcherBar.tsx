'use client';

import React from 'react';
import { useStore } from '@/lib/data/store';
import { Shield, Briefcase, Calculator, UserCheck, Building, Sparkles } from 'lucide-react';
import type { UserRole } from '@/lib/types';

interface RoleOption {
  role: UserRole;
  label: string;
  officialTitle: string;
  email: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeBg: string;
  duties: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'ADMIN',
    label: 'Admin',
    officialTitle: 'Backend Setup & Platform Analytics',
    email: 'admin@dealflow360.demo',
    icon: Shield,
    color: 'text-indigo-400',
    activeBg: 'bg-indigo-600 text-white shadow-indigo-500/30',
    duties: 'Manages master products, price lists, discount ceilings, approval chains, warehouses, subscriptions & platform analytics.',
  },
  {
    role: 'SALES_MANAGER',
    label: 'Sales Manager / Approver',
    officialTitle: 'Threshold Approvals & Deal Governance',
    email: 'manager@dealflow360.demo',
    icon: Briefcase,
    color: 'text-purple-400',
    activeBg: 'bg-purple-600 text-white shadow-purple-500/30',
    duties: 'Step 1 approval authority (approve/reject/return quotes), configures discount tiers & approval chains, monitors deal health.',
  },
  {
    role: 'SALES_REP',
    label: 'Sales Rep',
    officialTitle: 'Quotations, Upsell & Negotiation',
    email: 'sales@dealflow360.demo',
    icon: UserCheck,
    color: 'text-amber-400',
    activeBg: 'bg-amber-600 text-white shadow-amber-500/30',
    duties: 'Creates & edits quotations, applies discounts & upsells, submits for approval, tracks fulfillment, responds to negotiations.',
  },
  {
    role: 'FINANCE',
    label: 'Finance / Operations',
    officialTitle: '2nd Level Sign-off & Warehouse Fulfillment Splits',
    email: 'finance@dealflow360.demo',
    icon: Calculator,
    color: 'text-emerald-400',
    activeBg: 'bg-emerald-600 text-white shadow-emerald-500/30',
    duties: 'Step 2 Finance sign-off, accepts/overrides warehouse splits, consolidates backorders, reconciles billing & credit notes.',
  },
  {
    role: 'CUSTOMER',
    label: 'Customer (Portal)',
    officialTitle: 'Online Quotes & 1-Click Confirmation',
    email: 'customer@dealflow360.demo',
    icon: Building,
    color: 'text-cyan-400',
    activeBg: 'bg-cyan-600 text-white shadow-cyan-500/30',
    duties: 'Views quotation in portal, requests line changes or counters discount, confirms final terms to trigger fulfillment.',
  },
];

export function RoleSwitcherBar() {
  const { currentUser, login } = useStore();

  const handleSwitchRole = (email: string) => {
    login(email, 'demo1234');
  };

  const currentRoleConfig = ROLES.find((r) => r.role === currentUser?.role) || ROLES[0];

  return (
    <div className="bg-[#0f172a]/95 border border-indigo-500/20 backdrop-blur-xl p-3 rounded-2xl shadow-2xl space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-black shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300">
              Role Switcher — Officials & Customer Views
            </div>
            <div className="text-[10px] text-slate-400">
              Active Official: <strong className="text-white">{currentUser?.name || 'Alex Admin'}</strong> ({currentRoleConfig.label})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isSelected = currentUser?.role === r.role;

            return (
              <button
                key={r.role}
                onClick={() => handleSwitchRole(r.email)}
                title={r.duties}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? `${r.activeBg} shadow-lg ring-1 ring-white/20 font-bold scale-102`
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : r.color}`} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Role Duties Banner */}
      <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-indigo-300">{currentRoleConfig.label}:</span>
          <span className="text-slate-400 truncate">{currentRoleConfig.duties}</span>
        </div>
        <span className="shrink-0 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
          Interactive View Active
        </span>
      </div>
    </div>
  );
}
