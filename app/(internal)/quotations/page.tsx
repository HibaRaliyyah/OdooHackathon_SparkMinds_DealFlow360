'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Plus, Search, LayoutGrid, ListFilter, ArrowRight, Edit2, CheckCircle2 } from 'lucide-react';
import type { QuotationStage, Quotation } from '@/lib/types';

export default function QuotationsListPage() {
  const { quotations, currentUser, updateQuotation, addActivity } = useStore();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
  const [search, setSearch] = useState('');
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);

  // Edit form fields
  const [editDiscount, setEditDiscount] = useState<number>(10);
  const [editStage, setEditStage] = useState<QuotationStage>('Draft');
  const [editRep, setEditRep] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const canCreateOrEdit = mounted && (currentUser?.role === 'SALES_REP' || currentUser?.role === 'ADMIN');

  const filtered = quotations.filter(
    (q) =>
      (q.quoteNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.customerName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenEdit = (q: Quotation) => {
    setEditingQuote(q);
    setEditDiscount(q.totalDiscount || 10);
    setEditStage(q.stage);
    setEditRep(q.assignedTo || 'Jasmine Rao');
    setEditNotes(q.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;

    updateQuotation(editingQuote.id, {
      totalDiscount: Number(editDiscount) || 0,
      stage: editStage,
      assignedTo: editRep,
      notes: editNotes,
    });

    addActivity({
      id: `act-${Date.now()}`,
      type: 'negotiation',
      message: `${currentUser?.name || 'Sales Rep'} edited terms for Quotation #${editingQuote.quoteNumber} (Discount: ${editDiscount}%, Stage: ${editStage}).`,
      relatedTo: editingQuote.id,
      timestamp: new Date().toISOString(),
    });

    setEditingQuote(null);
    setNotice(`Quotation #${editingQuote.quoteNumber} updated successfully!`);
    setTimeout(() => setNotice(''), 4000);
  };

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

          {canCreateOrEdit && (
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
                  <div className="flex items-center gap-2">
                    <Link href={`/quotations/${q.id}`}>
                      <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3 h-3" />}>
                        View
                      </Button>
                    </Link>
                    {canCreateOrEdit && (
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenEdit(q);
                        }}
                      >
                        Edit
                      </Button>
                    )}
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
                        {canCreateOrEdit && (
                          <button
                            onClick={() => handleOpenEdit(q)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                        )}
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

      {/* Edit Quotation Modal (Sales Rep Only) */}
      {editingQuote && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">Edit Quotation #{editingQuote.quoteNumber}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Sales Representative Governance Control</p>
                </div>
              </div>
              <Badge variant="info">{editingQuote.customerName}</Badge>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Total Target Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={editDiscount}
                  onChange={(e) => setEditDiscount(Number(e.target.value) || 0)}
                  className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Quotation Stage</label>
                <select
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value as QuotationStage)}
                  className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                >
                  <option value="Draft">Draft / In Progress</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved / Sent</option>
                  <option value="Negotiation">Under Negotiation</option>
                  <option value="Confirmed">Confirmed / Billing</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Assigned Sales Representative</label>
                <input
                  type="text"
                  value={editRep}
                  onChange={(e) => setEditRep(e.target.value)}
                  className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Internal Notes & Commercial Terms</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add rep notes, special discount justifications, or custom terms..."
                  className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setEditingQuote(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
