'use client';

import React from 'react';

interface QuotationStatusBadgeProps {
  stage: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function QuotationStatusBadge({ stage, size = 'sm' }: QuotationStatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (stage) {
      case 'Paid':
      case 'Fulfilled':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Allocated':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'Confirmed':
      case 'Accepted':
      case 'Approved':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Awaiting Allocation':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
      case 'Awaiting Customer':
      case 'Pending Approval':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Under Negotiation':
      case 'Negotiation':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'Rejected':
      case 'Cancelled':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Draft':
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  const getLabel = () => {
    if (stage === 'Pending Approval') return 'Awaiting Customer';
    if (stage === 'Awaiting Allocation') return 'Awaiting Finance Allocation';
    if (stage === 'Allocated') return 'Warehouse Allocated (Ready to Pay)';
    return stage;
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${getBadgeStyle()}`}
    >
      {getLabel()}
    </span>
  );
}
