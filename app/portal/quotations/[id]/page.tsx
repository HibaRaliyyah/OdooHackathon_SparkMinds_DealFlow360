'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import type { QuotationItem } from '@/lib/types';
import { LineItemRow } from '@/components/quotation/LineItemRow';
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
  Truck,
  Boxes,
  Warehouse,
  PackageCheck,
  CreditCard,
  Repeat,
  Calendar,
  Lock,
  Sparkles,
  Edit,
  Save,
  X,
  Receipt,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  submitQuotationForFinanceAllocation,
  processCustomerPayment,
} from '@/lib/services/fulfillmentService';
import { calculateNextBillingDate } from '@/lib/services/billingService';
import {
  downloadQuotationPDF,
  downloadInvoicePDF,
  downloadInvoiceXLS,
} from '@/lib/utils/documentExporter';


export default function CustomerQuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    quotations,
    updateQuotation,
    addActivity,
    addNotification,
    fulfillmentOrders,
    addFulfillmentOrder,
    updateFulfillmentOrder,
    warehouses,
    inventory,
    updateInventory,
    invoices,
    updateInvoice,
    addInvoice,
    negotiations,
    updateNegotiation,
    addSubscription,
  } = useStore();

  const quoteId = Array.isArray(params.id) ? params.id[0] : params.id;
  const quotation = quotations.find((q) => q.id === quoteId || q.quoteNumber === quoteId);
  const totalAmount = quotation ? quotation.oneTimeTotal + quotation.recurringTotal : 0;

  const [isNegotiateOpen, setIsNegotiateOpen] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  // Payment Selection States
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wire'>('card');
  const [billingType, setBillingType] = useState<'onetime' | 'recurring'>('onetime');
  const [recurringCycle, setRecurringCycle] = useState<'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Yearly'>('Monthly');
  const [contractTerm, setContractTerm] = useState<'12 Months' | '24 Months' | 'Ongoing Flexible'>('12 Months');
  const [autoDownloadInvoice, setAutoDownloadInvoice] = useState(true);
  const [showPaidSuccessModal, setShowPaidSuccessModal] = useState(false);
  const [lastPaidInvoice, setLastPaidInvoice] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  if (!quotation) {
    return (
      <div className="p-8 text-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Quotation Not Found</h2>
        <p className="text-sm text-[var(--text-secondary)]">The requested quotation reference could not be retrieved.</p>
        <BackButton href="/portal/quotations" label="Back to Quotations List" />
      </div>
    );
  }

  // Calculated totals
  const subtotal = quotation.subtotal || quotation.items.reduce((a, i) => a + i.unitPrice * i.quantity, 0);
  const totalDiscount = quotation.totalDiscount || quotation.items.reduce((a, i) => a + (i.unitPrice * i.quantity * (i.discount / 100)), 0);
  const totalTax = quotation.totalTax || quotation.items.reduce((a, i) => a + i.lineTotal * (i.taxPercent / 100), 0);
  const grandTotal = (quotation.oneTimeTotal || 0) + (quotation.recurringTotal || 0) || (subtotal - totalDiscount + totalTax);

  const hasRecurring = quotation.items.some((i) => i.isSubscription);

  const rawPayableTotal = totalAmount > 0 ? totalAmount : grandTotal;
  const currentPayableAmount =
    billingType === 'recurring'
      ? recurringCycle === 'Monthly'
        ? rawPayableTotal / 12
        : recurringCycle === 'Quarterly'
        ? rawPayableTotal / 4
        : recurringCycle === 'Semi-Annually'
        ? rawPayableTotal / 2
        : rawPayableTotal
      : rawPayableTotal;

  const nextBillingDate = calculateNextBillingDate(
    new Date().toISOString().slice(0, 10),
    recurringCycle === 'Semi-Annually' ? 'Quarterly' : (recurringCycle as any)
  );

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

    setIsNegotiateOpen(false);
    setActionNotice(`Negotiation request for ${quotation.quoteNumber} submitted successfully!`);
    setTimeout(() => setActionNotice(''), 5000);
  };

  // STEP 1: Customer Accepts Terms (Routes to Finance for Warehouse Allocation)
  const handleAcceptTermsAndSubmitToFinance = () => {
    submitQuotationForFinanceAllocation(quotation, {
      updateQuotation,
      addNotification,
      addActivity,
      fulfillmentOrders,
      addFulfillmentOrder,
      updateFulfillmentOrder,
      negotiations,
      updateNegotiation,
    });

    fetch(`/api/customer/quotations/${quotation.id}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmedAt: new Date().toISOString(), paid: false }),
    }).catch(() => {});

    setShowAcceptModal(false);
    setActionNotice(`Quotation ${quotation.quoteNumber} terms confirmed! Submitted to Finance for warehouse allocation. Payment will be enabled once warehouses are allocated.`);
    setTimeout(() => setActionNotice(''), 7000);
  };

  // STEP 3: Customer Pays (Only active once Finance allocates warehouse stock)
  const handleCompletePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);

      processCustomerPayment(
        quotation,
        {
          amount: currentPayableAmount,
          billingType,
          recurringCycle: recurringCycle === 'Semi-Annually' ? 'Quarterly' : (recurringCycle as any),
          method: paymentMethod === 'card' ? 'Credit Card' : 'ACH / Bank Wire',
        },
        {
          updateQuotation,
          fulfillmentOrders,
          updateFulfillmentOrder,
          invoices,
          updateInvoice,
          addInvoice,
          addSubscription,
          addNotification,
          addActivity,
          inventory,
          updateInventory,
        }
      );

      const invNumber = `INV-2026-${quotation.quoteNumber.replace(/[^0-9]/g, '') || '5004'}`;
      const generatedInvoice = {
        id: `inv-${quotation.id}`,
        invoiceNumber: invNumber,
        quotationId: quotation.id,
        quotationNumber: quotation.quoteNumber,
        customerId: quotation.customerId || 'cust-1',
        customerName: quotation.customerName,
        type: (billingType === 'recurring' ? 'Recurring' : 'One-Time') as 'One-Time' | 'Recurring',
        status: 'Paid' as const,
        subtotal: quotation.subtotal || Math.round((rawPayableTotal / 1.08) * 100) / 100,
        discount: quotation.totalDiscount || 0,
        tax: quotation.totalTax || Math.round((rawPayableTotal - rawPayableTotal / 1.08) * 100) / 100,
        total: rawPayableTotal,
        paidAmount: currentPayableAmount,
        dueAmount: 0,
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: (quotation.items || []).map((it, idx) => ({
          id: `item-${idx}`,
          productId: it.productId,
          productName: it.productName,
          orderedQty: it.quantity,
          shippedQty: it.quantity,
          billedQty: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount || 0,
          taxPercent: it.taxPercent || 8,
          lineTotal: it.unitPrice * it.quantity * (1 - (it.discount || 0) / 100),
        })),
        payments: [
          {
            id: `pay-${Date.now()}`,
            invoiceId: `inv-${quotation.id}`,
            amount: currentPayableAmount,
            currency: 'USD' as const,
            paymentDate: new Date().toISOString().slice(0, 10),
            method: paymentMethod === 'card' ? ('Credit Card' as const) : ('Wire' as const),
            reference: `TXN-${Date.now().toString().slice(-6)}`,
            status: 'Confirmed' as const,
          },
        ],
      };

      setLastPaidInvoice(generatedInvoice);

      if (autoDownloadInvoice) {
        try {
          downloadInvoicePDF(generatedInvoice as any);
        } catch (e) {
          console.error('Auto invoice PDF download error', e);
        }
      }

      fetch(`/api/customer/quotations/${quotation.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmedAt: new Date().toISOString(), paid: true }),
      }).catch(() => {});

      setShowPaymentModal(false);
      setShowPaidSuccessModal(true);
      setActionNotice(`Payment confirmed for Quotation ${quotation.quoteNumber}! Fulfillment order dispatched.`);
      setTimeout(() => setActionNotice(''), 6000);
    }, 900);
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

  const matchedFulfillment = fulfillmentOrders.find(
    (f) => f.quotationId === quotation.id || f.quotationNumber === quotation.quoteNumber
  );

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

          {/* If Allocated, Allow Pay Now */}
          {(quotation.stage === 'Allocated' || quotation.stage === 'Confirmed') && (
            <Button
              size="sm"
              variant="success"
              leftIcon={<CreditCard className="w-4 h-4 text-white" />}
              onClick={() => setShowPaymentModal(true)}
            >
              Pay Now (${rawPayableTotal.toLocaleString()})
            </Button>
          )}

          {/* If Paid, Show Order Tracking */}
          {quotation.stage === 'Paid' && (
            <Link href="/portal/orders">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Truck className="w-4 h-4 text-white" />}
              >
                Track Order
              </Button>
            </Link>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ─── WORKFLOW PROGRESS BAR ─── */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Quotation to Fulfillment Lifecycle
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Step 1 */}
          <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            ['Awaiting Allocation', 'Allocated', 'Confirmed', 'Paid', 'Fulfilled'].includes(quotation.stage)
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              ['Awaiting Allocation', 'Allocated', 'Confirmed', 'Paid', 'Fulfilled'].includes(quotation.stage)
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-700 text-slate-300'
            }`}>
              1
            </div>
            <div>
              <div className="font-bold">Customer Acceptance</div>
              <div className="text-[10px] opacity-80">
                {['Awaiting Allocation', 'Allocated', 'Confirmed', 'Paid', 'Fulfilled'].includes(quotation.stage) ? 'Confirmed ✓' : 'Pending Confirmation'}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            quotation.stage === 'Awaiting Allocation'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30 animate-pulse'
              : ['Allocated', 'Confirmed', 'Paid', 'Fulfilled'].includes(quotation.stage)
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              quotation.stage === 'Awaiting Allocation'
                ? 'bg-amber-500 text-slate-950 font-black'
                : ['Allocated', 'Confirmed', 'Paid', 'Fulfilled'].includes(quotation.stage)
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-700 text-slate-300'
            }`}>
              2
            </div>
            <div>
              <div className="font-bold">Finance Warehouse Allocation</div>
              <div className="text-[10px] opacity-80">
                {quotation.stage === 'Awaiting Allocation'
                  ? 'Finance Action Required'
                  : ['Allocated', 'Confirmed', 'Paid', 'Fulfilled'].includes(quotation.stage)
                  ? 'Warehouses Allocated ✓'
                  : 'Pending Customer Accept'}
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            quotation.stage === 'Allocated' || quotation.stage === 'Confirmed'
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500/30'
              : ['Paid', 'Fulfilled'].includes(quotation.stage)
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              ['Paid', 'Fulfilled'].includes(quotation.stage)
                ? 'bg-emerald-500 text-slate-950'
                : quotation.stage === 'Allocated'
                ? 'bg-cyan-500 text-slate-950 font-black'
                : 'bg-slate-700 text-slate-300'
            }`}>
              3
            </div>
            <div>
              <div className="font-bold">Customer Payment</div>
              <div className="text-[10px] opacity-80">
                {['Paid', 'Fulfilled'].includes(quotation.stage)
                  ? 'Paid in Full ✓'
                  : quotation.stage === 'Allocated' || quotation.stage === 'Confirmed'
                  ? 'Unlocked — Ready to Pay'
                  : 'Locked (Awaiting Step 2)'}
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            ['Paid', 'Fulfilled'].includes(quotation.stage)
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              ['Paid', 'Fulfilled'].includes(quotation.stage)
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-700 text-slate-300'
            }`}>
              4
            </div>
            <div>
              <div className="font-bold">Dispatch & Delivery</div>
              <div className="text-[10px] opacity-80">
                {['Paid', 'Fulfilled'].includes(quotation.stage) ? 'In Dispatch / Shipped' : 'Pending Payment'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── STATE 1: AWAITING FINANCE ALLOCATION BANNER ─── */}
      {quotation.stage === 'Awaiting Allocation' && (
        <div className="card p-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl space-y-4 shadow-xl animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Clock className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-amber-200 flex items-center gap-2">
                  Quotation Confirmed — Awaiting Warehouse Allocation by Finance
                </h4>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  You have accepted the proposal terms for <strong>{quotation.quoteNumber}</strong>. The order is currently with the Finance & Fulfillment department for depot stock allocation.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 uppercase">
              Finance Allocation Required
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/20 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Customer Payment Gate Information:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              In accordance with our fulfillment policy, physical warehouse stock must be reserved and verified across our regional fulfillment hubs by the Finance department before invoice payment can be processed. As soon as Finance confirms the allocation, your payment option will be automatically unlocked here.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Assigned Finance Desk: Operations & Treasury</span>
              <button
                disabled
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-slate-800 text-slate-500 border border-slate-700 flex items-center gap-1.5 cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" />
                Payment Locked (Pending Allocation)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STATE 2: ALLOCATED (READY FOR PAYMENT) BANNER & WAREHOUSE CONSOLE ─── */}
      {(quotation.stage === 'Allocated' || quotation.stage === 'Confirmed' || quotation.stage === 'Paid') && (
        <div className="card p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm text-slate-900 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  Warehouse Fulfillment & Depot Allocation Completed
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Finance has confirmed physical stock allocation across regional hubs for <strong>{quotation.quoteNumber}</strong>.
                </p>
              </div>
            </div>

            {quotation.stage === 'Paid' ? (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Paid & Dispatched</span>
              </span>
            ) : (
              <Button
                variant="success"
                size="sm"
                leftIcon={<CreditCard className="w-4 h-4" />}
                onClick={() => setShowPaymentModal(true)}
              >
                Proceed to Payment (${rawPayableTotal.toLocaleString()})
              </Button>
            )}
          </div>

          {/* Allocation Details Grid */}
          {(() => {
            const allocations = matchedFulfillment?.allocations && matchedFulfillment.allocations.length > 0
              ? matchedFulfillment.allocations
              : (quotation.items || []).map((item, idx) => ({
                  warehouseName: idx % 2 === 0 ? 'North America Hub (Chicago, IL)' : 'East Coast Depot (Newark, NJ)',
                  productName: item.productName || 'Item',
                  allocatedQty: item.quantity,
                }));

            return (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-indigo-600" />
                    <span>Allocated Physical Depot Hubs</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    Fulfillment Status: {matchedFulfillment?.status || 'Allocated'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allocations.map((alloc: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Warehouse className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{alloc.warehouseName}</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-700">{alloc.allocatedQty} Units Allocated</span>
                      </div>
                      <div className="text-slate-600 text-[11px] font-medium">
                        Product Line: {alloc.productName}
                      </div>
                      <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1.5">
                        <PackageCheck className="w-3 h-3 text-emerald-600" />
                        <span>Stock Reserved & Payment Unlocked</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
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

      {/* Line Items Table */}
      <div className="card p-6 bg-[var(--bg-card)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" /> Products & Line Items
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadQuotationPDF(quotation)}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
          >
            Download Proposal PDF
          </Button>
        </div>

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
              <span className="font-bold text-emerald-400">Payment Unlocked after Finance Allocation</span>
            </div>
          </div>
        </div>

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

      {/* ─── STEP 1 MODAL: CONFIRM PROPOSAL TERMS -> SUBMIT TO FINANCE ─── */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                <Boxes className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Confirm Quotation {quotation.quoteNumber}</h3>
                <p className="text-xs text-slate-600">Route to Finance for Multi-Warehouse Stock Allocation</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Quotation Reference:</span>
                <span className="font-mono font-bold text-indigo-700">{quotation.quoteNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Customer Account:</span>
                <span className="font-mono font-bold text-slate-900">{quotation.customerName}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">Total Order Amount:</span>
                <span className="font-mono font-black text-xl text-indigo-700">
                  ${rawPayableTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs text-indigo-950">
              <div className="font-bold flex items-center gap-2 text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Next Workflow Step: Finance Warehouse Allocation</span>
              </div>
              <p className="text-indigo-900/80 leading-relaxed text-[11px]">
                Upon confirming, your order will be submitted to the <strong>Finance & Fulfillment Department</strong>. Finance will allocate available physical inventory across regional warehouse depots (North America Hub, East Coast Depot, West Coast Depot).
              </p>
              <p className="text-indigo-900/80 leading-relaxed text-[11px]">
                <strong>Once Finance completes the allocation, your payment option will be enabled.</strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setShowAcceptModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptTermsAndSubmitToFinance}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm Terms & Submit to Finance
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 3 MODAL: PAYMENT MODAL (UNLOCKED AFTER FINANCE ALLOCATION) ─── */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Complete Payment for {quotation.quoteNumber}</h3>
                <p className="text-xs text-slate-600">Warehouses Allocated · Select Payment Method</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Quotation Reference:</span>
                <span className="font-mono font-bold text-indigo-700">{quotation.quoteNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Allocation Status:</span>
                <span className="font-mono font-bold text-emerald-700">Verified by Finance ✓</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">
                  {billingType === 'recurring' ? `${recurringCycle} Subscription Amount:` : 'Total Amount Payable Today:'}
                </span>
                <span className="font-mono font-black text-xl text-emerald-700">
                  ${currentPayableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Billing Method Selection */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select Payment Billing Schedule</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setBillingType('onetime')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    billingType === 'onetime'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>One-Time Payment</span>
                    {billingType === 'onetime' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    ${rawPayableTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} single payment
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingType('recurring')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    billingType === 'recurring'
                      ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold ring-2 ring-purple-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Recurring Subscription</span>
                    {billingType === 'recurring' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="text-[11px] text-purple-700 mt-1 font-mono font-bold">
                    Pay in plan intervals
                  </div>
                </button>
              </div>
            </div>

            {/* Recurring Interval */}
            {billingType === 'recurring' && (
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2 text-slate-900">
                <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>Select Plan Interval</span>
                  </span>
                  <span className="text-[10px] text-purple-700 font-normal">Auto-renews dynamically</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['Monthly', 'Quarterly', 'Yearly'] as const).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setRecurringCycle(cycle)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer border ${
                        recurringCycle === cycle
                          ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                          : 'bg-white text-slate-800 border-purple-200 hover:bg-purple-100/50'
                      }`}
                    >
                      <div>{cycle}</div>
                      <div className="text-[10px] font-mono mt-0.5 opacity-90">
                        ${(
                          cycle === 'Monthly'
                            ? rawPayableTotal / 12
                            : cycle === 'Quarterly'
                            ? rawPayableTotal / 4
                            : rawPayableTotal
                        ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        /{cycle.toLowerCase().substring(0, 2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Method (Card vs Wire) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Corporate Credit Card</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Visa ending in **** 4242</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wire')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'wire'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ACH / Bank Wire</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Direct debit bank account</div>
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button
                variant="success"
                size="sm"
                disabled={isProcessingPayment}
                onClick={handleCompletePayment}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
              >
                {isProcessingPayment
                  ? 'Processing Payment...'
                  : `Pay $${currentPayableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </Button>
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
