'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Building, Lock, ShieldAlert } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function CustomersPage() {
  const { customers, tierPolicies, currentUser } = useStore();

  const isAllowed = currentUser?.role === 'ADMIN' || currentUser?.role === 'SALES_MANAGER';

  if (!isAllowed) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl mx-auto py-12">
        <BackButton href="/dashboard" label="Dashboard" />

        <div className="card p-8 bg-[var(--bg-card)] border border-amber-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Access Restricted — Accounts Directory</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Customer Accounts Directory, Tiering Policies (Bronze, Silver, Gold, Platinum), and Credit Terms access is restricted exclusively to <strong>Sales Manager</strong> and <strong>Admin</strong> roles.
            </p>
            <p className="text-xs text-amber-400 font-semibold mt-1">
              Active Logged-in Role: {currentUser?.role || 'Sales Rep'}
            </p>
          </div>

          <div className="pt-3 flex justify-center">
            <Link href="/dashboard">
              <Button variant="primary" size="md">
                Return to Dashboard Console
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Directory & Tier Policies</h1>
          <p className="text-xs text-slate-700 font-medium mt-1">
            Account tiering (Bronze, Silver, Gold, Platinum), payment terms, and discount ceilings
          </p>
        </div>
      </div>

      <div className="card p-6 bg-white border border-slate-200 shadow-sm">
        <Table
          data={customers}
          keyExtractor={(c) => c.id}
          columns={[
            {
              header: 'Company Name',
              cell: (c) => (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700 border border-purple-200">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">{c.company}</div>
                    <div className="text-xs font-bold text-slate-900">{c.contact} ({c.email})</div>
                  </div>
                </div>
              ),
            },
            {
              header: 'Customer Tier',
              cell: (c) => (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-slate-100 text-slate-900 border border-slate-300">
                  {c.tier}
                </span>
              ),
            },
            {
              header: 'Max Tier Discount',
              cell: (c) => {
                const pol = tierPolicies.find((t) => t.tier === c.tier);
                return (
                  <span className="font-mono text-xs font-bold text-slate-900">
                    Max {pol?.discountCeiling || 15}%
                  </span>
                );
              },
            },
            {
              header: 'Payment Terms',
              cell: (c) => <span className="font-mono text-xs font-bold text-slate-900">{c.paymentTerms}</span>,
            },
          ]}
        />
      </div>
    </div>
  );
}
