'use client';

import React from 'react';
import type { BlendedRiskResult } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { ShieldAlert, AlertOctagon, TrendingUp, DollarSign, Layers } from 'lucide-react';

interface RiskPanelProps {
  risk: BlendedRiskResult;
}

export function RiskPanel({ risk }: RiskPanelProps) {
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score < 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getRiskBadgeVariant = (level: BlendedRiskResult['riskLevel']) => {
    if (level === 'LOW') return 'success';
    if (level === 'MEDIUM') return 'warning';
    return 'danger';
  };

  const marginEst = risk.estimatedMargin !== undefined ? risk.estimatedMargin : 5000;
  const marginPct = risk.estimatedMarginPercent !== undefined ? risk.estimatedMarginPercent : 32.4;

  return (
    <div className="card p-6 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--bg-card-hover)]">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[var(--accent-indigo-light)]" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">Blended Risk & Margin Matrix</h3>
        </div>
        <Badge variant={getRiskBadgeVariant(risk.riskLevel)} size="md">
          {risk.riskLevel} RISK
        </Badge>
      </div>

      {/* Score Gauge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
        {/* Blended Risk Score Gauge */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${getScoreColor(risk.riskScore)}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Blended Risk Score</span>
          <div className="text-3xl font-black font-mono my-2">{risk.riskScore}/100</div>
          <p className="text-[10px] opacity-90 leading-tight">Calculated across line items, margins & customer tier</p>
        </div>

        {/* Approval Level Required */}
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-hover)]/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] font-medium">
            <span>Approval Level</span>
            <TrendingUp className="w-4 h-4 text-[var(--accent-purple-light)]" />
          </div>
          <div className="text-lg font-black font-mono text-[var(--text-primary)] my-1">
            {risk.approvalLevel ? risk.approvalLevel.replace(/_/g, ' ') : 'AUTO APPROVED'}
          </div>
          <span className="text-[10px] text-[var(--text-tertiary)]">Target floor protection active</span>
        </div>

        {/* Total Margin Amount */}
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-hover)]/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] font-medium">
            <span>Gross Margin</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 my-1">
            ${marginEst.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            Margin: {marginPct.toFixed(1)}%
          </span>
        </div>

        {/* Violations Count */}
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-hover)]/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] font-medium">
            <span>Line Violations</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-[var(--text-primary)] my-1">
            {risk.violations ? risk.violations.length : 0} Item{risk.violations && risk.violations.length !== 1 ? 's' : ''}
          </div>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {risk.violations && risk.violations.length > 0 ? 'Requires Manager Approval' : 'Clean Line Validation'}
          </span>
        </div>
      </div>

      {/* Triggered Approval Matrix Reasons */}
      {risk.violations && risk.violations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[var(--accent-purple-light)]" />
            <span>Required Approval Triggers</span>
          </h4>
          <div className="space-y-1.5">
            {risk.violations.map((violation: string, idx: number) => (
              <div
                key={idx}
                className="text-xs text-[var(--text-primary)] bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20 px-3 py-2 rounded-lg flex items-center justify-between"
              >
                <span className="font-semibold">{violation}</span>
                <span className="text-[10px] uppercase font-bold text-[var(--accent-purple-light)] px-2 py-0.5 rounded bg-[var(--accent-purple)]/20">
                  {risk.approvalLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
