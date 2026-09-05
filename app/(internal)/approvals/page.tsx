'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Check,
  Database,
  MessageSquare,
  ShieldCheck,
  Lock,
  Info,
} from 'lucide-react';
import { canApproveQuotation } from '@/lib/services/permissionService';

export default function ApprovalsPage() {
  const { approvalRequests, quotations, addApprovalAction, updateApprovalStage, addActivity, currentUser } = useStore();
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'Approve' | 'Reject' | 'Return' | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [decisionSuccess, setDecisionSuccess] = useState('');

  const pendingList = approvalRequests.filter((r) => r.status === 'Pending');
  const completedList = approvalRequests.filter((r) => r.status !== 'Pending');

  const handleDecisionSubmit = () => {
    if (!selectedReqId || !actionType) return;
    const req = approvalRequests.find((r) => r.id === selectedReqId);
    if (!req) return;

    const assignedToId = quotations.find((q) => q.id === req.quotationId)?.assignedToId;
    const authCheck = canApproveQuotation(
      { id: currentUser?.id || 'user-3', role: currentUser?.role || 'SALES_MANAGER' },
      req,
      assignedToId
    );

    if (!authCheck.allowed) {
      alert(`Authorization Error: ${authCheck.reason}`);
      return;
    }

    const actionMap = {
      Approve: 'Approved' as const,
      Reject: 'Rejected' as const,
      Return: 'Returned' as const,
    };

    const action = actionMap[actionType];

    addApprovalAction(selectedReqId, {
      id: `act-${Date.now()}`,
      approvalRequestId: selectedReqId,
      action,
      userId: currentUser?.id || 'user-3',
      userName: currentUser?.name || 'Mihail Shah',
      userRole: currentUser?.role || 'SALES_MANAGER',
      comment: reasonText || `Deal marked as ${actionType} with audit verification.`,
      timestamp: new Date().toISOString(),
    });

    if (actionType === 'Approve') {
      if (req.stage === 'Sales Manager' && req.riskLevel === 'HIGH') {
        updateApprovalStage(selectedReqId, 'Finance', 'Pending');
      } else {
        updateApprovalStage(selectedReqId, 'Completed', 'Approved');
      }
    } else if (actionType === 'Reject') {
      updateApprovalStage(selectedReqId, 'Rejected', 'Rejected');
    } else if (actionType === 'Return') {
      updateApprovalStage(selectedReqId, 'Sales Manager', 'Returned');
    }

    addActivity({
      id: `act-${Date.now()}`,
      type: 'approval',
      message: `${currentUser?.name || 'Mihail Shah'} recorded ${actionType} decision on Quote #${req.quotationNumber}. Reason: ${reasonText || 'Standard review completed.'}`,
      relatedTo: req.quotationId,
      timestamp: new Date().toISOString(),
    });

    setDecisionSuccess(`Decision for Quote #${req.quotationNumber} (${actionType}) recorded with full audit trail entry.`);
    setSelectedReqId(null);
    setActionType(null);
    setReasonText('');
    setTimeout(() => setDecisionSuccess(''), 5000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BackButton href="/dashboard" label="Dashboard" />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              B4 Discount Approvals Hub
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
          Multi-Stage Discount Approval & Audit Confirmation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review blended risk scores, inspect approval chain routing (Step 1: Sales Manager → Step 2: Finance), and enforce strict RBAC approval limits.
        </p>
      </div>

      {decisionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{decisionSuccess}</span>
        </div>
      )}

      {/* Decision Modal */}
      {selectedReqId && actionType && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedReqId(null);
            setActionType(null);
          }}
          title={`Record Decision: ${actionType} Quotation #${
            approvalRequests.find((r) => r.id === selectedReqId)?.quotationNumber || ''
          }`}
          subtitle="This decision will update the quotation status, advance the approval stage, and write a full audit trail record."
          maxWidth="lg"
        >
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Quotation #{approvalRequests.find((r) => r.id === selectedReqId)?.quotationNumber}</span>
                <span className="text-slate-400">Customer: {approvalRequests.find((r) => r.id === selectedReqId)?.customerName}</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Selected Action: <strong className="text-indigo-300">{actionType}</strong> · Stage: {approvalRequests.find((r) => r.id === selectedReqId)?.stage}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Audit Reason & Reviewer Notes (Required for Compliance Trace)
              </label>
              <textarea
                rows={3}
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder="Provide business justification, margin rationale, or instructions for revision..."
                className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedReqId(null);
                  setActionType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'Approve' ? 'primary' : actionType === 'Reject' ? 'danger' : 'outline'}
                size="sm"
                onClick={handleDecisionSubmit}
              >
                Confirm & Write to Audit Trail
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Pending Approvals Card */}
      <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Pending Approval Requests ({pendingList.length})</h2>
          </div>
          <span className="text-xs text-slate-400">Blended Risk Engine Monitored</span>
        </div>

        <Table
          data={pendingList}
          keyExtractor={(r) => r.id}
          columns={[
            {
              header: 'Quotation #',
              cell: (r) => (
                <div>
                  <Link href={`/quotations/${r.quotationId}`} className="font-mono font-bold text-white hover:text-indigo-400">
                    {r.quotationNumber}
                  </Link>
                  <div className="text-[10px] text-slate-500">{r.customerName}</div>
                </div>
              ),
            },
            {
              header: 'Required Step in Chain',
              cell: (r) => (
                <div className="space-y-0.5">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Step: {r.stage}
                  </span>
                  {r.riskLevel === 'HIGH' && (
                    <div className="text-[9px] text-purple-300 font-medium">Followed by Finance Sign-off</div>
                  )}
                </div>
              ),
            },
            {
              header: 'Blended Risk Score',
              cell: (r) => (
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-rose-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{r.riskScore}/100</span>
                  <Badge variant={r.riskLevel === 'HIGH' ? 'danger' : 'warning'}>{r.riskLevel}</Badge>
                </div>
              ),
            },
            {
              header: 'Decision Actions & Status',
              cell: (r) => {
                const assignedToId = quotations.find((q) => q.id === r.quotationId)?.assignedToId;
                const auth = canApproveQuotation(
                  { id: currentUser?.id || 'user-3', role: currentUser?.role || 'SALES_MANAGER' },
                  r,
                  assignedToId
                );

                if (!auth.allowed) {
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-amber-300/90 font-medium px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 max-w-[240px] truncate" title={auth.reason}>
                        <Lock className="w-3 h-3 inline mr-1 text-amber-400" />
                        {auth.reason?.split('.')[0] || `Awaiting ${r.stage}`}
                      </span>
                      <Link href={`/quotations/${r.quotationId}`}>
                        <Button size="sm" variant="outline">
                          Inspect
                        </Button>
                      </Link>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => {
                        setSelectedReqId(r.id);
                        setActionType('Approve');
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReqId(r.id);
                        setActionType('Return');
                      }}
                    >
                      Return
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setSelectedReqId(r.id);
                        setActionType('Reject');
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                );
              },
            },
          ]}
        />
      </div>

      {/* Completed Approvals History & Audit Log */}
      <div className="card p-6 bg-[var(--bg-card)]">
        <h2 className="text-base font-bold text-white mb-4">Completed Approvals & Audit History</h2>
        <Table
          data={completedList}
          keyExtractor={(r) => r.id}
          columns={[
            {
              header: 'Quotation #',
              cell: (r) => (
                <Link href={`/quotations/${r.quotationId}`} className="font-mono font-bold text-white">
                  {r.quotationNumber}
                </Link>
              ),
            },
            {
              header: 'Customer',
              cell: (r) => <span className="font-semibold text-xs text-white">{r.customerName}</span>,
            },
            {
              header: 'Final Status',
              cell: (r) => <Badge variant={r.status === 'Approved' || r.status === 'Auto-Approved' ? 'success' : 'danger'}>{r.status}</Badge>,
            },
            {
              header: 'Audit Trail Entries',
              cell: (r) => (
                <span className="font-mono text-xs text-indigo-300">
                  {r.actions?.length || 1} Recorded Log Actions
                </span>
              ),
            },
            {
              header: 'Details',
              cell: (r) => (
                <Link href={`/quotations/${r.quotationId}`}>
                  <Button size="sm" variant="outline">
                    View Audit
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
