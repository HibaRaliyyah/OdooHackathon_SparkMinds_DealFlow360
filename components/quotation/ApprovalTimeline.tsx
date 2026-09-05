'use client';

import React from 'react';
import type { ApprovalRequest } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface ApprovalTimelineProps {
  approvalRequest?: ApprovalRequest;
}

export function ApprovalTimeline({ approvalRequest }: ApprovalTimelineProps) {
  if (!approvalRequest) {
    return (
      <div className="p-6 border border-dashed border-[var(--border-subtle)] rounded-xl text-center text-xs text-[var(--text-tertiary)]">
        No formal approval request submitted for this quotation. (Standard Rep Authority)
      </div>
    );
  }

  const stages = [
    { key: 'Sales Manager', label: 'Sales Manager Stage' },
    { key: 'Finance', label: 'Finance & Risk Stage' },
    { key: 'Completed', label: 'Completed Stage' },
  ];

  return (
    <div className="card p-6 bg-[var(--bg-card)]">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-6">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">Multi-Stage Approval Audit Trail</h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Workflow ID: {approvalRequest.id}</p>
        </div>
        <Badge
          variant={
            approvalRequest.status === 'Approved' || approvalRequest.status === 'Auto-Approved'
              ? 'success'
              : approvalRequest.status === 'Rejected'
              ? 'danger'
              : 'warning'
          }
          size="md"
        >
          {approvalRequest.status}
        </Badge>
      </div>

      {/* Auto-Approved Banner */}
      {approvalRequest.stage === 'Auto-Approved' ? (
        <div className="mb-8">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-400">Auto-Approved — No Manual Review Required</div>
              <p className="text-[11px] text-emerald-300/70 mt-0.5">
                LOW risk quotation with all discounts within the allowed subscription plan and product category ceilings.
                Bypassed Sales Manager & Finance approval stages.
              </p>
            </div>
          </div>

          {/* Single step completed indicator */}
          <div className="flex items-center justify-center mt-6">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full border-2 bg-emerald-500 text-white border-emerald-400 flex items-center justify-center font-bold text-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)] mt-2">Auto-Approved</span>
              <span className="text-[10px] text-emerald-400">System Decision</span>
            </div>
          </div>
        </div>
      ) : (
      /* Stage Stepper Progress */
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--border-subtle)] -translate-y-1/2 z-0" />

        {stages.map((st, idx) => {
          const isCurrentStage = approvalRequest.stage === st.key;
          const isPassed =
            approvalRequest.status === 'Approved' ||
            (approvalRequest.stage === 'Finance' && st.key === 'Sales Manager') ||
            (approvalRequest.stage === 'Completed');

          let nodeClass = 'bg-[var(--bg-card-hover)] border-[var(--border-subtle)] text-[var(--text-tertiary)]';
          if (isPassed) nodeClass = 'bg-emerald-500 text-white border-emerald-400';
          if (isCurrentStage && approvalRequest.status === 'Pending')
            nodeClass = 'bg-[var(--accent-indigo)] text-white border-indigo-400 ring-4 ring-indigo-500/20';
          if (isCurrentStage && approvalRequest.status === 'Rejected')
            nodeClass = 'bg-rose-500 text-white border-rose-400';

          return (
            <div key={st.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${nodeClass}`}
              >
                {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)] mt-2">{st.label}</span>
              <span className="text-[10px] text-[var(--text-tertiary)]">
                {isPassed ? 'Passed' : isCurrentStage ? approvalRequest.status : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>
      )}

      {/* Audit Action Log */}
      <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
        <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Approval History & Notes</h4>
        {approvalRequest.actions.length === 0 ? (
          <p className="text-xs text-[var(--text-tertiary)] italic">Awaiting initial stage action...</p>
        ) : (
          approvalRequest.actions.map((act) => (
            <div
              key={act.id}
              className="p-3.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl flex items-start gap-3"
            >
              <div className="mt-0.5">
                {act.action === 'Approved' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : act.action === 'Rejected' ? (
                  <XCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">{act.userName}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    {new Date(act.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  <span className="font-semibold text-[var(--accent-purple-light)]">[{act.userRole}]</span> {act.action}:{' '}
                  {act.comment || act.reason || 'No comments provided'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
