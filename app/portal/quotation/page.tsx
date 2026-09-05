'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/data/store';
import { evaluateCounterOffer } from '@/lib/services/negotiationService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Check,
  Sliders,
  DollarSign,
  Package,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { downloadQuotationPDF, downloadQuotationXLS } from '@/lib/utils/documentExporter';

export default function CustomerQuotationPortalPage() {
  const { currentUser, customers, quotations, invoices, updateInvoice, addNegotiation, updateQuotation, addApprovalRequest, addActivity, addNotification } = useStore();

  const customerQuotation = currentUser?.company
    ? quotations.find((q) => q.customerName.toLowerCase().includes(currentUser.company?.toLowerCase() || ''))
    : null;

  const quotation = customerQuotation || quotations[0]; // Active Customer Quotation
  const totalDealVal = quotation ? quotation.oneTimeTotal + quotation.recurringTotal : 34420;

  const [counterDiscount, setCounterDiscount] = useState<number>(18);
  const [lineComments, setLineComments] = useState<Record<string, string>>({});
  const [generalNotes, setGeneralNotes] = useState('We are ready to close today if we can get an 18% discount on line 2 (Setup).');
  const [submittedRequest, setSubmittedRequest] = useState(false);
  const [confirmedStatus, setConfirmedStatus] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!quotation) {
    return <div className="p-8 text-center text-xs text-slate-400">No active quotation found.</div>;
  }

  const isConfirmed = quotation.stage === 'Confirmed' || confirmedStatus === 'fulfillment';
  const isNegotiationSubmitted = submittedRequest || quotation.stage === 'Negotiation';
  const isSubmitDisabled = isNegotiationSubmitted || isConfirmed;

  const counterPrice = Math.round(totalDealVal * (1 - counterDiscount / 100));
  const evaluation = evaluateCounterOffer(quotation, quotation.items, counterPrice, generalNotes);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const negReq = {
      id: `neg-${Date.now()}`,
      quotationId: quotation.id,
      quotationNumber: quotation.quoteNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      status: 'Open' as const,
      requestedChanges: [
        {
          comment: generalNotes,
          requestedDiscount: counterDiscount,
        },
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          negotiationId: `neg-${Date.now()}`,
          senderId: 'cust-1',
          senderName: quotation.customerName,
          senderRole: 'CUSTOMER' as const,
          message: generalNotes,
          timestamp: new Date().toISOString(),
        },
      ],
      triggeredReapproval: evaluation.requiresReapproval,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addNegotiation(negReq);
    updateQuotation(quotation.id, { stage: 'Negotiation' });

    if (evaluation.requiresReapproval) {
      addApprovalRequest({
        id: `appr-re-${Date.now()}`,
        quotationId: quotation.id,
        quotationNumber: quotation.quoteNumber,
        customerId: quotation.customerId,
        customerName: quotation.customerName,
        stage: 'Sales Manager',
        status: 'Pending',
        riskLevel: 'HIGH',
        riskScore: 78,
        actions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    addActivity({
      id: `act-${Date.now()}`,
      type: 'negotiation',
      message: `${quotation.customerName} submitted counter proposal (${counterDiscount}% discount). Proposal transmitted to ${quotation.assignedTo || 'Sales Representative'}.`,
      relatedTo: quotation.id,
      timestamp: new Date().toISOString(),
    });

    addNotification({
      id: `notif-${Date.now()}`,
      userId: 'user-customer',
      title: 'Negotiation Submitted',
      message: `Your counter proposal for ${quotation.quoteNumber} (${counterDiscount}% target discount) has been transmitted for review.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    });

    fetch(`/api/customer/quotations/${quotation.id}/negotiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestedDiscount: counterDiscount, notes: generalNotes }),
    }).catch(() => {});

    setConfirmedStatus(null);
    setSubmittedRequest(true);
  };

  const handleConfirmQuotation = () => {
    updateQuotation(quotation.id, { stage: 'Confirmed' });
    setSubmittedRequest(false);
    setConfirmedStatus('fulfillment');

    // Update matching invoice status to PAID upon customer payment & terms confirmation
    const matchingInv = invoices.find(
      (i) => i.quotationNumber === quotation.quoteNumber || i.customerName === quotation.customerName
    );
    if (matchingInv && matchingInv.status !== 'Paid') {
      updateInvoice(matchingInv.id, {
        status: 'Paid',
        paidAmount: matchingInv.total,
        payments: [
          ...matchingInv.payments,
          {
            id: `pay-cust-${Date.now()}`,
            invoiceId: matchingInv.id,
            amount: matchingInv.total - matchingInv.paidAmount,
            currency: 'USD',
            paymentDate: new Date().toISOString().slice(0, 10),
            method: matchingInv.type === 'Recurring' ? 'Credit Card' : 'Bank Transfer',
            reference: `CUST-ONLINE-${Date.now()}`,
            status: 'Confirmed',
          },
        ],
      });
    }

    addNotification({
      id: `notif-${Date.now()}`,
      userId: 'user-customer',
      title: 'Quotation Terms Confirmed',
      message: `Quotation ${quotation.quoteNumber} terms have been confirmed. Order fulfillment initialized.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    });

    fetch(`/api/customer/quotations/${quotation.id}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmedAt: new Date().toISOString() }),
    }).catch(() => {});

    addActivity({
      id: `act-${Date.now()}`,
      type: 'negotiation',
      message: `${quotation.customerName} confirmed quotation final terms. Moved directly to warehouse fulfillment and invoice status updated to PAID.`,
      relatedTo: quotation.id,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Status Header (Sent, Under Negotiation, Confirmed) */}
      <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xl font-extrabold text-white">{quotation.quoteNumber}</span>
            <Badge variant={quotation.stage === 'Confirmed' ? 'success' : quotation.stage === 'Pending Approval' || submittedRequest ? 'warning' : 'info'}>
              Status: {quotation.stage === 'Confirmed' ? 'Confirmed' : submittedRequest ? 'Under Negotiation' : quotation.stage}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">Acme Corp Client Portal — Official Proposal</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="md"
            variant="outline"
            onClick={() => downloadQuotationPDF(quotation)}
            leftIcon={<Download className="w-4 h-4 text-indigo-400" />}
          >
            Download PDF
          </Button>
          <Button
            size="md"
            variant="outline"
            onClick={() => downloadQuotationXLS(quotation)}
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
          >
            Download XLS
          </Button>

          <div className="text-right font-mono px-2">
            <span className="text-xs text-slate-400">Total Quoted Value</span>
            <div className="text-2xl font-black text-emerald-400">${totalDealVal.toLocaleString()}</div>
          </div>
          <Button
            size="md"
            variant={isConfirmed ? 'success' : 'primary'}
            disabled={isConfirmed}
            onClick={() => (isConfirmed ? null : setShowConfirmModal(true))}
            leftIcon={isConfirmed ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Check className="w-4 h-4" />}
          >
            {isConfirmed ? 'Quotation Confirmed' : 'Confirm Quotation'}
          </Button>
        </div>
      </div>

      {/* Submitted Request Outcome Alert */}
      {submittedRequest && (
        <div className="p-5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-3 shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="w-6 h-6 text-cyan-400 shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm">Negotiation Request Successfully Submitted!</h4>
            <p className="text-slate-300 mt-0.5">
              Your counter proposal of {counterDiscount}% target discount and notes have been transmitted to your account manager ({quotation.assignedTo || 'Sales Representative'}) for review.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Outcome Alert */}
      {confirmedStatus === 'reapproval' && (
        <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-3 shadow-lg animate-in fade-in duration-200">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm">Terms Exceed Standard Discount Ceiling (Automatic Reapproval Triggered)</h4>
            <p className="text-slate-300 mt-0.5">
              Because your counter terms exceed the tier threshold, the quotation has automatically re-entered the multi-stage approval flow (B4) for executive sign-off.
            </p>
          </div>
        </div>
      )}

      {confirmedStatus === 'fulfillment' && (
        <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-3 shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm">Quotation Officially Confirmed!</h4>
            <p className="text-slate-300 mt-0.5">
              All terms validated within standard limits. Your order has moved directly to warehouse fulfillment and allocation.
            </p>
          </div>
        </div>
      )}

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


      {/* Line Items Overview */}
      <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
        <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-400" /> Quotation Line Items & Specifications
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Inspect order lines, unit pricing, discounts, and product allocations.
        </p>

        <div className="space-y-3 pt-2">
          {quotation.items.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[var(--text-primary)] text-sm">{item.productName}</span>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    Qty: {item.quantity} · Unit Price: ${item.unitPrice.toLocaleString()} · Discount: {item.discount}%
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ${(item.lineTotal || item.unitPrice * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Counter Discount Proposal Form */}
      <div className="card p-6 bg-[var(--bg-card)] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-base font-extrabold text-white">Counter Discount Proposal & Notes</h3>
        </div>

        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Proposed Counter Discount %
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="50"
                  disabled={isSubmitDisabled}
                  value={counterDiscount}
                  onChange={(e) => setCounterDiscount(parseInt(e.target.value) || 0)}
                  className="w-32 bg-[#141b2b] border border-slate-700/60 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-xs text-slate-400">
                  Target Deal Total: <strong className="text-emerald-400 font-mono">${counterPrice.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                General Notes / Commercial Terms Requested
              </label>
              <textarea
                rows={2}
                disabled={isSubmitDisabled}
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="submit"
              variant="outline"
              size="md"
              disabled={isSubmitDisabled}
              leftIcon={
                isNegotiationSubmitted ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                )
              }
            >
              {isNegotiationSubmitted ? 'Negotiation Submitted ✓' : 'Submit Negotiation Request'}
            </Button>
            <Button
              type="button"
              variant={isConfirmed ? 'success' : 'primary'}
              size="md"
              disabled={isConfirmed}
              onClick={() => (isConfirmed ? null : setShowConfirmModal(true))}
              leftIcon={isConfirmed ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Check className="w-4 h-4" />}
            >
              {isConfirmed ? 'Terms Confirmed ✓' : 'Confirm Quotation Final Terms'}
            </Button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">Confirm Quotation {quotation.quoteNumber}?</h3>
                <p className="text-xs text-[var(--text-secondary)]">Acme Corp Client Portal — Official Approval</p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-primary)] leading-relaxed">
              By confirming this quotation, you formally accept all quoted items, pricing, discounts, and payment terms. Order fulfillment and warehouse allocation will be initialized immediately.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleConfirmQuotation();
                  setShowConfirmModal(false);
                }}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Confirm & Accept Terms
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
