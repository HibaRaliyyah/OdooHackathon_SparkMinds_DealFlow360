'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { QuotationStatusBadge } from '@/components/customer/QuotationStatusBadge';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { FileText, Search, Filter, Eye, MessageSquare } from 'lucide-react';

export default function CustomerQuotationsPage() {
  const { currentUser, quotations, negotiations } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const customerCompany = currentUser?.company || 'Acme Corp';

  // Filter quotations belonging to customer
  const customerQuotes = quotations.filter((q) => {
    const matchesCustomer =
      q.customerName.toLowerCase().includes(customerCompany.toLowerCase()) || q.customerName.includes('Acme');
    if (!matchesCustomer) return false;

    if (search) {
      const qLower = search.toLowerCase();
      const matchNum = q.quoteNumber.toLowerCase().includes(qLower);
      const matchRep = q.assignedTo.toLowerCase().includes(qLower);
      if (!matchNum && !matchRep) return false;
    }

    if (statusFilter !== 'all') {
      const stageLower = q.stage.toLowerCase();
      if (statusFilter === 'pending' && !['pending approval', 'awaiting customer', 'draft'].includes(stageLower)) return false;
      if (statusFilter === 'negotiating' && !['under negotiation', 'negotiation'].includes(stageLower)) return false;
      if (statusFilter === 'accepted' && !['approved', 'accepted', 'confirmed', 'fulfilled'].includes(stageLower)) return false;
      if (statusFilter === 'rejected' && !['rejected', 'cancelled'].includes(stageLower)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Assigned Quotations
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Quotations & Proposals</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review pricing details, request changes, or accept final quotation terms.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quote # or rep..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Awaiting Customer</option>
            <option value="negotiating">Under Negotiation</option>
            <option value="accepted">Accepted / Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="card p-6 bg-[var(--bg-card)] space-y-4">
        <Table
          data={customerQuotes}
          keyExtractor={(q) => q.id}
          emptyMessage="No quotations found matching your search or filters."
          columns={[
            {
              header: 'Quotation No.',
              cell: (q) => {
                const qNeg = (negotiations || []).find((n) => n.quotationId === q.id || n.quotationNumber === q.quoteNumber);
                const unreadRepMsgs = (qNeg?.messages || []).filter((m) => (m.senderRole === 'SALES_REP' || m.senderRole === 'SALES_MANAGER') && m.read === false).length;
                const isUnderNegotiation = (q.stage === 'Negotiation' || (qNeg && qNeg.status !== 'Resolved')) && q.stage !== 'Confirmed' && q.stage !== 'Approved';

                return (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600">{q.quoteNumber}</span>
                    {isUnderNegotiation && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-cyan-500 text-slate-950 border border-cyan-300 flex items-center gap-1 shadow-md animate-pulse">
                        <MessageSquare className="w-3 h-3 text-slate-950" />
                        <span>{unreadRepMsgs > 0 ? `${unreadRepMsgs} New Reply` : 'Negotiation'}</span>
                      </span>
                    )}
                  </div>
                );
              },
            },
            {
              header: 'Created Date',
              cell: (q) => <span className="text-slate-700 text-xs font-medium">{new Date(q.createdAt).toLocaleDateString()}</span>,
            },
            {
              header: 'Valid Until',
              cell: (q) => <span className="text-slate-700 text-xs font-medium">{new Date(q.updatedAt || q.createdAt).toLocaleDateString()}</span>,
            },
            {
              header: 'Total Value',
              cell: (q) => (
                <span className="font-mono font-black text-slate-900">
                  ${((q.oneTimeTotal || 0) + (q.recurringTotal || 0)).toLocaleString()}
                </span>
              ),
            },
            {
              header: 'Discount',
              cell: (q) => <span className="font-mono font-bold text-amber-700">{q.totalDiscount ? `$${q.totalDiscount}` : '10%'}</span>,
            },
            {
              header: 'Status',
              cell: (q) => <QuotationStatusBadge stage={q.stage} />,
            },
            {
              header: 'Action',
              cell: (q) => (
                <Link href={`/portal/quotations/${q.id}`}>
                  <Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                    View Quote
                  </Button>
                </Link>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
