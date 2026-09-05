'use client';

import React, { useState } from 'react';
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
  TrendingUp,
  Filter,
  DollarSign,
  PieChart as PieChartIcon,
  Percent,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const SALES_BY_CATEGORY = [
  { name: 'Hardware', revenue: 245000, discountAvg: 12.5 },
  { name: 'Services', revenue: 98000, discountAvg: 8.0 },
  { name: 'Software', revenue: 76000, discountAvg: 10.2 },
  { name: 'Subscription', revenue: 142000, discountAvg: 16.4 },
];

export default function ReportsPage() {
  const { quotations, products } = useStore();

  const [period, setPeriod] = useState('month');
  const [rep, setRep] = useState('all');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [exportNotice, setExportNotice] = useState('');

  const totalValue = quotations.reduce((acc, q) => acc + q.oneTimeTotal + q.recurringTotal, 0);
  const avgRisk = quotations.reduce((acc, q) => acc + (q.blendedRisk?.riskScore || 20), 0) / (quotations.length || 1);

  const handleExport = (format: 'PDF' | 'XLS') => {
    setExportNotice(`Exporting filtered report as ${format}...`);
    setTimeout(() => {
      setExportNotice(`Sales_Performance_Report_${period}_${new Date().toISOString().slice(0, 10)}.${format.toLowerCase()} generated!`);
      setTimeout(() => setExportNotice(''), 4000);
    }, 600);
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
          <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
            Executive Sales Performance & Governance Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic KPI analysis with multi-dimensional filtering across Reps, Dates, Approval Stages, and Categories.
          </p>
        </div>

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
      </div>

      {exportNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 4 Reporting Filters (Period, Sales Team / Rep, Approval Status, Product / Category) */}
      <div className="card p-5 bg-[var(--bg-card)] border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>A7 Reporting Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Period */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month (Q3)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Sales Rep */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Sales Team / Rep
            </label>
            <select
              value={rep}
              onChange={(e) => setRep(e.target.value)}
              className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Sales Reps</option>
              <option value="jasmine">Jasmine Rao</option>
              <option value="david">David Miller</option>
              <option value="sarah">Sarah Jenkins</option>
            </select>
          </div>

          {/* Approval Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Approval Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approvals</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Product / Category */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Product / Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="hardware">Hardware</option>
              <option value="services">Services</option>
              <option value="subscriptions">Subscriptions</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Pipeline Value" subtitle="Aggregated deal volume ($ ARR)">
          <div className="text-3xl font-black font-mono text-white my-2">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-emerald-400 font-semibold">+22% YoY growth rate</p>
        </Card>

        <Card title="Average Blended Risk Score" subtitle="Across all active deals">
          <div className="text-3xl font-black font-mono text-purple-300 my-2">
            {avgRisk.toFixed(1)}/100
          </div>
          <p className="text-xs text-slate-400">Target floor margin protected</p>
        </Card>

        <Card title="Approval Cycle Velocity" subtitle="Average sign-off speed">
          <div className="text-3xl font-black font-mono text-emerald-400 my-2">
            1.4 Days
          </div>
          <p className="text-xs text-slate-400">Multi-stage routing speedup: 3.5x</p>
        </Card>
      </div>

      {/* Category Performance & Discount Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 bg-[var(--bg-card)]">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <BarChart3 className="w-4 h-4 text-indigo-400" /> Revenue by Product Category
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_BY_CATEGORY}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Discounted & Best Selling Items */}
        <div className="card p-6 bg-[var(--bg-card)]">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <Percent className="w-4 h-4 text-amber-400" /> Best Selling vs Most Discounted SKUs
          </h3>

          <div className="space-y-3">
            {[
              { name: 'Laptop Pro 14', category: 'Hardware', sales: '$245,000', avgDiscount: '12.5%', status: 'Best Seller' },
              { name: 'Onsite Setup Service', category: 'Services', sales: '$98,000', avgDiscount: '18.0%', status: 'High Discount' },
              { name: 'Care Plan 2yr', category: 'Subscription', sales: '$142,000', avgDiscount: '10.0%', status: 'Best Margin' },
            ].map((sku) => (
              <div key={sku.name} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{sku.name}</div>
                  <div className="text-slate-400 text-[11px]">{sku.category} · Volume: {sku.sales}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-400">{sku.avgDiscount} Avg. Discount</span>
                  <Badge variant={sku.status === 'Best Seller' ? 'success' : sku.status === 'High Discount' ? 'danger' : 'purple'}>
                    {sku.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
