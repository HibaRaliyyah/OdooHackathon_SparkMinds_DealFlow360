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
  RotateCcw,
  Receipt,
  Zap,
  ShieldCheck,
  Download,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { downloadReportPDF, downloadReportXLS, formatDateForExcel } from '@/lib/utils/documentExporter';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function ReportsPage() {
  const { quotations, products, users, currentUser, invoices, subscriptions } = useStore();

  const canExport = currentUser?.role !== 'SALES_REP';

  // Active Report Tab: 'billing' | 'sales' | 'subscriptions' | 'governance'
  const [activeTab, setActiveTab] = useState<'billing' | 'sales' | 'subscriptions' | 'governance'>('billing');

  // Filter States
  const [period, setPeriod] = useState('all');
  const [rep, setRep] = useState('all');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [exportNotice, setExportNotice] = useState('');

  // Extract unique sales reps for dropdown
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

  // Dynamic Filtering Logic across Quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      if (period !== 'all') {
        const qDate = new Date(q.createdAt);
        const now = new Date();
        const daysDiff = (now.getTime() - qDate.getTime()) / (1000 * 3600 * 24);

        if (period === 'today' && daysDiff > 3) return false;
        if (period === 'week' && daysDiff > 14) return false;
        if (period === 'month' && daysDiff > 45) return false;
        if (period === 'year' && qDate.getFullYear() !== now.getFullYear() && daysDiff > 365) return false;
      }

      if (rep !== 'all') {
        const repLower = rep.toLowerCase();
        const matchesId = (q.assignedToId || '').toLowerCase() === repLower;
        const matchesName = (q.assignedTo || '').toLowerCase().includes(repLower);
        if (!matchesId && !matchesName) return false;
      }

      if (status !== 'all') {
        const stageLower = (q.stage || '').toLowerCase();
        if (status === 'pending' && !['pending approval', 'draft', 'negotiation'].includes(stageLower)) return false;
        if (status === 'approved' && !['approved', 'confirmed', 'fulfillment', 'partially fulfilled', 'fulfilled', 'invoiced', 'paid'].includes(stageLower)) return false;
        if (status === 'rejected' && !['rejected', 'returned', 'cancelled'].includes(stageLower)) return false;
      }

      if (category !== 'all') {
        const catLower = category.toLowerCase();
        const hasMatchingCategory = (q.items || []).some((item) => {
          const prod = products.find((p) => p.id === item.productId || p.name === item.productName);
          const typeLower = (prod?.type || '').toLowerCase();
          if (catLower === 'hardware') return typeLower === 'hardware';
          if (catLower === 'services') return typeLower === 'services';
          if (catLower === 'software') return typeLower === 'software';
          if (catLower === 'subscriptions' || catLower === 'subscription') return typeLower === 'subscription' || item.isSubscription;
          return false;
        });
        if (!hasMatchingCategory) return false;
      }

      return true;
    });
  }, [quotations, products, period, rep, status, category]);

  // Dynamic Filtering for Invoices
  const filteredInvoices = useMemo(() => {
    return (invoices || []).filter((inv) => {
      if (status !== 'all') {
        const sLower = (inv.status || '').toLowerCase();
        if (status === 'approved' && sLower !== 'paid') return false;
        if (status === 'pending' && sLower !== 'pending' && sLower !== 'draft') return false;
      }
      return true;
    });
  }, [invoices, status]);

  // Billing Metrics
  const billingTotals = useMemo(() => {
    const totalBilled = filteredInvoices.reduce((acc, inv) => acc + (inv.total || (inv as any).amount || 0), 0);
    const totalPaid = filteredInvoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
    const balanceDue = totalBilled - totalPaid;
    const paidRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100;
    return { totalBilled, totalPaid, balanceDue, paidRate };
  }, [filteredInvoices]);

  // Sales Metrics
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
      ['Approved', 'Confirmed', 'Fulfillment', 'Fulfilled', 'Invoiced', 'Paid'].includes(q.stage)
    ).length;
  }, [filteredQuotations]);

  // Subscriptions Metrics
  const subMetrics = useMemo(() => {
    const list = subscriptions || [];
    const activeSubs = list.filter((s) => s.status === 'Active');
    const totalArr = activeSubs.reduce((acc, s) => acc + (s.currentAmount || (s as any).amount || 0), 0);
    const avgAcv = activeSubs.length > 0 ? totalArr / activeSubs.length : 0;
    return { activeCount: activeSubs.length, totalArr, avgAcv };
  }, [subscriptions]);

  // Category Chart Data
  const categoryChartData = useMemo(() => {
    const catMap: Record<string, { revenue: number; discountSum: number; count: number }> = {
      Hardware: { revenue: 0, discountSum: 0, count: 0 },
      Services: { revenue: 0, discountSum: 0, count: 0 },
      Software: { revenue: 0, discountSum: 0, count: 0 },
      Subscriptions: { revenue: 0, discountSum: 0, count: 0 },
    };

    filteredQuotations.forEach((q) => {
      q.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId || p.name === item.productName);
        let catName = prod?.type || (item.isSubscription ? 'Subscriptions' : 'Hardware');
        if (catName === 'Subscription') catName = 'Subscriptions';

        if (!catMap[catName]) {
          catMap[catName] = { revenue: 0, discountSum: 0, count: 0 };
        }
        catMap[catName].revenue += item.lineTotal || 0;
        catMap[catName].discountSum += item.discount || 0;
        catMap[catName].count += 1;
      });
    });

    return Object.keys(catMap).map((catName) => ({
      name: catName,
      revenue: Math.round(catMap[catName].revenue),
      discountAvg: catMap[catName].count > 0 ? parseFloat((catMap[catName].discountSum / catMap[catName].count).toFixed(1)) : 0,
    }));
  }, [filteredQuotations, products]);

  const hasActiveFilters = period !== 'all' || rep !== 'all' || status !== 'all' || category !== 'all';

  const resetFilters = () => {
    setPeriod('all');
    setRep('all');
    setStatus('all');
    setCategory('all');
  };

  // EXPORT HANDLER across Active Report Tabs
  const handleExport = (format: 'PDF' | 'XLS') => {
    const dateStr = formatDateForExcel(new Date());

    if (activeTab === 'billing') {
      const filename = `DealFlow360_Billing_System_Report_${dateStr}`;
      const headers = ['Invoice Number', 'Quotation Ref', 'Customer Name', 'Billing Type', 'Status', 'Issue Date', 'Due Date', 'Total Amount ($)', 'Paid Amount ($)', 'Balance Due ($)'];
      const rows = filteredInvoices.map((inv) => [
        inv.invoiceNumber || inv.id,
        inv.quotationNumber || 'N/A',
        inv.customerName || 'N/A',
        `${inv.type || 'One-Time'} Billing`,
        inv.status || 'Pending',
        formatDateForExcel(inv.createdAt),
        formatDateForExcel(inv.dueDate),
        `$${(inv.total || (inv as any).amount || 0).toFixed(2)}`,
        `$${(inv.paidAmount || 0).toFixed(2)}`,
        `$${((inv.total || (inv as any).amount || 0) - (inv.paidAmount || 0)).toFixed(2)}`,
      ]);

      if (format === 'XLS') {
        downloadReportXLS('Billing & Invoices System Report', headers, rows, filename);
        setExportNotice(`Successfully exported ${rows.length} billing records to ${filename}.csv!`);
      } else {
        const kpis = [
          { label: 'Total Billed Amount', value: `$${billingTotals.totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
          { label: 'Payments Collected', value: `$${billingTotals.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
          { label: 'Outstanding Balance Due', value: `$${billingTotals.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
        ];
        downloadReportPDF('Billing & Invoices System Report', kpis, headers, rows, filename);
        setExportNotice(`Successfully downloaded ${filename}.pdf for ${rows.length} billing records!`);
      }
    } else if (activeTab === 'sales') {
      const filename = `Sales_Performance_Report_${dateStr}`;
      const headers = ['Quote Number', 'Customer Name', 'Sales Rep', 'Stage', 'Risk Score', 'Total Value ($)', 'Created Date'];
      const rows = filteredQuotations.map((q) => [
        q.quoteNumber || '',
        q.customerName || '',
        q.assignedTo || '',
        q.stage || '',
        `${q.blendedRisk?.riskScore || 0}/100`,
        `$${((q.oneTimeTotal || 0) + (q.recurringTotal || 0)).toLocaleString()}`,
        formatDateForExcel(q.createdAt),
      ]);

      if (format === 'XLS') {
        downloadReportXLS('Executive Sales Report', headers, rows, filename);
        setExportNotice(`Successfully exported ${rows.length} sales records to ${filename}.csv!`);
      } else {
        const kpis = [
          { label: 'Total Pipeline Volume', value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: 'Avg Blended Risk Score', value: `${avgRisk.toFixed(1)}/100` },
          { label: 'Approved Deals', value: `${approvedCount}` },
        ];
        downloadReportPDF('Executive Sales Report', kpis, headers, rows, filename);
        setExportNotice(`Successfully downloaded ${filename}.pdf for ${rows.length} sales records!`);
      }
    } else if (activeTab === 'subscriptions') {
      const filename = `Subscription_Revenue_Report_${dateStr}`;
      const headers = ['Contract ID', 'Customer Name', 'Plan Tier', 'Billing Cycle', 'Annual ACV ($)', 'Next Renewal Date', 'Status'];
      const rows = (subscriptions || []).map((sub) => [
        sub.id,
        sub.customerName || 'N/A',
        sub.plan || (sub as any).planName || 'Enterprise Tier',
        sub.cycle || (sub as any).billingCycle || 'Annual',
        `$${(sub.currentAmount || (sub as any).amount || 0).toLocaleString()}`,
        formatDateForExcel(sub.nextBillDate || (sub as any).nextBillingDate),
        sub.status || 'Active',
      ]);

      if (format === 'XLS') {
        downloadReportXLS('Subscription & ARR Revenue Report', headers, rows, filename);
        setExportNotice(`Successfully exported ${rows.length} subscription records to ${filename}.csv!`);
      } else {
        const kpis = [
          { label: 'Active Contracts', value: `${subMetrics.activeCount}` },
          { label: 'Total ARR Volume', value: `$${subMetrics.totalArr.toLocaleString()}` },
          { label: 'Avg ACV / Account', value: `$${Math.round(subMetrics.avgAcv).toLocaleString()}` },
        ];
        downloadReportPDF('Subscription & ARR Revenue Report', kpis, headers, rows, filename);
        setExportNotice(`Successfully downloaded ${filename}.pdf for ${rows.length} subscription records!`);
      }
    } else {
      const filename = `Risk_Governance_Audit_Report_${dateStr}`;
      const headers = ['Quote #', 'Customer Name', 'Risk Level', 'Blended Risk Score', 'Stage', 'Violations Count', 'Required Approval'];
      const rows = filteredQuotations.map((q) => [
        q.quoteNumber,
        q.customerName,
        q.blendedRisk?.riskLevel || 'LOW',
        `${q.blendedRisk?.riskScore || 20}/100`,
        q.stage,
        `${(q.blendedRisk?.violations || []).length} rule(s)`,
        q.blendedRisk?.approvalLevel || 'AUTO_APPROVED',
      ]);

      if (format === 'XLS') {
        downloadReportXLS('Risk Governance Audit Report', headers, rows, filename);
        setExportNotice(`Successfully exported ${rows.length} governance records to ${filename}.csv!`);
      } else {
        const kpis = [
          { label: 'High Risk Deals', value: `${filteredQuotations.filter((q) => q.blendedRisk?.riskLevel === 'HIGH').length}` },
          { label: 'Avg Blended Risk Score', value: `${avgRisk.toFixed(1)}/100` },
          { label: 'Multi-Stage Signoff Rate', value: `${Math.round((approvedCount / Math.max(1, filteredQuotations.length)) * 100)}%` },
        ];
        downloadReportPDF('Risk Governance Audit Report', kpis, headers, rows, filename);
        setExportNotice(`Successfully downloaded ${filename}.pdf for ${rows.length} governance records!`);
      }
    }

    setTimeout(() => setExportNotice(''), 5000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header with Master Download Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BackButton href="/dashboard" label="Dashboard" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                A7 Reporting & Billing Hub
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mt-1.5">
            Executive Billing System & Governance Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Download official PDF & Excel/Spreadsheet statements for Billing System, Sales Pipelines, Subscriptions, and Risk Audits.
          </p>
        </div>

        {canExport && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Download className="w-4 h-4 text-white" />}
              onClick={() => handleExport('PDF')}
            >
              Export PDF Document
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
              onClick={() => handleExport('XLS')}
            >
              Export XLS / CSV
            </Button>
          </div>
        )}
      </div>

      {exportNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Report Module Navigation Tabs (Billing, Sales, Subscriptions, Governance) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl">
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'billing'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Billing System & Revenue Report</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Sales & Deal Lifecycle Report</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'subscriptions'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Subscriptions & ARR Report</span>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'governance'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Risk Governance & Audit Report</span>
        </button>
      </div>

      {/* Reporting Filters */}
      <div className="card p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Scope & Criteria Filters</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Active Scope: {activeTab.toUpperCase()} MODE
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
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
              Status Filter
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending / Unpaid</option>
              <option value="approved">Approved / Paid</option>
              <option value="rejected">Rejected / Cancelled</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Product Category
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

      {/* TAB 1: BILLING SYSTEM REPORT VIEW */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Billing KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card title="Total Billed Revenue" subtitle="Sum of generated invoices">
              <div className="text-2xl font-black font-mono text-white my-1">
                ${billingTotals.totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400">{filteredInvoices.length} invoices generated</p>
            </Card>

            <Card title="Payments Collected" subtitle="Confirmed received funds">
              <div className="text-2xl font-black font-mono text-emerald-400 my-1">
                ${billingTotals.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-emerald-300 font-semibold">{billingTotals.paidRate}% collection rate</p>
            </Card>

            <Card title="Outstanding Balance" subtitle="Pending receivables">
              <div className="text-2xl font-black font-mono text-amber-400 my-1">
                ${billingTotals.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-amber-300 font-semibold">Net credit terms active</p>
            </Card>

            <Card title="Paid Accounts Ratio" subtitle="Completed billing statements">
              <div className="text-2xl font-black font-mono text-indigo-400 my-1">
                {filteredInvoices.filter((i) => i.status === 'Paid').length} Paid / {filteredInvoices.length}
              </div>
              <p className="text-xs text-slate-400">Reconciled in ERP</p>
            </Card>
          </div>

          {/* Billing System Data Table */}
          <div className="card p-6 bg-[var(--bg-card)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-400" /> Official Billing System & Invoices Statement
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Format: PDF / Excel Downloadable
              </span>
            </div>

            <Table
              data={filteredInvoices}
              keyExtractor={(i) => i.id}
              columns={[
                {
                  header: 'Invoice #',
                  cell: (i) => <span className="font-mono font-bold text-indigo-400">{i.invoiceNumber || i.id}</span>,
                },
                {
                  header: 'Quotation Ref',
                  cell: (i) => <span className="font-mono text-xs text-slate-300">{i.quotationNumber || 'N/A'}</span>,
                },
                {
                  header: 'Customer Name',
                  cell: (i) => <span className="font-semibold text-white">{i.customerName}</span>,
                },
                {
                  header: 'Billing Structure',
                  cell: (i) => (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${i.type === 'Recurring' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
                      {i.type || 'One-Time'} Billing
                    </span>
                  ),
                },
                {
                  header: 'Due Date',
                  cell: (i) => <span className="font-mono text-xs text-rose-300">{i.dueDate || 'N/A'}</span>,
                },
                {
                  header: 'Total Amount',
                  cell: (i) => <span className="font-mono font-bold text-white">${(i.total || (i as any).amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>,
                },
                {
                  header: 'Paid Amount',
                  cell: (i) => <span className="font-mono font-bold text-emerald-400">${(i.paidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>,
                },
                {
                  header: 'Balance Due',
                  cell: (i) => <span className="font-mono font-bold text-amber-400">${((i.total || (i as any).amount || 0) - (i.paidAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>,
                },
                {
                  header: 'Status',
                  cell: (i) => (
                    <Badge variant={i.status === 'Paid' ? 'success' : i.status === 'Overdue' ? 'danger' : 'warning'}>
                      {i.status}
                    </Badge>
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* TAB 2: EXECUTIVE SALES & PIPELINE REPORT */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
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

          <div className="card p-6 bg-[var(--bg-card)] space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Executive Sales & Deal Pipeline Details
            </h3>
            <Table
              data={filteredQuotations}
              keyExtractor={(q) => q.id}
              columns={[
                {
                  header: 'Quote #',
                  cell: (q) => <span className="font-mono font-bold text-white">{q.quoteNumber}</span>,
                },
                {
                  header: 'Customer Name',
                  cell: (q) => <span className="font-semibold text-white">{q.customerName}</span>,
                },
                {
                  header: 'Sales Rep',
                  cell: (q) => <span className="text-slate-300">{q.assignedTo || 'Unassigned'}</span>,
                },
                {
                  header: 'Stage',
                  cell: (q) => <Badge variant={q.stage === 'Approved' ? 'success' : 'warning'}>{q.stage}</Badge>,
                },
                {
                  header: 'Risk Score',
                  cell: (q) => (
                    <span className="font-mono font-bold text-purple-300">{q.blendedRisk?.riskScore || 20}/100</span>
                  ),
                },
                {
                  header: 'Total Deal Value',
                  cell: (q) => (
                    <span className="font-mono font-bold text-emerald-400">
                      ${((q.oneTimeTotal || 0) + (q.recurringTotal || 0)).toLocaleString()}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIPTIONS & ARR REPORT */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Active SaaS Subscriptions" subtitle="Active renewal agreements">
              <div className="text-3xl font-black font-mono text-sky-400 my-2">
                {subMetrics.activeCount} Subscriptions
              </div>
              <p className="text-xs text-sky-300 font-semibold">100% Contract SLA Active</p>
            </Card>

            <Card title="Annual Recurring Revenue (ARR)" subtitle="Total annualized contract value">
              <div className="text-3xl font-black font-mono text-emerald-400 my-2">
                ${subMetrics.totalArr.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400">Annual recurring billing cycle</p>
            </Card>

            <Card title="Average Account ACV" subtitle="Per account subscription value">
              <div className="text-3xl font-black font-mono text-indigo-400 my-2">
                ${Math.round(subMetrics.avgAcv).toLocaleString()}
              </div>
              <p className="text-xs text-slate-400">Enterprise Cloud Tiers</p>
            </Card>
          </div>

          <div className="card p-6 bg-[var(--bg-card)] space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" /> Subscription Contracts & ARR Revenue Table
            </h3>
            <Table
              data={subscriptions || []}
              keyExtractor={(s) => s.id}
              columns={[
                {
                  header: 'Contract ID',
                  cell: (s) => <span className="font-mono font-bold text-sky-400">{s.id}</span>,
                },
                {
                  header: 'Customer Name',
                  cell: (s) => <span className="font-semibold text-white">{s.customerName}</span>,
                },
                {
                  header: 'Plan Tier',
                  cell: (s) => <span className="text-slate-300 font-bold">{s.plan || (s as any).planName || 'Enterprise Tier'}</span>,
                },
                {
                  header: 'Billing Cycle',
                  cell: (s) => <span className="text-slate-400 text-xs">{s.cycle || (s as any).billingCycle || 'Annual'}</span>,
                },
                {
                  header: 'Annual Value (ACV)',
                  cell: (s) => <span className="font-mono font-bold text-emerald-400">${(s.currentAmount || (s as any).amount || 0).toLocaleString()}</span>,
                },
                {
                  header: 'Next Renewal Date',
                  cell: (s) => <span className="font-mono text-xs text-indigo-300">{s.nextBillDate || (s as any).nextBillingDate || '2027-08-31'}</span>,
                },
                {
                  header: 'Status',
                  cell: (s) => <Badge variant={s.status === 'Active' ? 'success' : 'warning'}>{s.status}</Badge>,
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* TAB 4: RISK GOVERNANCE & AUDIT REPORT */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="High Risk Flagged Deals" subtitle="Margin impact violations">
              <div className="text-3xl font-black font-mono text-rose-400 my-2">
                {filteredQuotations.filter((q) => q.blendedRisk?.riskLevel === 'HIGH').length} Flagged
              </div>
              <p className="text-xs text-rose-300 font-semibold">Requires Finance signoff</p>
            </Card>

            <Card title="Average Risk Score" subtitle="Blended discount risk rating">
              <div className="text-3xl font-black font-mono text-purple-300 my-2">
                {avgRisk.toFixed(1)}/100
              </div>
              <p className="text-xs text-slate-400">Risk ceiling policy enforced</p>
            </Card>

            <Card title="Multi-Stage Signoff Rate" subtitle="Executive approval throughput">
              <div className="text-3xl font-black font-mono text-emerald-400 my-2">
                {Math.round((approvedCount / Math.max(1, filteredQuotations.length)) * 100)}%
              </div>
              <p className="text-xs text-slate-400">Governance compliant</p>
            </Card>
          </div>

          <div className="card p-6 bg-[var(--bg-card)] space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Risk Governance & Multi-Stage Approval Audit Trail
            </h3>
            <Table
              data={filteredQuotations}
              keyExtractor={(q) => q.id}
              columns={[
                {
                  header: 'Quote #',
                  cell: (q) => <span className="font-mono font-bold text-white">{q.quoteNumber}</span>,
                },
                {
                  header: 'Customer',
                  cell: (q) => <span className="font-semibold text-white">{q.customerName}</span>,
                },
                {
                  header: 'Risk Level',
                  cell: (q) => (
                    <Badge variant={q.blendedRisk?.riskLevel === 'HIGH' ? 'danger' : 'success'}>
                      {q.blendedRisk?.riskLevel || 'LOW'}
                    </Badge>
                  ),
                },
                {
                  header: 'Risk Score',
                  cell: (q) => <span className="font-mono font-bold text-purple-300">{q.blendedRisk?.riskScore || 20}/100</span>,
                },
                {
                  header: 'Stage',
                  cell: (q) => <Badge variant={q.stage === 'Approved' ? 'success' : 'warning'}>{q.stage}</Badge>,
                },
                {
                  header: 'Rule Violations',
                  cell: (q) => <span className="text-xs text-amber-300 font-mono">{(q.blendedRisk?.violations || []).length} rule(s)</span>,
                },
                {
                  header: 'Required Approver',
                  cell: (q) => <span className="text-xs text-indigo-300 font-semibold">{q.blendedRisk?.approvalLevel || 'AUTO_APPROVED'}</span>,
                },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
