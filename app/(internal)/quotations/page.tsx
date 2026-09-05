'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Search, LayoutGrid, ListFilter, ArrowRight } from 'lucide-react';
import type { QuotationStage } from '@/lib/types';

export default function QuotationsListPage() {
  const { quotations } = useStore();
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
  const [search, setSearch] = useState('');

  const filtered = quotations.filter(
    (q) =>
      (q.quoteNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.customerName || '').toLowerCase().includes(search.toLowerCase())
  );

  const pipelineStages: { title: string; stage: QuotationStage }[] = [
    { title: 'Draft / In Progress', stage: 'Draft' },
    { title: 'Pending Approval', stage: 'Pending Approval' },
    { title: 'Approved / Sent', stage: 'Approved' },
    { title: 'Confirmed / Billing', stage: 'Confirmed' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Quotations & Deal Lifecycle</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Manage quotes, line discounts, blended risk scores, and customer approvals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-[var(--accent-indigo)] text-white' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Table List</span>
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'pipeline' ? 'bg-[var(--accent-indigo)] text-white' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Pipeline View</span>
            </button>
          </div>

          <Link href="/quotations/new">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Create Quotation
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-subtle)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Filter by quotation #, customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
          />
        </div>
      </div>

      {/* View Switcher: List vs Kanban Pipeline */}
      {viewMode === 'list' ? (
        <div className="card p-6 bg-[var(--bg-card)]">
          <Table
            data={filtered}
            keyExtractor={(q) => q.id}
            columns={[
              {
                header: 'Quotation #',
                cell: (q) => (
                  <div>
                    <Link href={`/quotations/${q.id}`} className="font-bold text-[var(--text-primary)] hover:text-[var(--accent-purple-light)]">
                      {q.quoteNumber}
                    </Link>
                    <div className="text-[10px] text-[var(--text-tertiary)]">{q.customerName}</div>
                  </div>
                ),
              },
              {
                header: 'Customer',
                cell: (q) => (
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">{q.customerName}</div>
                  </div>
                ),
              },
              {
                header: 'Items',
                cell: (q) => <span className="font-mono font-medium text-[var(--text-secondary)]">{q.items.length} SKUs</span>,
              },
              {
                header: 'Blended Risk',
                cell: (q) => (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                      {q.blendedRisk?.riskScore || 20}/100
                    </span>
                    <Badge variant={q.blendedRisk?.riskLevel === 'HIGH' ? 'danger' : 'success'}>
                      {q.blendedRisk?.riskLevel || 'LOW'}
                    </Badge>
                  </div>
                ),
              },
              {
                header: 'Total Value',
                cell: (q) => (
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    ${(q.oneTimeTotal + q.recurringTotal).toLocaleString()}
                  </span>
                ),
              },
              {
                header: 'Stage',
                cell: (q) => <Badge variant={q.stage === 'Approved' ? 'success' : 'warning'}>{q.stage}</Badge>,
              },
              {
                header: 'Actions',
                cell: (q) => (
                  <Link href={`/quotations/${q.id}`}>
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3 h-3" />}>
                      View
                    </Button>
                  </Link>
                ),
              },
            ]}
          />
        </div>
      ) : (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {pipelineStages.map((s) => {
            const stageQuotes = filtered.filter((q) => q.stage === s.stage);
            return (
              <div key={s.stage} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{s.title}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg-card-hover)] text-[var(--text-tertiary)]">
                    {stageQuotes.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stageQuotes.map((q) => (
                    <Link key={q.id} href={`/quotations/${q.id}`}>
                      <div className="p-3.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--accent-indigo)] transition-all space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{q.quoteNumber}</span>
                        </div>
                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{q.customerName}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
                          <span className="font-mono font-bold text-emerald-400">${(q.oneTimeTotal + q.recurringTotal).toLocaleString()}</span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">Risk {q.blendedRisk?.riskScore || 20}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
