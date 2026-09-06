'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/data/store';
import { evaluateCounterOffer } from '@/lib/services/negotiationService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
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
  Boxes,
  Truck,
  Warehouse,
  PackageCheck,
  CreditCard,
  FileText,
  Clock,
  Repeat,
  Calendar,
  Lock,
  Receipt,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  downloadQuotationPDF,
  downloadQuotationXLS,
  downloadInvoicePDF,
  downloadInvoiceXLS,
} from '@/lib/utils/documentExporter';

import {
  submitQuotationForFinanceAllocation,
  processCustomerPayment,
} from '@/lib/services/fulfillmentService';
import { calculateNextBillingDate } from '@/lib/services/billingService';

export default function CustomerQuotationPortalPage() {
  const {
    currentUser,
    customers,
    quotations,
    negotiations,
    invoices,
    updateInvoice,
    addInvoice,
    addNegotiation,
    updateNegotiation,
    updateQuotation,
    addApprovalRequest,
    addActivity,
    addNotification,
    fulfillmentOrders,
    addFulfillmentOrder,
    updateFulfillmentOrder,
    warehouses,
    inventory,
    updateInventory,
    addSubscription,
  } = useStore();

  const customerQuotation = currentUser?.company
    ? quotations.find((q) => q.customerName.toLowerCase().includes(currentUser.company?.toLowerCase() || ''))
    : null;

  const quotation = customerQuotation || quotations[0]; // Active Customer Quotation
  const totalDealVal = quotation ? quotation.oneTimeTotal + quotation.recurringTotal : 34420;

  const activeNeg = (negotiations || []).find(
    (n) => n.quotationId === quotation?.id || n.quotationNumber === quotation?.quoteNumber
  );

  const messages = activeNeg?.messages || [];
  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
  const isLatestMsgFromRep = lastMsg ? (lastMsg.senderRole === 'SALES_REP' || lastMsg.senderRole === 'SALES_MANAGER') : false;
  const isLatestMsgFromCustomer = lastMsg ? lastMsg.senderRole === 'CUSTOMER' : false;

  const [counterDiscount, setCounterDiscount] = useState<number>(18);
  const [generalNotes, setGeneralNotes] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState(false);
  const [hasSalesRepReplied, setHasSalesRepReplied] = useState(false);
  const [salesRepMessage, setSalesRepMessage] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaidSuccessModal, setShowPaidSuccessModal] = useState(false);
  const [lastPaidInvoice, setLastPaidInvoice] = useState<any>(null);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wire'>('card');
  const [billingType, setBillingType] = useState<'onetime' | 'recurring'>('onetime');
  const [recurringCycle, setRecurringCycle] = useState<'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Yearly'>('Monthly');
  const [contractTerm, setContractTerm] = useState<'12 Months' | '24 Months' | 'Ongoing Flexible'>('12 Months');
  const [autoDownloadInvoice, setAutoDownloadInvoice] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);


  // Mark unread sales rep messages as read when customer views proposal
  React.useEffect(() => {
    if (activeNeg) {
      const hasUnreadRepMsgs = (activeNeg.messages || []).some(
        (m) => (m.senderRole === 'SALES_REP' || m.senderRole === 'SALES_MANAGER') && m.read === false
      );
      if (hasUnreadRepMsgs) {
        const updatedMsgs = (activeNeg.messages || []).map((m) =>
          m.senderRole === 'SALES_REP' || m.senderRole === 'SALES_MANAGER' ? { ...m, read: true } : m
        );
        updateNegotiation(activeNeg.id, { messages: updatedMsgs });
      }
    }
  }, [activeNeg?.id, activeNeg?.messages?.length]);

  if (!quotation) {
    return <div className="p-8 text-center text-xs text-slate-400">No active quotation found.</div>;
  }

  const isAwaitingAllocation = quotation.stage === 'Awaiting Allocation';
  const isAllocated = quotation.stage === 'Allocated' || quotation.stage === 'Confirmed';
  const isPaid = quotation.stage === 'Paid';

  // Check if we are actively awaiting a Sales Rep response
  const isSalesRepReplied = (isLatestMsgFromRep || hasSalesRepReplied) && !isLatestMsgFromCustomer;
  const isAwaitingReply = !isAwaitingAllocation && !isAllocated && !isPaid && (submittedRequest || isLatestMsgFromCustomer || (activeNeg && activeNeg.status === 'Open' && !isLatestMsgFromRep)) && !isSalesRepReplied;

  const isNegotiationSubmitted = submittedRequest || quotation.stage === 'Negotiation' || Boolean(activeNeg);
  const isSubmitDisabled = isAwaitingAllocation || isAllocated || isPaid || isAwaitingReply;
  const isConfirmDisabled = isAwaitingAllocation || isAllocated || isPaid || isAwaitingReply;

  const counterPrice = Math.round(totalDealVal * (1 - counterDiscount / 100));
  const evaluation = evaluateCounterOffer(quotation, quotation.items, counterPrice, generalNotes);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const newCustMessage = {
      id: `msg-${Date.now()}`,
      negotiationId: activeNeg?.id || `neg-${Date.now()}`,
      senderId: 'cust-1',
      senderName: quotation.customerName,
      senderRole: 'CUSTOMER' as const,
      message: generalNotes,
      timestamp: new Date().toISOString(),
      read: false,
    };

    if (activeNeg) {
      updateNegotiation(activeNeg.id, {
        messages: [...activeNeg.messages, newCustMessage],
        status: 'Open',
        requestedChanges: [
          ...activeNeg.requestedChanges,
          { comment: generalNotes, requestedDiscount: counterDiscount },
        ],
      });
    } else {
      const negReq = {
        id: `neg-${Date.now()}`,
        quotationId: quotation.id,
        quotationNumber: quotation.quoteNumber,
        customerId: quotation.customerId,
        customerName: quotation.customerName,
        status: 'Open' as const,
        requestedChanges: [
          { comment: generalNotes, requestedDiscount: counterDiscount },
        ],
        messages: [newCustMessage],
        triggeredReapproval: evaluation.requiresReapproval,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addNegotiation(negReq);
    }

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

    addNotification({
      id: `notif-rep-${Date.now()}`,
      userId: 'user-2',
      title: 'New Customer Counter Proposal',
      message: `Customer ${quotation.customerName} submitted a counter offer (${counterDiscount}% discount) for ${quotation.quoteNumber}.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    });

    fetch(`/api/customer/quotations/${quotation.id}/negotiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestedDiscount: counterDiscount, notes: generalNotes }),
    }).catch(() => {});

    setSubmittedRequest(true);
    setHasSalesRepReplied(false);
    setSalesRepMessage(null);
  };

  // STEP 1: Customer confirms terms -> routes to Finance for warehouse allocation
  const handleConfirmTermsAndSubmitToFinance = () => {
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

    setShowConfirmModal(false);
    setSubmittedRequest(false);
  };

  // Compute dynamic payable amount based on billing type and recurring interval
  const calculatePayableAmount = () => {
    if (billingType === 'onetime') return totalDealVal;
    if (recurringCycle === 'Monthly') return totalDealVal / 12;
    if (recurringCycle === 'Quarterly') return totalDealVal / 4;
    if (recurringCycle === 'Semi-Annually') return totalDealVal / 2;
    return totalDealVal;
  };

  const payableAmount = calculatePayableAmount();
  const nextBillingDate = calculateNextBillingDate(
    new Date().toISOString().slice(0, 10),
    recurringCycle === 'Semi-Annually' ? 'Quarterly' : (recurringCycle as any)
  );

  // STEP 3: Customer Pays (Unlocked after Finance allocates warehouse)
  const handlePayNowAndConfirm = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);

      const payAmount = calculatePayableAmount();

      processCustomerPayment(
        quotation,
        {
          amount: payAmount,
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
        subtotal: quotation.subtotal || Math.round((totalDealVal / 1.08) * 100) / 100,
        discount: quotation.totalDiscount || 0,
        tax: quotation.totalTax || Math.round((totalDealVal - totalDealVal / 1.08) * 100) / 100,
        total: totalDealVal,
        paidAmount: payAmount,
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
            amount: payAmount,
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
    }, 900);
  };


  const getConfirmButtonLabel = () => {
    if (isPaid) return 'Order Paid & Dispatched ✓';
    if (isAllocated) return 'Warehouse Allocated (Ready to Pay)';
    if (isAwaitingAllocation) return 'Awaiting Finance Warehouse Allocation...';
    if (isAwaitingReply) return 'Awaiting Sales Rep Reply...';
    return 'Confirm Quotation Final Terms';
  };

  const matchedFulfillment = fulfillmentOrders.find(
    (f) => f.quotationId === quotation.id || f.quotationNumber === quotation.quoteNumber
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Status Header */}
      <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xl font-extrabold text-white">{quotation.quoteNumber}</span>
            <Badge
              variant={
                isPaid
                  ? 'success'
                  : isAllocated
                  ? 'info'
                  : isAwaitingAllocation
                  ? 'warning'
                  : quotation.stage === 'Pending Approval' || submittedRequest
                  ? 'warning'
                  : 'info'
              }
            >
              Status: {isPaid ? 'Paid' : isAllocated ? 'Warehouse Allocated (Ready to Pay)' : isAwaitingAllocation ? 'Awaiting Finance Allocation' : submittedRequest ? 'Under Negotiation' : quotation.stage}
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

          {isAllocated && !isPaid && (
            <Button
              size="md"
              variant="success"
              onClick={() => setShowPaymentModal(true)}
              leftIcon={<CreditCard className="w-4 h-4 text-white" />}
            >
              Pay Now (${totalDealVal.toLocaleString()})
            </Button>
          )}
        </div>
      </div>

      {/* Workflow Progress Bar */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Boxes className="w-4 h-4 text-indigo-400" />
          Fulfillment & Payment Lifecycle
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            isAwaitingAllocation || isAllocated || isPaid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              isAwaitingAllocation || isAllocated || isPaid ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
            }`}>
              1
            </div>
            <div>
              <div className="font-bold">Customer Accept</div>
              <div className="text-[10px] opacity-80">{isAwaitingAllocation || isAllocated || isPaid ? 'Confirmed ✓' : 'Pending'}</div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            isAwaitingAllocation
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30 animate-pulse'
              : isAllocated || isPaid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              isAwaitingAllocation
                ? 'bg-amber-500 text-slate-950 font-black'
                : isAllocated || isPaid
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-700 text-slate-300'
            }`}>
              2
            </div>
            <div>
              <div className="font-bold">Finance Allocation</div>
              <div className="text-[10px] opacity-80">
                {isAwaitingAllocation ? 'Finance Action Required' : isAllocated || isPaid ? 'Warehouses Allocated ✓' : 'Pending'}
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            isAllocated && !isPaid
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500/30'
              : isPaid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              isPaid
                ? 'bg-emerald-500 text-slate-950'
                : isAllocated
                ? 'bg-cyan-500 text-slate-950 font-black'
                : 'bg-slate-700 text-slate-300'
            }`}>
              3
            </div>
            <div>
              <div className="font-bold">Customer Payment</div>
              <div className="text-[10px] opacity-80">
                {isPaid ? 'Paid in Full ✓' : isAllocated ? 'Unlocked — Ready to Pay' : 'Locked (Pending Step 2)'}
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            isPaid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              isPaid ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
            }`}>
              4
            </div>
            <div>
              <div className="font-bold">Dispatch & Shipping</div>
              <div className="text-[10px] opacity-80">{isPaid ? 'In Dispatch / Shipped' : 'Pending Payment'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Awaiting Allocation Notice */}
      {isAwaitingAllocation && (
        <div className="card p-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-amber-200">
                Awaiting Warehouse Allocation by Finance
              </h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Your quotation confirmation has been received. Finance is currently assigning inventory stock across regional fulfillment depots. Customer payment will be enabled once allocation is complete.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Warehouse Allocation Display */}
      {(isAllocated || isPaid) && (
        <div className="card p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm text-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  Warehouse Fulfillment & Resource Allocation Status
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Multi-depot stock allocation verified by Finance for order <strong>{quotation.quoteNumber}</strong>.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Stock Allocated & Payment Unlocked</span>
            </span>
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
                    Status: {isPaid ? 'Paid & Ready for Dispatch' : 'Allocated (Payment Unlocked)'}
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
                        <span>Stock Reserved Across Regional Depot</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Official Sales Representative Confirmation Card */}
      <div className="card p-6 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl space-y-3 shadow-xl">
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
      </div>

      {/* Line Items Overview */}
      <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
        <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-400" /> Quotation Line Items & Specifications
        </h3>

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
                placeholder="Enter notes or commercial terms requested..."
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
              leftIcon={<MessageSquare className="w-4 h-4 text-cyan-400" />}
            >
              {isNegotiationSubmitted ? 'Negotiation Submitted ✓' : 'Submit Negotiation Request'}
            </Button>

            {!isAwaitingAllocation && !isAllocated && !isPaid && (
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={isConfirmDisabled}
                onClick={() => setShowConfirmModal(true)}
                leftIcon={<Check className="w-4 h-4" />}
              >
                {getConfirmButtonLabel()}
              </Button>
            )}

            {isAllocated && !isPaid && (
              <Button
                type="button"
                variant="success"
                size="md"
                onClick={() => setShowPaymentModal(true)}
                leftIcon={<CreditCard className="w-4 h-4 text-white" />}
              >
                Pay Now (${totalDealVal.toLocaleString()})
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Confirmation Modal (Submit to Finance) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                <Boxes className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Confirm Quotation {quotation.quoteNumber}?</h3>
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
                <span className="font-mono font-black text-xl text-indigo-700">${totalDealVal.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs text-indigo-950">
              <div className="font-bold flex items-center gap-2 text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Next Workflow Step: Finance Warehouse Allocation</span>
              </div>
              <p className="text-indigo-900/80 leading-relaxed text-[11px]">
                Upon confirming, your order will be submitted to the <strong>Finance Department</strong> to allocate physical stock across regional warehouse depots.
              </p>
              <p className="text-indigo-900/80 leading-relaxed text-[11px]">
                <strong>Once Finance completes the allocation, your payment option will be enabled.</strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmTermsAndSubmitToFinance}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm Terms & Submit to Finance
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Complete Payment for {quotation.quoteNumber}</h3>
                  <p className="text-xs text-slate-500 font-medium">Warehouses Allocated · Select Payment Terms & Intervals</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quotation & Deal Header */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Quotation Reference</span>
                <span className="font-mono font-black text-indigo-700 text-sm">{quotation.quoteNumber}</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">{quotation.customerName}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-slate-500 font-medium block">Total Contract Value</span>
                <span className="font-mono font-black text-xl text-slate-900">${totalDealVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Step 1: Billing Type Selector (One-Time vs Recurring) */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                1. Select Payment Schedule & Billing Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingType('onetime')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    billingType === 'onetime'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>One-Time Payment</span>
                    </span>
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      100% Settle
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Pay total amount once upfront. Closes balance immediately.</p>
                  <div className="mt-2 font-mono font-black text-sm text-indigo-950">
                    ${totalDealVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingType('recurring')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    billingType === 'recurring'
                      ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-sm ring-2 ring-purple-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-purple-600" />
                      <span>Recurring Payment</span>
                    </span>
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                      Intervals
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Spread into predictable billing intervals with automated cycles.</p>
                  <div className="mt-2 font-mono font-black text-sm text-purple-950">
                    From ${(totalDealVal / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                  </div>
                </button>
              </div>
            </div>

            {/* Step 1B: Recurring Billing Intervals & Term Options (Shown if Recurring) */}
            {billingType === 'recurring' && (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>Choose Recurring Billing Interval</span>
                  </label>
                  <span className="text-[11px] text-purple-700 font-semibold font-mono">
                    First Charge Today: <strong>${payableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </span>
                </div>

                {/* Interval Options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'Monthly', label: 'Monthly', divisor: 12, sub: '12 Cycles/Yr' },
                    { key: 'Quarterly', label: 'Quarterly', divisor: 4, sub: '4 Cycles/Yr' },
                    { key: 'Semi-Annually', label: 'Semi-Annual', divisor: 2, sub: '2 Cycles/Yr' },
                    { key: 'Yearly', label: 'Annual', divisor: 1, sub: '1 Cycle/Yr' },
                  ].map((intv) => {
                    const intvCost = totalDealVal / intv.divisor;
                    const isSelected = recurringCycle === intv.key;

                    return (
                      <button
                        key={intv.key}
                        type="button"
                        onClick={() => setRecurringCycle(intv.key as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                            : 'bg-white text-slate-800 border-purple-200 hover:bg-purple-100/60'
                        }`}
                      >
                        <div className="font-extrabold text-xs">{intv.label}</div>
                        <div className={`font-mono font-black text-xs mt-1 ${isSelected ? 'text-white' : 'text-purple-950'}`}>
                          ${intvCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-purple-200' : 'text-slate-500'}`}>
                          {intv.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Contract Duration Option */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-purple-200/60 text-xs">
                  <span className="text-slate-600 font-medium">Contract Commitment:</span>
                  <div className="flex items-center gap-1.5">
                    {(['12 Months', '24 Months', 'Ongoing Flexible'] as const).map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setContractTerm(term)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          contractTerm === term
                            ? 'bg-purple-900 text-white border-purple-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Interval Billing Preview */}
                <div className="p-2.5 rounded-xl bg-white border border-purple-200 text-[11px] text-purple-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Next automated billing date:</span>
                  </span>
                  <span className="font-mono font-bold text-purple-950">{nextBillingDate}</span>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                2. Select Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>Corporate Card</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Visa ending in **** 4242</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wire')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'wire'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ACH / Direct Wire</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Corporate bank debit</div>
                </button>
              </div>
            </div>

            {/* Step 3: Tax Invoice Details Preview & Instant Generation */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Official Tax Invoice Details</span>
                </span>
                <span className="font-mono font-bold text-slate-700 text-[11px]">
                  INV-2026-{quotation.quoteNumber.replace(/[^0-9]/g, '') || '5004'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 text-[11px] text-slate-600">
                <div>
                  <span className="block text-slate-400 text-[10px]">Subtotal (excl. VAT)</span>
                  <span className="font-mono font-bold text-slate-800">
                    ${(Math.round((totalDealVal / 1.08) * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">VAT / Sales Tax (8%)</span>
                  <span className="font-mono font-bold text-slate-800">
                    ${(Math.round((totalDealVal - totalDealVal / 1.08) * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-slate-400 text-[10px]">Payment Terms</span>
                  <span className="font-bold text-emerald-700">
                    {billingType === 'recurring' ? `${recurringCycle} Autopay` : 'Net 30 / Immediate'}
                  </span>
                </div>
              </div>

              {/* Auto download invoice checkbox */}
              <label className="flex items-center gap-2 pt-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDownloadInvoice}
                  onChange={(e) => setAutoDownloadInvoice(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Auto-download official PDF Tax Invoice & Receipt immediately upon payment</span>
              </label>
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-600">
                Amount Due Today:{' '}
                <strong className="font-mono font-black text-emerald-700 text-sm">
                  ${payableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  disabled={isProcessingPayment}
                  onClick={handlePayNowAndConfirm}
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                >
                  {isProcessingPayment
                    ? 'Processing Payment...'
                    : `Complete Payment ($${payableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post-Payment Success & Invoice Action Modal */}
      {showPaidSuccessModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Payment Confirmed & Dispatched!</h3>
              <p className="text-xs text-slate-600">
                Your order for Quotation <strong className="text-indigo-700">{quotation.quoteNumber}</strong> has been successfully settled and released to warehouse fulfillment.
              </p>
            </div>

            {/* Invoice & Subscription Details Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-700">Official Invoice:</span>
                <span className="font-mono font-black text-emerald-700">
                  INV-2026-{quotation.quoteNumber.replace(/[^0-9]/g, '') || '5004'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-600">
                <span>Billing Mode:</span>
                <span className="font-semibold text-slate-900">
                  {billingType === 'recurring' ? `${recurringCycle} Recurring Billing` : 'One-Time Payment (Settled)'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-600">
                <span>Paid Amount:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${payableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {billingType === 'recurring' && (
                <div className="flex justify-between items-center text-[11px] text-purple-800 font-medium">
                  <span>Next Automated Interval:</span>
                  <span className="font-mono font-bold">{nextBillingDate}</span>
                </div>
              )}
            </div>

            {/* Instant Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (lastPaidInvoice) {
                    downloadInvoicePDF(lastPaidInvoice);
                  }
                }}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download Invoice (PDF)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (lastPaidInvoice) {
                    downloadInvoiceXLS(lastPaidInvoice);
                  }
                }}
                leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
              >
                Export Statement (XLS)
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
              <Link
                href="/portal/invoices"
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                <span>Go to Invoices Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPaidSuccessModal(false)}
              >
                Close Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

