'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Plus, Search, LayoutGrid, ListFilter, ArrowRight, CheckCircle2, Download, FileSpreadsheet, MessageSquare } from 'lucide-react';
import type { QuotationStage } from '@/lib/types';
import { downloadQuotationPDF, downloadQuotationXLS } from '@/lib/utils/documentExporter';

export default function QuotationsListPage() {
  const { quotations, negotiations, notifications, currentUser, updateQuotation, addActivity } = useStore();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const canCreate = mounted && currentUser?.role !== 'ADMIN';

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
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard" label="Dashboard" />
          <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Quotations & Deal Lifecycle</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Manage quotes, line discounts, blended risk scores, and customer approvals
          </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[var(--accent-indigo)] text-white shadow-sm'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Table List</span>
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'pipeline'
                  ? 'bg-[var(--accent-indigo)] text-white shadow-sm'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Pipeline View</span>
            </button>
          </div>

          {canCreate && (
            <Link href="/quotations/new">
              <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                Create Quotation
              </Button>
            </Link>
          )}
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
                cell: (q) => {
                  const qNeg = (negotiations || []).find((n) => n.quotationId === q.id || n.quotationNumber === q.quoteNumber);
                  const unreadMsgs = (qNeg?.messages || []).filter((m) => m.senderRole === 'CUSTOMER' && m.read === false).length;
                  const isUnderNegotiation = (q.stage === 'Negotiation' || (qNeg && qNeg.status !== 'Resolved')) && q.stage !== 'Confirmed' && q.stage !== 'Approved';

                  return (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/quotations/${q.id}`} className="font-bold text-[var(--text-primary)] hover:text-[var(--accent-purple-light)]">
                          {q.quoteNumber}
                        </Link>
                        {isUnderNegotiation && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-cyan-500 text-slate-950 border border-cyan-300 flex items-center gap-1 shadow-md animate-pulse">
                            <MessageSquare className="w-3 h-3 text-slate-950" />
                            <span>{unreadMsgs > 0 ? `${unreadMsgs} New Msg` : 'Negotiation'}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">{q.customerName}</div>
                    </div>
                  );
                },
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
                cell: (q) => {
                  const qNeg = (negotiations || []).find((n) => n.quotationId === q.id || n.quotationNumber === q.quoteNumber);
                  const isUnderNegotiation = (q.stage === 'Negotiation' || (qNeg && qNeg.status !== 'Resolved')) && q.stage !== 'Confirmed' && q.stage !== 'Approved';
                  const displayStage = q.stage === 'Confirmed' ? 'Confirmed' : q.stage === 'Approved' ? 'Approved' : isUnderNegotiation ? 'Negotiation' : q.stage;
                  const badgeVariant = displayStage === 'Confirmed' || displayStage === 'Approved' ? 'success' : displayStage === 'Negotiation' || displayStage === 'Pending Approval' ? 'warning' : 'neutral';

                  return (
                    <Badge variant={badgeVariant}>
                      {displayStage}
                    </Badge>
                  );
                },
              },
              {
                header: 'Actions',
                cell: (q) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        downloadQuotationPDF(q);
                      }}
                      title="Download PDF Proposal"
                      className="p-1.5 rounded-lg bg-[var(--bg-card-hover)] hover:bg-white/10 text-indigo-400 border border-[var(--border-subtle)] transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        downloadQuotationXLS(q);
                      }}
                      title="Download XLS Spreadsheet"
                      className="p-1.5 rounded-lg bg-[var(--bg-card-hover)] hover:bg-white/10 text-emerald-400 border border-[var(--border-subtle)] transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </button>
                    <Link href={`/quotations/${q.id}`}>
                      <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3 h-3" />}>
                        View
                      </Button>
                    </Link>
                  </div>
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
                    <div key={q.id} className="p-3.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{q.quoteNumber}</span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{q.customerName}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
                        <span className="font-mono font-bold text-emerald-400">${(q.oneTimeTotal + q.recurringTotal).toLocaleString()}</span>
                        <Link href={`/quotations/${q.id}`}>
                          <span className="text-[11px] font-bold text-indigo-400 hover:underline">View &rarr;</span>
                        </Link>
                      </div>
                    </div>
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
