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
} from 'lucide-react';

export default function CustomerQuotationPortalPage() {
  const { currentUser, customers, quotations, addNegotiation, updateQuotation, addApprovalRequest, addActivity, addNotification } = useStore();

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

  if (!quotation) {
    return <div className="p-8 text-center text-xs text-slate-400">No active quotation found.</div>;
  }

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
    updateQuotation(quotation.id, { stage: 'Pending Approval' });

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
      message: `${quotation.customerName} submitted counter proposal (${counterDiscount}% discount). System triggered automatic reapproval flow.`,
      relatedTo: quotation.id,
      timestamp: new Date().toISOString(),
    });

    setSubmittedRequest(true);
  };

  const handleConfirmQuotation = () => {
    // Check if current quotation discount exceeds threshold (15%)
    const exceedsThreshold = counterDiscount > 15 || quotation.blendedRisk?.riskLevel === 'HIGH';

    if (exceedsThreshold) {
      updateQuotation(quotation.id, { stage: 'Pending Approval' });
      addApprovalRequest({
        id: `appr-confirm-${Date.now()}`,
        quotationId: quotation.id,
        quotationNumber: quotation.quoteNumber,
        customerId: quotation.customerId,
        customerName: quotation.customerName,
        stage: 'Sales Manager',
        status: 'Pending',
        riskLevel: 'HIGH',
        riskScore: 82,
        actions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setConfirmedStatus('reapproval');
    } else {
      updateQuotation(quotation.id, { stage: 'Confirmed' });
      setConfirmedStatus('fulfillment');
    }

    addActivity({
      id: `act-${Date.now()}`,
      type: 'negotiation',
      message: `${quotation.customerName} confirmed quotation online. ${
        exceedsThreshold ? 'Re-entered approval flow (B4) due to discount threshold breach.' : 'Moved directly to warehouse fulfillment.'
      }`,
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
            <Badge variant={quotation.stage === 'Confirmed' ? 'success' : quotation.stage === 'Pending Approval' ? 'warning' : 'info'}>
              Status: {quotation.stage === 'Confirmed' ? 'Confirmed' : submittedRequest ? 'Under Negotiation' : 'Sent'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">Acme Corp Client Portal — Official Proposal</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <span className="text-xs text-slate-400">Total Quoted Value</span>
            <div className="text-2xl font-black text-emerald-400">${totalDealVal.toLocaleString()}</div>
          </div>
          <Button
            size="md"
            variant="primary"
            onClick={handleConfirmQuotation}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Confirm Quotation
          </Button>
        </div>
      </div>

      {/* Confirmation Outcome Alert */}
      {confirmedStatus === 'reapproval' && (
        <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-3 shadow-lg">
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
        <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm">Quotation Officially Confirmed!</h4>
            <p className="text-slate-300 mt-0.5">
              All terms validated within standard limits. Your order has moved directly to warehouse fulfillment and allocation.
            </p>
          </div>
        </div>
      )}

      {/* Line Items with Line-Level Question & Comment Tool */}
      <div className="card p-6 bg-[var(--bg-card)] border border-slate-800 space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-400" /> Line-Level Negotiation & Change Request Tool
        </h3>
        <p className="text-xs text-slate-400">
          Inspect order lines, ask line-level questions, or suggest adjustments on individual products.
        </p>

        <div className="space-y-3 pt-2">
          {quotation.items.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-white text-sm">{item.productName}</span>
                  <div className="text-[11px] text-slate-400">
                    Qty: {item.quantity} · Unit Price: ${item.unitPrice.toLocaleString()} · Discount: {item.discount}%
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ${(item.lineTotal || item.unitPrice * item.quantity).toLocaleString()}
                </span>
              </div>

              {/* Line Comment Input */}
              <div className="pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder={`Ask a question or request quantity/discount change for ${item.productName}...`}
                  value={lineComments[item.id] || ''}
                  onChange={(e) => setLineComments({ ...lineComments, [item.id]: e.target.value })}
                  className="w-full bg-[#141b2b] border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
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
                  value={counterDiscount}
                  onChange={(e) => setCounterDiscount(parseInt(e.target.value) || 0)}
                  className="w-32 bg-[#141b2b] border border-slate-700/60 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
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
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="submit"
              variant="outline"
              size="md"
              leftIcon={<MessageSquare className="w-4 h-4 text-cyan-400" />}
            >
              Submit Negotiation Request
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirmQuotation}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Confirm Quotation Final Terms
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
