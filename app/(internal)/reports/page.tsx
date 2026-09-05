'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/data/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import {
  BarChart3,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Filter,
  Percent,
  RotateCcw,
  FileSearch,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { downloadReportPDF, downloadReportXLS } from '@/lib/utils/documentExporter';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function ReportsPage() {
  const { quotations, products, users, currentUser } = useStore();

  const canExport = currentUser?.role !== 'SALES_REP';

  const [period, setPeriod] = useState('all');
  const [rep, setRep] = useState('all');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [exportNotice, setExportNotice] = useState('');

  // Extract unique sales reps for dropdown (ensuring David Miller, Jasmine Rao, Sarah Jenkins are present)
  const salesReps = useMemo(() => {
    const list: { id: string; name: string }[] = [
      { id: 'user-2', name: 'Jasmine Rao' },
      { id: 'user-3', name: 'David Miller' },
      { id: 'user-4', name: 'Sarah Jenkins' },
      { id: 'user-1', name: 'Alex Admin' },
    ];
    const seenNames = new Set<string>(list.map((r) => r.name));
    const seenIds = new Set<string>(list.map((r) => r.id));

    users.forEach((u) => {
      if (['SALES_REP', 'SALES_MANAGER', 'ADMIN'].includes(u.role) && !seenNames.has(u.name)) {
        seenNames.add(u.name);
        let uniqueId = u.id;
        if (seenIds.has(uniqueId)) {
          uniqueId = `user-${u.id}-${u.name.replace(/\s+/g, '-').toLowerCase()}`;
        }
        seenIds.add(uniqueId);
        list.push({ id: uniqueId, name: u.name });
      }
    });

    quotations.forEach((q) => {
      if (q.assignedTo && !seenNames.has(q.assignedTo)) {
        seenNames.add(q.assignedTo);
        const baseId = q.assignedToId || q.assignedTo;
        let uniqueId = baseId;
        if (seenIds.has(uniqueId)) {
          uniqueId = `rep-${q.assignedTo.replace(/\s+/g, '-').toLowerCase()}`;
        }
        seenIds.add(uniqueId);
        list.push({ id: uniqueId, name: q.assignedTo });
      }
    });

    return list;
  }, [users, quotations]);

  // Dynamic Filtering Logic across multi-dimensional criteria
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      // 1. Period filter
      if (period !== 'all') {
        const qDate = new Date(q.createdAt);
        const now = new Date();
        const daysDiff = (now.getTime() - qDate.getTime()) / (1000 * 3600 * 24);

        if (period === 'today') {
          if (daysDiff > 3) return false;
        } else if (period === 'week') {
          if (daysDiff > 14) return false;
        } else if (period === 'month') {
          if (daysDiff > 45) return false;
        } else if (period === 'year') {
          if (qDate.getFullYear() !== now.getFullYear() && daysDiff > 365) return false;
        }
      }

      // 2. Sales Rep filter
      if (rep !== 'all') {
        const repLower = rep.toLowerCase();
        const matchesId = (q.assignedToId || '').toLowerCase() === repLower;
        const matchesName = (q.assignedTo || '').toLowerCase().includes(repLower);
        if (!matchesId && !matchesName) return false;
      }

      // 3. Approval Status filter
      if (status !== 'all') {
        const stageLower = (q.stage || '').toLowerCase();
        if (status === 'pending') {
          if (!['pending approval', 'draft', 'negotiation'].includes(stageLower)) return false;
        } else if (status === 'approved') {
          if (!['approved', 'confirmed', 'fulfillment', 'partially fulfilled', 'fulfilled', 'invoiced', 'paid'].includes(stageLower)) return false;
        } else if (status === 'rejected') {
          if (!['rejected', 'returned', 'cancelled'].includes(stageLower)) return false;
        }
      }

      // 4. Product / Category filter
      if (category !== 'all') {
        const catLower = category.toLowerCase();
        const hasMatchingCategory = (q.items || []).some((item) => {
          const prod = products.find((p) => p.id === item.productId || p.name === item.productName);
          const typeLower = (prod?.type || '').toLowerCase();
          if (catLower === 'hardware') return typeLower === 'hardware';
          if (catLower === 'services') return typeLower === 'services';
          if (catLower === 'software') return typeLower === 'software';
          if (catLower === 'subscriptions' || catLower === 'subscription') {
            return typeLower === 'subscription' || item.isSubscription;
          }
          return false;
        });
        if (!hasMatchingCategory) return false;
      }

      return true;
    });
  }, [quotations, products, period, rep, status, category]);

  // Derived Dynamic Metrics
  const totalValue = useMemo(() => {
    return filteredQuotations.reduce((acc, q) => acc + (q.oneTimeTotal || 0) + (q.recurringTotal || 0), 0);
  }, [filteredQuotations]);

  const avgRisk = useMemo(() => {
    if (filteredQuotations.length === 0) return 0;
    const sumRisk = filteredQuotations.reduce((acc, q) => acc + (q.blendedRisk?.riskScore || 20), 0);
    return sumRisk / filteredQuotations.length;
  }, [filteredQuotations]);

  const approvedCount = useMemo(() => {
    return filteredQuotations.filter((q) =>
      ['Approved', 'Confirmed', 'Fulfillment', 'Partially Fulfilled', 'Fulfilled', 'Invoiced', 'Paid'].includes(q.stage)
    ).length;
  }, [filteredQuotations]);

  // Revenue by Category Chart Data (Dynamically aggregated)
  const categoryChartData = useMemo(() => {
    const catMap: Record<string, { revenue: number; discountSum: number; count: number }> = {
      Hardware: { revenue: 0, discountSum: 0, count: 0 },
      Services: { revenue: 0, discountSum: 0, count: 0 },
      Software: { revenue: 0, discountSum: 0, count: 0 },
      Subscription: { revenue: 0, discountSum: 0, count: 0 },
    };

    filteredQuotations.forEach((q) => {
      q.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId || p.name === item.productName);
        let typeStr = prod?.type || (item.isSubscription ? 'Subscription' : 'Hardware');
        if (!catMap[typeStr]) typeStr = 'Hardware';

        catMap[typeStr].revenue += item.lineTotal || 0;
        catMap[typeStr].discountSum += item.discount || 0;
        catMap[typeStr].count += 1;
      });
    });

    return Object.keys(catMap).map((catName) => ({
      name: catName,
      revenue: Math.round(catMap[catName].revenue),
      discountAvg: catMap[catName].count > 0 ? parseFloat((catMap[catName].discountSum / catMap[catName].count).toFixed(1)) : 0,
    }));
  }, [filteredQuotations, products]);

  // Top SKUs (Dynamically aggregated)
  const topSkus = useMemo(() => {
    const skuMap: Record<string, { name: string; category: string; sales: number; discountSum: number; count: number }> = {};

    filteredQuotations.forEach((q) => {
      q.items.forEach((item) => {
        const name = item.productName;
        const prod = products.find((p) => p.id === item.productId || p.name === name);
        const cat = prod?.type || (item.isSubscription ? 'Subscription' : 'Hardware');

        if (!skuMap[name]) {
          skuMap[name] = { name, category: cat, sales: 0, discountSum: 0, count: 0 };
        }
        skuMap[name].sales += item.lineTotal || 0;
        skuMap[name].discountSum += item.discount || 0;
        skuMap[name].count += 1;
      });
    });

    const skuList = Object.values(skuMap).map((sku) => {
      const avgDisc = sku.count > 0 ? sku.discountSum / sku.count : 0;
      let statusTag: 'Best Seller' | 'High Discount' | 'Best Margin' = 'Best Margin';
      if (avgDisc > 14) statusTag = 'High Discount';
      else if (sku.sales > 3000) statusTag = 'Best Seller';

      return {
        name: sku.name,
        category: sku.category,
        sales: `$${Math.round(sku.sales).toLocaleString()}`,
        avgDiscount: `${avgDisc.toFixed(1)}%`,
        status: statusTag,
        rawSales: sku.sales,
      };
    });

    skuList.sort((a, b) => b.rawSales - a.rawSales);
    return skuList.slice(0, 4);
  }, [filteredQuotations, products]);

  const hasActiveFilters = period !== 'all' || rep !== 'all' || status !== 'all' || category !== 'all';

  const resetFilters = () => {
    setPeriod('all');
    setRep('all');
    setStatus('all');
    setCategory('all');
  };

  const handleExport = (format: 'PDF' | 'XLS') => {
    const filename = `Sales_Performance_Report_${new Date().toISOString().slice(0, 10)}`;
    const headers = ['Quote Number', 'Customer Name', 'Sales Rep', 'Stage', 'Risk Score', 'Total Value ($)', 'Created Date'];
    const rows = filteredQuotations.map((q) => [
      q.quoteNumber || '',
      q.customerName || '',
      q.assignedTo || '',
      q.stage || '',
      `${q.blendedRisk?.riskScore || 0}/100`,
      `$${((q.oneTimeTotal || 0) + (q.recurringTotal || 0)).toLocaleString()}`,
      q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '',
    ]);

    if (format === 'XLS') {
      downloadReportXLS('Executive Sales Report', headers, rows, filename);
      setExportNotice(`Successfully exported ${filteredQuotations.length} records to ${filename}.csv!`);
      setTimeout(() => setExportNotice(''), 5000);
    } else {
      const kpis = [
        { label: 'Total Pipeline Volume', value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
        { label: 'Avg Blended Risk Score', value: `${avgRisk.toFixed(1)}/100` },
        { label: 'Approved Deals', value: `${approvedCount}` },
      ];
      downloadReportPDF('Executive Sales Report', kpis, headers, rows, filename);
      setExportNotice(`Successfully downloaded ${filename}.pdf for ${filteredQuotations.length} records!`);
      setTimeout(() => setExportNotice(''), 5000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header with Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BackButton href="/dashboard" label="Dashboard" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                A7 Reporting & Analytics Hub
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mt-1.5">
            Executive Sales Performance & Governance Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic KPI analysis with multi-dimensional filtering across Reps, Dates, Approval Stages, and Categories.
          </p>
        </div>

        {canExport && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileText className="w-4 h-4 text-rose-400" />}
              onClick={() => handleExport('PDF')}
            >
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
              onClick={() => handleExport('XLS')}
            >
              Export XLS
            </Button>
          </div>
        )}
      </div>

      {exportNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 4 Reporting Filters (Period, Sales Team / Rep, Approval Status, Product / Category) */}
      <div className="card p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>A7 Reporting Filters</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {filteredQuotations.length} of {quotations.length} Deals Matched
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Period */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month (Q3)</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Sales Rep */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Sales Team / Rep
            </label>
            <select
              value={rep}
              onChange={(e) => setRep(e.target.value)}
              className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
            >
              <option value="all">All Sales Reps</option>
              {salesReps.map((r, idx) => (
                <option key={`rep-opt-${r.id}-${idx}`} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Approval Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Approval Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approvals</option>
              <option value="approved">Approved / Confirmed</option>
              <option value="rejected">Rejected / Cancelled</option>
            </select>
          </div>

          {/* Product / Category */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Product / Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
            >
              <option value="all">All Categories</option>
              <option value="hardware">Hardware</option>
              <option value="services">Services</option>
              <option value="software">Software</option>
              <option value="subscriptions">Subscriptions</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Pipeline Value" subtitle="Aggregated deal volume ($ ARR)">
          <div className="text-3xl font-black font-mono text-[var(--text-primary)] my-2">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-emerald-400 font-semibold">
            {filteredQuotations.length} deals in filtered scope
          </p>
        </Card>

        <Card title="Average Blended Risk Score" subtitle="Across filtered deals">
          <div className="text-3xl font-black font-mono text-purple-300 my-2">
            {avgRisk.toFixed(1)}/100
          </div>
          <p className="text-xs text-slate-400">Target floor margin protected</p>
        </Card>

        <Card title="Approval Cycle Velocity" subtitle="Sign-off throughput & speed">
          <div className="text-3xl font-black font-mono text-emerald-400 my-2">
            {approvedCount} Approved
          </div>
          <p className="text-xs text-slate-400">
            {filteredQuotations.length > 0
              ? `${Math.round((approvedCount / filteredQuotations.length) * 100)}% conversion rate`
              : 'No deals selected'}
          </p>
        </Card>
      </div>

      {/* Category Performance & Discount Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 bg-[var(--bg-card)]">
          <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border-subtle)]">
            <BarChart3 className="w-4 h-4 text-indigo-400" /> Revenue by Product Category (Filtered)
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val >= 1000 ? Math.round(val / 1000) + 'k' : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Discounted & Best Selling Items */}
        <div className="card p-6 bg-[var(--bg-card)]">
          <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border-subtle)]">
            <Percent className="w-4 h-4 text-amber-400" /> Best Selling vs Most Discounted SKUs
          </h3>

          {topSkus.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No product SKUs match the current filter selection.
            </div>
          ) : (
            <div className="space-y-3">
              {topSkus.map((sku, idx) => (
                <div
                  key={`${sku.name}-${idx}`}
                  className="p-3.5 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[var(--text-primary)]">{sku.name}</div>
                    <div className="text-[var(--text-secondary)] text-[11px]">
                      {sku.category} · Volume: {sku.sales}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-400 block mb-1">
                      {sku.avgDiscount} Avg. Discount
                    </span>
                    <Badge
                      variant={
                        sku.status === 'Best Seller'
                          ? 'success'
                          : sku.status === 'High Discount'
                          ? 'danger'
                          : 'purple'
                      }
                    >
                      {sku.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filtered Quotations Detail List Table */}
      <div className="card p-6 bg-[var(--bg-card)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-emerald-400" /> Matched Quotations & Deals ({filteredQuotations.length})
          </h3>
        </div>

        {filteredQuotations.length === 0 ? (
          <div className="p-8 text-center bg-[var(--bg-card-hover)] rounded-2xl border border-[var(--border-subtle)] space-y-3">
            <div className="text-[var(--text-primary)] text-sm font-semibold">No quotations found for active filter combination</div>
            <p className="text-xs text-[var(--text-tertiary)]">Try adjusting your period, rep, approval status, or category filter.</p>
            <Button size="sm" variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <Table
            data={filteredQuotations}
            keyExtractor={(q) => q.id}
            emptyMessage="No quotations found for active filter combination"
            columns={[
              {
                header: 'Quote #',
                cell: (q) => <span className="font-mono font-bold text-indigo-300">{q.quoteNumber}</span>,
              },
              {
                header: 'Customer',
                cell: (q) => <span className="font-medium text-[var(--text-primary)]">{q.customerName}</span>,
              },
              {
                header: 'Sales Rep',
                cell: (q) => <span className="text-[var(--text-secondary)] text-xs">{q.assignedTo}</span>,
              },
              {
                header: 'Stage',
                cell: (q) => (
                  <Badge
                    variant={
                      ['Approved', 'Confirmed', 'Paid', 'Fulfilled'].includes(q.stage)
                        ? 'success'
                        : ['Rejected', 'Cancelled'].includes(q.stage)
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {q.stage}
                  </Badge>
                ),
              },
              {
                header: 'Risk Score',
                cell: (q) => (
                  <span
                    className={`font-mono font-bold ${
                      (q.blendedRisk?.riskScore || 0) > 70
                        ? 'text-rose-400'
                        : (q.blendedRisk?.riskScore || 0) > 40
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {q.blendedRisk?.riskScore || 0}/100
                  </span>
                ),
              },
              {
                header: 'Total Value ($)',
                cell: (q) => (
                  <span className="font-mono font-black text-[var(--text-primary)]">
                    ${((q.oneTimeTotal || 0) + (q.recurringTotal || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
