'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RiskPanel } from '@/components/quotation/RiskPanel';
import { ApprovalTimeline } from '@/components/quotation/ApprovalTimeline';
import { createInvoiceFromFulfillment } from '@/lib/services/billingService';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Boxes,
  Building,
} from 'lucide-react';
import Link from 'next/link';
import type { FulfillmentOrder } from '@/lib/types';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    quotations,
    approvalRequests,
    updateQuotation,
    addApprovalAction,
    updateApprovalStage,
    currentUser,
    addFulfillmentOrder,
    addInvoice,
    addActivity,
  } = useStore() as any;

  const [approvalNotes, setApprovalNotes] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');

  const quotation = quotations.find((q: any) => q.id === id);
  const approvalReq = approvalRequests.find((r: any) => r.quotationId === id);

  if (!quotation) {
    return (
      <div className="p-12 text-center text-xs text-[var(--text-tertiary)]">
        Quotation not found. <Link href="/quotations" className="text-[var(--accent-purple-light)] underline">Back to List</Link>
      </div>
    );
  }

  const totalAmount = quotation.oneTimeTotal + quotation.recurringTotal;

  const handleApprovalAction = (actionType: 'APPROVE' | 'REJECT') => {
    if (!approvalReq) return;

    const action = {
      id: `act-${Date.now()}`,
      approvalRequestId: approvalReq.id,
      userId: currentUser?.id || 'user-2',
      userName: currentUser?.name || 'Marcus Vance',
      userRole: currentUser?.role || 'SALES_MANAGER',
      action: actionType === 'APPROVE' ? ('Approved' as const) : ('Rejected' as const),
      comment: approvalNotes || (actionType === 'APPROVE' ? 'Approved based on business justification.' : 'Discount exceeds allowed threshold.'),
      timestamp: new Date().toISOString(),
    };

    addApprovalAction(approvalReq.id, action);

    if (actionType === 'APPROVE') {
      if (approvalReq.stage === 'Sales Manager' && quotation.blendedRisk?.riskLevel === 'HIGH') {
        updateApprovalStage(approvalReq.id, 'Finance', 'Pending');
      } else {
        updateApprovalStage(approvalReq.id, approvalReq.stage, 'Approved');
        updateQuotation(quotation.id, { stage: 'Approved' });
      }
    } else {
      updateApprovalStage(approvalReq.id, approvalReq.stage, 'Rejected');
      updateQuotation(quotation.id, { stage: 'Rejected' });
    }

    addActivity({
      id: `act-${Date.now()}`,
      message: `${actionType === 'APPROVE' ? 'Approved' : 'Rejected'} ${quotation.quoteNumber} (${quotation.customerName})`,
      type: 'approval',
      timestamp: new Date().toISOString(),
    });

    setShowApprovalModal(false);
  };

  const handleConfirmAndFulfill = () => {
    updateQuotation(quotation.id, { stage: 'Confirmed' });

    const fulfillment: FulfillmentOrder = {
      id: `ful-${quotation.id}`,
      quotationId: quotation.id,
      quotationNumber: quotation.quoteNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      status: 'Allocated',
      allocations: quotation.items.map((i: any) => ({
        warehouseId: 'wh-1',
        warehouseName: 'North America Hub',
        productId: i.productId,
        productName: i.productName,
        requestedQty: i.quantity,
        allocatedQty: i.quantity,
        shippedQty: 0,
        backorderQty: 0,
      })),
      shipments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (addFulfillmentOrder) addFulfillmentOrder(fulfillment);

    const inv = createInvoiceFromFulfillment(quotation, fulfillment, 'One-Time');
    if (addInvoice) addInvoice(inv);

    router.push('/fulfillment');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-200 pb-12">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/quotations">
            <button className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[var(--text-primary)] font-mono">{quotation.quoteNumber}</h1>
              <Badge variant={quotation.stage === 'Approved' ? 'success' : 'warning'}>{quotation.stage}</Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {quotation.stage === 'Pending Approval' && (
            <>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setModalAction('REJECT');
                  setShowApprovalModal(true);
                }}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Reject Deal
              </Button>
              <Button
                variant="success"
                size="md"
                onClick={() => {
                  setModalAction('APPROVE');
                  setShowApprovalModal(true);
                }}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Approve Deal
              </Button>
            </>
          )}

          {quotation.stage === 'Approved' && (
            <Button variant="primary" size="md" onClick={handleConfirmAndFulfill} leftIcon={<Boxes className="w-4 h-4" />}>
              Confirm Deal & Allocate Stock
            </Button>
          )}
        </div>
      </div>

      {/* Customer Header Info */}
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo-light)] flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">{quotation.customerName}</h2>
            <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mt-0.5">
              <span>Assigned Rep: <strong className="text-[var(--text-primary)]">{quotation.assignedTo}</strong></span>
            </div>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-xs text-[var(--text-tertiary)]">Total Deal Value</span>
          <div className="text-2xl font-black text-emerald-400">${totalAmount.toLocaleString()}</div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="card p-6 bg-[var(--bg-card)]">
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Quotation Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-tertiary)] uppercase">
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2 text-right">Unit Price</th>
                <th className="px-4 py-2 text-center">Qty</th>
                <th className="px-4 py-2 text-right">Discount %</th>
                <th className="px-4 py-2 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item: any) => (
                <tr key={item.id} className="border-b border-[var(--border-subtle)] text-xs">
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{item.productName}</td>
                  <td className="px-4 py-3 text-right font-mono">${item.unitPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[var(--text-primary)]">
                    {item.discount || 0}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                    ${(item.lineTotal || item.unitPrice * item.quantity * (1 - (item.discount || 0) / 100)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blended Risk Matrix & Approval Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RiskPanel risk={quotation.blendedRisk || { riskScore: 25, riskLevel: 'LOW', worstLine: null, violations: [], estimatedMargin: 12000, estimatedMarginPercent: 32, requiresApproval: false, approvalLevel: 'AUTO_APPROVED', explanation: [] }} />
        <ApprovalTimeline approvalRequest={approvalReq} />
      </div>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title={`${modalAction === 'APPROVE' ? 'Approve' : 'Reject'} Quotation ${quotation.quoteNumber}`}
        subtitle="This action will update approval workflow status and record audit entry."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Approval Notes / Justification
            </label>
            <textarea
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Enter approval comments, margin mitigation terms, or rejection reasons..."
              className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowApprovalModal(false)}>
              Cancel
            </Button>
            <Button
              variant={modalAction === 'APPROVE' ? 'success' : 'danger'}
              size="sm"
              onClick={() => handleApprovalAction(modalAction)}
            >
              Confirm {modalAction === 'APPROVE' ? 'Approval' : 'Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
