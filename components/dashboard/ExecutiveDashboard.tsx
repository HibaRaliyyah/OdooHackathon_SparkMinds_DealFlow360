'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import styles from './ExecutiveDashboard.module.css';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Target,
  Percent,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  ChevronRight,
  UserCheck,
  Building2,
  Layers,
  BarChart2,
  PieChart,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Eye,
  Send,
  MessageSquare,
  HelpCircle,
  Kanban,
  Trophy,
} from 'lucide-react';

export function ExecutiveDashboard() {
  const {
    quotations,
    approvalRequests,
    dealHealthFlags,
    users,
    customers,
  } = useStore();

  const [aiQuery, setAiQuery] = useState('');
  const [revenueFilter, setRevenueFilter] = useState('This Quarter');

  // 1. Executive KPI Calculations
  const totalPipeline = 42700000;
  const weightedPipeline = 28400000;
  const revenueForecast = 14200000;
  const wonDealsCount = 18;
  const winRatePercent = 64.2;
  const pipelineCoverage = 3.8;

  // 2. Risk Overview Data
  const riskCategories = {
    high: { count: 3, value: 6400000, percent: 15 },
    medium: { count: 8, value: 12800000, percent: 30 },
    low: { count: 17, value: 23500000, percent: 55 },
  };

  // 3. Pipeline Kanban Stages
  const pipelineStages = [
    {
      name: 'Prospecting',
      totalValue: 9200000,
      count: 6,
      avgSize: 1530000,
      conversion: '82%',
      deals: [
        { name: 'Zenith Systems Hardware Expansion', company: 'Zenith Co', value: 3400000, owner: 'Jasmine Rao', age: '4 days', health: 'Healthy', risk: 'Low' },
        { name: 'OmniGlobal Cloud Setup', company: 'OmniGlobal', value: 5800000, owner: 'Alex Admin', age: '12 days', health: 'At Risk', risk: 'Medium' },
      ],
    },
    {
      name: 'Qualification',
      totalValue: 8400000,
      count: 5,
      avgSize: 1680000,
      conversion: '75%',
      deals: [
        { name: 'Delta LLC Care Package', company: 'Delta LLC', value: 4200000, owner: 'Jasmine Rao', age: '6 days', health: 'Healthy', risk: 'Low' },
        { name: 'Apex Tech Fleet Rollout', company: 'Apex Tech', value: 4200000, owner: 'Mihail Shah', age: '15 days', health: 'At Risk', risk: 'Medium' },
      ],
    },
    {
      name: 'Proposal',
      totalValue: 11500000,
      count: 7,
      avgSize: 1640000,
      conversion: '68%',
      deals: [
        { name: 'Nexora Industries Server Deployment', company: 'Nexora Corp', value: 6400000, owner: 'Jasmine Rao', age: '9 days', health: 'Critical', risk: 'High' },
        { name: 'Starlight Media Workstations', company: 'Starlight Ltd', value: 5100000, owner: 'Riya Iyer', age: '8 days', health: 'Healthy', risk: 'Low' },
      ],
    },
    {
      name: 'Negotiation',
      totalValue: 8800000,
      count: 4,
      avgSize: 2200000,
      conversion: '54%',
      deals: [
        { name: 'Beta Enterprise IT Procurement', company: 'Beta Industries', value: 4800000, owner: 'Alex Manager', age: '14 days', health: 'At Risk', risk: 'High' },
        { name: 'Vanguard Capital Infrastructure', company: 'Vanguard Inc', value: 4000000, owner: 'Jasmine Rao', age: '11 days', health: 'Healthy', risk: 'Medium' },
      ],
    },
    {
      name: 'Closed Won',
      totalValue: 4800000,
      count: 6,
      avgSize: 800000,
      conversion: '100%',
      deals: [
        { name: 'Acme Hardware & Services Deployment', company: 'Acme Corp', value: 3036350, owner: 'Jasmine Rao', age: 'Closed', health: 'Healthy', risk: 'Low' },
      ],
    },
  ];

  // 4. Anomaly Radar Items
  const anomalies = [
    { type: 'Quote Idle Time', severity: 'High', deal: 'Nexora Server Deployment', impact: '$6.4M', action: 'Engage deal champion immediately; idle 9+ days', age: '9d' },
    { type: 'Discount Deviation', severity: 'High', deal: 'Beta Enterprise IT', impact: '$4.8M', action: '20% requested vs 10% Silver ceiling limit', age: '3d' },
    { type: 'No Activity', severity: 'Medium', deal: 'OmniGlobal Cloud Setup', impact: '$5.8M', action: 'Schedule follow-up call with procurement lead', age: '7d' },
    { type: 'Stage Drop Rate', severity: 'Medium', deal: 'Apex Tech Fleet', impact: '$4.2M', action: 'Re-evaluate decision maker criteria', age: '12d' },
  ];

  // 5. AI Recommendations
  const aiRecommendations = [
    { priority: 'HIGH', issue: 'Nexora Industries has been idle for 9 days in Proposal stage.', impact: '$6.4M at risk', action: 'Schedule executive sponsor follow-up with CPO.', dealId: 'deal-nexora' },
    { priority: 'HIGH', issue: 'Beta Industries requested 20% discount exceeding Silver Tier limit.', impact: '$4.8M pipeline margin impact', action: 'Review Sales Manager B4 approval chain.', dealId: 'deal-beta' },
    { priority: 'MEDIUM', issue: 'Acme Corp upsell opportunity identified for Care Plan 2yr renewal.', impact: '+$450K recurring revenue', action: 'Send automated renewal quotation.', dealId: 'deal-acme' },
  ];

  // 6. Top At-Risk Deals
  const atRiskDeals = [
    { id: '1', deal: 'Nexora Server Deployment', account: 'Nexora Corp', owner: 'Jasmine Rao', stage: 'Proposal', value: '$6,400,000', age: '9 days', health: 'Critical', risk: 'High', lastActivity: '2 hours ago' },
    { id: '2', deal: 'Beta Enterprise IT Procurement', account: 'Beta Industries', owner: 'Alex Manager', stage: 'Negotiation', value: '$4,800,000', age: '14 days', health: 'At Risk', risk: 'High', lastActivity: '1 day ago' },
    { id: '3', deal: 'OmniGlobal Cloud Setup', account: 'OmniGlobal', owner: 'Alex Admin', stage: 'Prospecting', value: '$5,800,000', age: '12 days', health: 'At Risk', risk: 'Medium', lastActivity: '3 days ago' },
    { id: '4', deal: 'Apex Tech Fleet Rollout', account: 'Apex Tech', owner: 'Mihail Shah', stage: 'Qualification', value: '$4,200,000', age: '15 days', health: 'At Risk', risk: 'Medium', lastActivity: '5 days ago' },
  ];

  // 7. Team Performance Data
  const teamReps = [
    { name: 'Jasmine Rao', pipeline: '$18.7M', won: '$3.0M', winRate: '68%', quota: '112%', avgSize: '$1.8M', atRisk: 1 },
    { name: 'Mihail Shah', nameRole: 'Manager', pipeline: '$12.4M', won: '$4.2M', winRate: '72%', quota: '105%', avgSize: '$2.1M', atRisk: 1 },
    { name: 'Riya Iyer', nameRole: 'Finance Rep', pipeline: '$7.5M', won: '$2.8M', winRate: '60%', quota: '94%', avgSize: '$1.5M', atRisk: 0 },
    { name: 'Alex Admin', nameRole: 'Admin', pipeline: '$4.1M', won: '$1.4M', winRate: '50%', quota: '82%', avgSize: '$1.2M', atRisk: 1 },
  ];

  return (
    <div className={styles.dashboardGrid}>
      {/* ─── Executive 6 KPI Cards ─── */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiTitle}>Total Pipeline</span>
          <div className={styles.kpiValue}>$42.7M</div>
          <div className={`${styles.kpiSubtext} text-emerald-400`}>
            <TrendingUp className="w-3.5 h-3.5" /> +18.6% vs last 7 days
          </div>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiTitle}>Weighted Pipeline</span>
          <div className={styles.kpiValue}>$28.4M</div>
          <div className={`${styles.kpiSubtext} text-emerald-400`}>
            <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs last 7 days
          </div>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiTitle}>Revenue Forecast</span>
          <div className={styles.kpiValue}>$14.2M</div>
          <div className={`${styles.kpiSubtext} text-sky-400`}>
            <Target className="w-3.5 h-3.5" /> On track for Q3 target
          </div>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiTitle}>Won Deals</span>
          <div className={styles.kpiValue}>18</div>
          <div className={`${styles.kpiSubtext} text-emerald-400`}>
            <TrendingUp className="w-3.5 h-3.5" /> +4 deals this month
          </div>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiTitle}>Win Rate</span>
          <div className={styles.kpiValue}>64.2%</div>
          <div className={`${styles.kpiSubtext} text-emerald-400`}>
            <Percent className="w-3.5 h-3.5" /> +3.2% vs target
          </div>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiTitle}>Pipeline Coverage</span>
          <div className={styles.kpiValue}>3.8x</div>
          <div className={`${styles.kpiSubtext} text-emerald-400`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Healthy quota ratio
          </div>
        </div>
      </div>

      {/* ─── 3. Pipeline Management (Kanban/Table Hybrid) ─── */}
      <div className="card p-5 space-y-4">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <Kanban className="w-4 h-4 text-sky-400" />
            <span>Pipeline Management</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Active Stages: 5</span>
            <Link href="/quotations" className="text-xs font-semibold text-sky-400 hover:text-sky-300">
              View All Quotations &rarr;
            </Link>
          </div>
        </div>

        <div className={styles.pipelineGrid}>
          {pipelineStages.map((stage) => (
            <div key={stage.name} className={styles.stageColumn}>
              <div className={styles.stageHeader}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">{stage.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-secondary)] font-mono font-bold border border-[var(--border-medium)]">
                    {stage.count}
                  </span>
                </div>
                <div className="text-xs font-bold text-sky-400 font-mono">
                  ${(stage.totalValue / 1000000).toFixed(1)}M
                </div>
                <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-1">
                  <span>Avg: ${(stage.avgSize / 1000).toFixed(0)}k</span>
                  <span className="text-emerald-400 font-bold">{stage.conversion} conv</span>
                </div>
              </div>

              <div className="space-y-2">
                {stage.deals.map((deal, idx) => (
                  <div key={idx} className={styles.dealCard}>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider">{deal.company}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                          deal.risk === 'High'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : deal.risk === 'Medium'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {deal.risk} Risk
                      </span>
                    </div>

                    <div className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{deal.name}</div>

                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border-medium)] text-xs">
                      <span className="font-mono font-bold text-[var(--text-primary)]">${(deal.value / 1000000).toFixed(2)}M</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">{deal.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. Risk Overview Panel & 5. Anomaly Radar ─── */}
      <div className={styles.twoColGrid}>
        {/* Risk Overview Panel */}
        <div className="card p-5 space-y-4">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Risk Overview Management</span>
            </div>
            <span className="text-xs text-slate-600 font-medium">28 Active Deals Assessed</span>
          </div>

          <div className={styles.riskGrid}>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
              <span className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wider">High Risk</span>
              <div className="text-xl font-black text-slate-900 font-mono">{riskCategories.high.count} Deals</div>
              <div className="text-xs font-mono text-slate-700 font-bold">${(riskCategories.high.value / 1000000).toFixed(1)}M (15%)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">Medium Risk</span>
              <div className="text-xl font-black text-slate-900 font-mono">{riskCategories.medium.count} Deals</div>
              <div className="text-xs font-mono text-slate-700 font-bold">${(riskCategories.medium.value / 1000000).toFixed(1)}M (30%)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Low Risk</span>
              <div className="text-xl font-black text-slate-900 font-mono">{riskCategories.low.count} Deals</div>
              <div className="text-xs font-mono text-slate-700 font-bold">${(riskCategories.low.value / 1000000).toFixed(1)}M (55%)</div>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-600 font-semibold">
              <span>Risk Distribution Breakdown</span>
              <span>100% Pipeline Analyzed</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
              <div className="h-full bg-rose-500" style={{ width: '15%' }} title="High Risk: 15%" />
              <div className="h-full bg-amber-500" style={{ width: '30%' }} title="Medium Risk: 30%" />
              <div className="h-full bg-emerald-500" style={{ width: '55%' }} title="Low Risk: 55%" />
            </div>
          </div>
        </div>

        {/* Anomaly Radar */}
        <div className="card p-5 space-y-4">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <Zap className="w-4 h-4 text-purple-600" />
              <span>Anomaly Radar</span>
            </div>
            <span className="text-xs text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
              4 Detected Issues
            </span>
          </div>

          <div className="space-y-2.5">
            {anomalies.map((anom, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start justify-between text-xs gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{anom.type}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-300">
                      {anom.severity}
                    </span>
                    <span className="text-slate-500 text-[10px] font-semibold">{anom.age} idle</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium mt-1">{anom.action}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-rose-600 block">{anom.impact}</span>
                  <span className="text-[10px] text-slate-600 font-semibold">{anom.deal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 6. AI Recommendations & 7. Deal Health ─── */}
      <div className={styles.twoColGrid}>
        {/* AI Recommendations */}
        <div className="card p-5 space-y-4">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Recommendations Panel</span>
            </div>
            <span className="text-xs text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded border border-purple-300">Priority Action Queue</span>
          </div>

          <div className="space-y-3">
            {aiRecommendations.map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-300 text-[10px]">
                    {rec.priority} PRIORITY
                  </span>
                  <span className="font-mono text-emerald-600 font-bold">{rec.impact}</span>
                </div>
                <p className="text-slate-900 font-semibold">{rec.issue}</p>
                <span className="text-slate-600 text-[11px] font-medium block pt-1">Action: {rec.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deal Health Distribution */}
        <div className="card p-5 space-y-4">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>Deal Health Distribution</span>
            </div>
            <span className="text-xs text-slate-600 font-medium">Portfolio Health Score</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Healthy</span>
              <div className="text-2xl font-black text-emerald-950 font-mono">65%</div>
              <span className="text-[11px] font-semibold text-emerald-800">18 Deals</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">At Risk</span>
              <div className="text-2xl font-black text-amber-950 font-mono">25%</div>
              <span className="text-[11px] font-semibold text-amber-800">7 Deals</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider">Critical</span>
              <div className="text-2xl font-black text-rose-950 font-mono">10%</div>
              <span className="text-[11px] font-semibold text-rose-800">3 Deals</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Recommended Executive Action</span>
              <span className="text-[10px] text-purple-700 font-bold">Auto-suggested</span>
            </div>
            <p className="text-slate-700 font-medium">
              Escalate 3 Critical deals to Sales Leadership to resolve discount ceiling locks and prevent Q3 revenue slippage.
            </p>
          </div>
        </div>
      </div>

      {/* ─── 8. Top At-Risk Deals Management Table ─── */}
      <div className="card p-5 space-y-4">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Top At-Risk Deals Management</span>
          </div>
          <Link href="/deal-health" className="text-xs font-semibold text-purple-600 hover:text-purple-800">
            View All Risk Audits &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Deal Title</th>
                <th className="p-3">Account</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Value</th>
                <th className="p-3">Age</th>
                <th className="p-3">Health</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {atRiskDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{deal.deal}</td>
                  <td className="p-3 text-slate-700">{deal.account}</td>
                  <td className="p-3 text-slate-700">{deal.owner}</td>
                  <td className="p-3 text-purple-700 font-semibold">{deal.stage}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{deal.value}</td>
                  <td className="p-3 text-slate-600">{deal.age}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        deal.health === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-amber-100 text-amber-700 border border-amber-300'
                      }`}
                    >
                      {deal.health}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-rose-600">{deal.risk}</td>
                  <td className="p-3 text-slate-600">{deal.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 9. Team Performance Comparison & 10. Revenue Analytics ─── */}
      <div className={styles.twoColGrid}>
        {/* Team Performance Table */}
        <div className="card p-5 space-y-4">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Team Performance Comparison</span>
            </div>
            <span className="text-xs text-slate-600 font-medium">Sales Operations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Sales Rep</th>
                  <th className="p-2.5">Pipeline</th>
                  <th className="p-2.5">Won</th>
                  <th className="p-2.5">Win Rate</th>
                  <th className="p-2.5">Quota</th>
                  <th className="p-2.5">At Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {teamReps.map((rep, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{rep.name}</td>
                    <td className="p-2.5 font-mono text-slate-700">{rep.pipeline}</td>
                    <td className="p-2.5 font-mono text-emerald-600 font-bold">{rep.won}</td>
                    <td className="p-2.5 text-slate-700">{rep.winRate}</td>
                    <td className="p-2.5 font-bold text-purple-700">{rep.quota}</td>
                    <td className="p-2.5 font-bold text-rose-600">{rep.atRisk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Analytics Trend */}
        <div className="card p-5 space-y-4">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <BarChart2 className="w-4 h-4 text-purple-600" />
              <span>Revenue Analytics & Forecast</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {['This Week', 'This Month', 'This Quarter'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setRevenueFilter(tf)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    revenueFilter === tf ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Actual Revenue</span>
                <div className="text-lg font-bold text-emerald-600 font-mono mt-0.5">$11.8M</div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Forecast</span>
                <div className="text-lg font-bold text-purple-600 font-mono mt-0.5">$14.2M</div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Target</span>
                <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">$15.0M</div>
              </div>
            </div>

            {/* Progress Visualization */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Target Attainment (78.6%)</span>
                <span className="text-emerald-600 font-mono font-bold">$11.8M / $15.0M</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full" style={{ width: '78.6%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        {/* Escalation Center */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Escalation Center</span>
          </div>
          <Link href="/approvals" className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors">
            Trigger Escalation
          </Link>
        </div>

        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900">Nexora Industries ($6.4M)</span>
              <p className="text-slate-700 text-[11px] font-medium">Idle for 9 days in Proposal stage. High revenue risk.</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px] border border-rose-300">CRITICAL</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900">Beta Industries ($4.8M)</span>
              <p className="text-slate-700 text-[11px] font-medium">20% discount request pending Sales Manager approval.</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px] border border-amber-300">PENDING</span>
          </div>
        </div>
      </div>
    </div>
  );
}
