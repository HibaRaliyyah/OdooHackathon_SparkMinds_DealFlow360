'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { QuotationStatusBadge } from '@/components/customer/QuotationStatusBadge';
import { NegotiationForm, NegotiationFormData } from '@/components/customer/NegotiationForm';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { BackButton } from '@/components/ui/BackButton';
import {
  FileText,
  UserCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function CustomerQuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { quotations, updateQuotation, addActivity, addNotification } = useStore();

  const quoteId = Array.isArray(params.id) ? params.id[0] : params.id;
  const quotation = quotations.find((q) => q.id === quoteId || q.quoteNumber === quoteId);

  const [isNegotiateOpen, setIsNegotiateOpen] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  if (!quotation) {
    return (
      <div className="p-8 text-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-black text-white">Quotation Not Found</h2>
        <p className="text-xs text-slate-400">We couldn't locate this quotation. It may have expired or belongs to another account.</p>
        <Link href="/portal/quotations">
          <Button size="sm" variant="outline">
            Return to Quotations List
          </Button>
        </Link>
      </div>
    );
  }

  // Calculated totals
  const subtotal = quotation.subtotal || quotation.items.reduce((a, i) => a + i.unitPrice * i.quantity, 0);
  const totalDiscount = quotation.totalDiscount || quotation.items.reduce((a, i) => a + (i.unitPrice * i.quantity * (i.discount / 100)), 0);
  const totalTax = quotation.totalTax || quotation.items.reduce((a, i) => a + i.lineTotal * (i.taxPercent / 100), 0);
  const grandTotal = (quotation.oneTimeTotal || 0) + (quotation.recurringTotal || 0) || (subtotal - totalDiscount + totalTax);

  const hasRecurring = quotation.items.some((i) => i.isSubscription);

  // Handle Submit Negotiation
  const handleNegotiateSubmit = (data: NegotiationFormData) => {
    updateQuotation(quotation.id, {
      stage: 'Negotiation',
      totalDiscount: data.requestedDiscount * 10,
    });

    fetch(`/api/customer/quotations/${quotation.id}/negotiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestedDiscount: data.requestedDiscount, notes: data.reason }),
    }).catch(() => {});

    addActivity({
      id: `act-${Date.now()}`,
      type: 'negotiation',
      message: `Customer requested adjustment to ${data.requestedDiscount}% discount: "${data.reason}"`,
      relatedTo: quotation.id,
      timestamp: new Date().toISOString(),
    });

    addNotification({
      id: `notif-${Date.now()}`,
      userId: 'user-customer',
      title: 'Negotiation Submitted',
      message: `Your change request for ${quotation.quoteNumber} has been sent to ${quotation.assignedTo} for review.`,
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false,
    });

    setActionNotice(`Negotiation request for ${data.requestedDiscount}% discount submitted to ${quotation.assignedTo}.`);
    setTimeout(() => setActionNotice(''), 5000);
  };

  // Handle Accept Quote
  const handleConfirmAccept = () => {
    updateQuotation(quotation.id, {
      stage: 'Approved',
    });

    fetch(`/api/customer/quotations/${quotation.id}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmedAt: new Date().toISOString() }),
    }).catch(() => {});

    addActivity({
      id: `act-${Date.now()}`,
      type: 'approval',
      message: `Customer accepted final terms for ${quotation.quoteNumber}. Converted to active order.`,
      relatedTo: quotation.id,
      timestamp: new Date().toISOString(),
    });

    addNotification({
      id: `notif-${Date.now()}`,
      userId: 'user-customer',
      title: 'Quotation Accepted',
      message: `Thank you! Quotation ${quotation.quoteNumber} has been confirmed. Order fulfillment initialized.`,
      type: 'success',
      createdAt: new Date().toISOString(),
      read: false,
    });

    setShowAcceptModal(false);
    setActionNotice(`Quotation ${quotation.quoteNumber} accepted! Order confirmed and routed to warehouse fulfillment.`);
    setTimeout(() => setActionNotice(''), 5000);
  };

  // Handle Reject Quote
  const handleConfirmReject = () => {
    if (!rejectReason) return;

    updateQuotation(quotation.id, {
      stage: 'Rejected',
    });

    addActivity({
      id: `act-${Date.now()}`,
      type: 'approval',
      message: `Customer rejected quotation ${quotation.quoteNumber}. Reason: "${rejectReason}"`,
      relatedTo: quotation.id,
      timestamp: new Date().toISOString(),
    });

    setShowRejectModal(false);
    setActionNotice(`Quotation ${quotation.quoteNumber} status updated to Rejected.`);
    setTimeout(() => setActionNotice(''), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BackButton href="/portal/quotations" label="All Quotations" />
            <QuotationStatusBadge stage={quotation.stage} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            Quotation {quotation.quoteNumber}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Created: {new Date(quotation.createdAt).toLocaleDateString()} · Valid Until: {new Date(quotation.updatedAt || quotation.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {['Pending Approval', 'Awaiting Customer', 'Approved', 'Under Negotiation', 'Draft'].includes(quotation.stage) && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<MessageSquare className="w-4 h-4 text-indigo-400" />}
              onClick={() => setIsNegotiateOpen(true)}
            >
              Request Changes
            </Button>
          )}

          {['Pending Approval', 'Awaiting Customer', 'Approved', 'Under Negotiation'].includes(quotation.stage) && (
            <>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<XCircle className="w-4 h-4 text-rose-400" />}
                onClick={() => setShowRejectModal(true)}
              >
                Reject
              </Button>

              <Button
                size="sm"
                variant="primary"
                leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                onClick={() => setShowAcceptModal(true)}
              >
                Accept Quotation
              </Button>
            </>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Sales Representative Card */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-sm">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Sales Representative</div>
            <div className="text-sm font-extrabold text-white">{quotation.assignedTo}</div>
            <div className="text-xs text-slate-400">sales@dealflow360.demo · Direct Support</div>
          </div>
        </div>

        <Link href="/portal/orders">
          <span className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Track Orders <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Official Sales Representative Confirmation Card */}
      <div className="card p-6 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl space-y-3 shadow-xl animate-in fade-in duration-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-[var(--text-primary)]">
                Official Confirmation from Sales Representative ({quotation.assignedTo || 'Jasmine Rao'})
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Confirmed & Verified Proposal for Quote <strong className="font-mono text-emerald-400">{quotation.quoteNumber}</strong>
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            Sales Rep Verified ✓
          </span>
        </div>
        <div className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] space-y-1">
          <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Terms Approved & Formally Validated
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            "Your quotation terms, item quantities, and commercial pricing have been formally approved by your assigned Sales Representative (<strong>{quotation.assignedTo || 'Jasmine Rao'}</strong>). Your proposal is ready for final customer confirmation and immediate order allocation."
          </p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="card p-6 bg-[var(--bg-card)] space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" /> Products & Line Items
        </h3>

        <Table
          data={quotation.items}
          keyExtractor={(item) => item.id}
          columns={[
            {
              header: 'Product',
              cell: (item) => (
                <div>
                  <div className="font-bold text-white text-sm">{item.productName}</div>
                  {item.variantLabel && <div className="text-slate-400 text-xs">{item.variantLabel}</div>}
                  {item.isSubscription && <span className="text-[10px] font-bold text-purple-400">Subscription Plan</span>}
                </div>
              ),
            },
            {
              header: 'Quantity',
              cell: (item) => <span className="font-mono font-bold text-white">{item.quantity}</span>,
            },
            {
              header: 'Unit Price',
              cell: (item) => <span className="font-mono text-slate-300">${item.unitPrice.toLocaleString()}</span>,
            },
            {
              header: 'Discount',
              cell: (item) => <span className="font-mono font-bold text-amber-400">{item.discount}%</span>,
            },
            {
              header: 'Tax',
              cell: (item) => <span className="font-mono text-slate-400">{item.taxPercent}%</span>,
            },
            {
              header: 'Subtotal',
              cell: (item) => (
                <span className="font-mono font-black text-white">
                  ${item.lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              ),
            },
          ]}
        />
      </div>

      {/* Financial Summary & Billing Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Type Breakdown */}
        <div className="card p-6 bg-[var(--bg-card)] space-y-3">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider text-slate-400">
            Billing Breakdown
          </h3>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span>Billing Model</span>
              <span className="font-bold text-white">{hasRecurring ? 'Mixed (One-Time + Subscription)' : 'One-Time Payment'}</span>
            </div>
            {quotation.recurringTotal > 0 && (
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span>Monthly Recurring Amount</span>
                <span className="font-mono font-bold text-purple-300">${quotation.recurringTotal.toLocaleString()}/mo</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span>Payment Terms</span>
              <span className="font-bold text-emerald-400">Net 30 Days upon invoice generation</span>
            </div>
          </div>
        </div>

        {/* Grand Total Summary Box */}
        <div className="card p-6 bg-[var(--bg-card)] border border-indigo-500/20 space-y-3">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider text-slate-400">
            Financial Summary
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span className="font-mono font-bold">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Discount Total</span>
              <span className="font-mono font-bold">-${totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Tax</span>
              <span className="font-mono">${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-base font-black text-white pt-3 border-t border-slate-800">
              <span>Grand Total</span>
              <span className="font-mono text-emerald-400">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Negotiation Modal Form */}
      <NegotiationForm
        quoteNumber={quotation.quoteNumber}
        currentDiscount={10}
        isOpen={isNegotiateOpen}
        onClose={() => setIsNegotiateOpen(false)}
        onSubmit={handleNegotiateSubmit}
      />

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Accept Quotation {quotation.quoteNumber}?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              By accepting this quotation, you confirm the listed products, pricing, discounts, and payment terms. An active order will be automatically created.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500"
              >
                Accept Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" /> Reject Quotation {quotation.quoteNumber}
            </h3>
            <p className="text-xs text-slate-300">Please state a reason for rejecting this proposal:</p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Budget constraints, selected alternative vendor..."
              className="w-full bg-[#0f172a] border border-slate-700/60 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 min-h-[80px]"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
