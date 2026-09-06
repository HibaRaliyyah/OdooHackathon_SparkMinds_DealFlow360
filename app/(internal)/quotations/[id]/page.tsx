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
  RotateCcw,
  Boxes,
  Building,
  Truck,
  Download,
  FileSpreadsheet,
  MessageSquare,
  Send,
  User,
  Edit3,
  Save,
  Plus,
  Trash2,
  Percent,
  DollarSign,
  Check,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import type { FulfillmentOrder } from '@/lib/types';
import { canApproveQuotation } from '@/lib/services/permissionService';
import { downloadQuotationPDF, downloadQuotationXLS } from '@/lib/utils/documentExporter';
import { confirmQuotationAndAllocate } from '@/lib/services/fulfillmentService';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    quotations,
    approvalRequests,
    fulfillmentOrders,
    negotiations,
    updateQuotation,
    addApprovalAction,
    updateApprovalStage,
    currentUser,
    addFulfillmentOrder,
    updateFulfillmentOrder,
    addInvoice,
    addActivity,
    updateNegotiation,
    addNotification,
    warehouses,
    invoices,
    updateInvoice,
  } = useStore() as any;

  const [approvalNotes, setApprovalNotes] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT' | 'RETURN'>('APPROVE');
  const [repReplyText, setRepReplyText] = useState('');
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [editSuccessBanner, setEditSuccessBanner] = useState<string | null>(null);

  const quotation = quotations.find((q: any) => q.id === id);
  const approvalReq = approvalRequests.find((r: any) => r.quotationId === id);
  const fulfillmentOrder = (fulfillmentOrders || []).find(
    (f: any) => f.quotationId === id || f.quotationNumber === quotation?.quoteNumber
  );
  const activeNeg = (negotiations || []).find(
    (n: any) => n.quotationId === id || n.quotationNumber === quotation?.quoteNumber
  );

  // Mark unread customer messages as read when sales rep views quotation details
  React.useEffect(() => {
    if (activeNeg) {
      const hasUnreadCustMsgs = (activeNeg.messages || []).some(
        (m: any) => m.senderRole === 'CUSTOMER' && m.read === false
      );
      if (hasUnreadCustMsgs) {
        const updatedMsgs = (activeNeg.messages || []).map((m: any) =>
          m.senderRole === 'CUSTOMER' ? { ...m, read: true } : m
        );
        updateNegotiation(activeNeg.id, { messages: updatedMsgs });
      }
    }
  }, [activeNeg?.id, activeNeg?.messages?.length]);

  const authCheck = approvalReq
    ? canApproveQuotation(
        { id: currentUser?.id || '', role: currentUser?.role || 'SALES_REP' },
        approvalReq,
        quotation?.assignedToId
      )
    : { allowed: false, reason: 'No pending approval stage' };

  if (!quotation) {
    return (
      <div className="p-12 text-center text-xs text-[var(--text-tertiary)]">
        Quotation not found. <Link href="/quotations" className="text-[var(--accent-purple-light)] underline">Back to List</Link>
      </div>
    );
  }

  const totalAmount = quotation.oneTimeTotal + quotation.recurringTotal;

  const handleApprovalAction = (actionType: 'APPROVE' | 'REJECT' | 'RETURN') => {
    if (!approvalReq) return;

    const actionMap = {
      APPROVE: 'Approved' as const,
      REJECT: 'Rejected' as const,
      RETURN: 'Returned' as const,
    };

    const action = {
      id: `act-${Date.now()}`,
      approvalRequestId: approvalReq.id,
      userId: currentUser?.id || 'user-2',
      userName: currentUser?.name || 'Marcus Vance',
      userRole: currentUser?.role || 'SALES_MANAGER',
      action: actionMap[actionType],
      comment:
        approvalNotes ||
        (actionType === 'APPROVE'
          ? 'Approved based on business justification.'
          : actionType === 'RETURN'
          ? 'Returned to Sales Rep for revision.'
          : 'Discount exceeds allowed threshold.'),
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

      confirmQuotationAndAllocate(quotation, {
        updateQuotation,
        fulfillmentOrders,
        addFulfillmentOrder,
        updateFulfillmentOrder,
        addNotification,
        addActivity,
        warehouses,
        invoices,
        updateInvoice,
        negotiations,
        updateNegotiation,
      });
    } else if (actionType === 'RETURN') {
      updateApprovalStage(approvalReq.id, approvalReq.stage, 'Returned');
      updateQuotation(quotation.id, { stage: 'Returned' });
    } else {
      updateApprovalStage(approvalReq.id, approvalReq.stage, 'Rejected');
      updateQuotation(quotation.id, { stage: 'Rejected' });
    }

    addActivity({
      id: `act-${Date.now()}`,
      message: `${actionType === 'APPROVE' ? 'Approved' : actionType === 'RETURN' ? 'Returned' : 'Rejected'} ${quotation.quoteNumber} (${quotation.customerName})`,
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

  const handleSendRepReply = () => {
    if (!repReplyText.trim()) return;

    const existingMsgs = activeNeg?.messages || [];
    const newMsg = {
      id: `msg-${Date.now()}`,
      negotiationId: activeNeg?.id || `neg-${Date.now()}`,
      senderId: currentUser?.id || 'user-2',
      senderName: currentUser?.name || quotation.assignedTo || 'Jasmine Rao',
      senderRole: 'SALES_REP' as const,
      message: repReplyText.trim(),
      timestamp: new Date().toISOString(),
    };

    if (activeNeg) {
      updateNegotiation(activeNeg.id, {
        messages: [...existingMsgs, newMsg],
        status: 'Counter-Offered',
      });
    }

    addActivity({
      id: `act-${Date.now()}`,
      type: 'negotiation',
      message: `${currentUser?.name || quotation.assignedTo || 'Jasmine Rao'} sent counter proposal reply to customer ${quotation.customerName}.`,
      relatedTo: quotation.id,
      timestamp: new Date().toISOString(),
    });

    addNotification({
      id: `notif-${Date.now()}`,
      userId: 'user-customer',
      title: 'Sales Rep Reply Received',
      message: `${quotation.assignedTo || 'Jasmine Rao'} responded to your quotation negotiation: "${repReplyText.trim().slice(0, 60)}..."`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    });

    setRepReplyText('');
  };

  // ─── Quotation Line Item & Price/Discount Editing ─────────────
  const calculateEditedTotals = (itemsList: any[]) => {
    const subtotal = itemsList.reduce(
      (acc, i) => acc + Number(i.quantity || 1) * Number(i.unitPrice || 0),
      0
    );
    const totalDiscount = itemsList.reduce(
      (acc, i) =>
        acc +
        Number(i.quantity || 1) *
          Number(i.unitPrice || 0) *
          (Number(i.discount || 0) / 100),
      0
    );
    const oneTimeTotal = itemsList
      .filter((i) => !i.isSubscription)
      .reduce(
        (acc, i) =>
          acc +
          Number(i.quantity || 1) *
            Number(i.unitPrice || 0) *
            (1 - Number(i.discount || 0) / 100),
        0
      );
    const recurringTotal = itemsList
      .filter((i) => i.isSubscription)
      .reduce(
        (acc, i) =>
          acc +
          Number(i.quantity || 1) *
            Number(i.unitPrice || 0) *
            (1 - Number(i.discount || 0) / 100),
        0
      );
    const totalTax = itemsList.reduce(
      (acc, i) =>
        acc +
        Number(i.quantity || 1) *
          Number(i.unitPrice || 0) *
          (1 - Number(i.discount || 0) / 100) *
          ((i.taxPercent || 15) / 100),
      0
    );
    const totalDealVal = oneTimeTotal + recurringTotal;
    return { subtotal, totalDiscount, oneTimeTotal, recurringTotal, totalTax, totalDealVal };
  };

  const handleStartEditing = () => {
    if (quotation?.items) {
      setEditedItems(JSON.parse(JSON.stringify(quotation.items)));
    }
    setIsEditingItems(true);
  };

  const handleItemPriceChange = (index: number, newPrice: number) => {
    const updated = [...editedItems];
    const qty = Number(updated[index].quantity) || 1;
    const disc = Number(updated[index].discount) || 0;
    const price = Math.max(0, newPrice);
    const lineTotal = Math.round(qty * price * (1 - disc / 100) * 100) / 100;
    const cost = updated[index].costPrice || Math.round(price * 0.65);
    const margin = Math.round(lineTotal - cost * qty);

    updated[index] = {
      ...updated[index],
      unitPrice: price,
      lineTotal,
      margin,
    };
    setEditedItems(updated);
  };

  const handleItemDiscountChange = (index: number, newDiscount: number) => {
    const updated = [...editedItems];
    const qty = Number(updated[index].quantity) || 1;
    const price = Number(updated[index].unitPrice) || 0;
    const disc = Math.min(100, Math.max(0, newDiscount));
    const lineTotal = Math.round(qty * price * (1 - disc / 100) * 100) / 100;
    const cost = updated[index].costPrice || Math.round(price * 0.65);
    const margin = Math.round(lineTotal - cost * qty);
    const allowed = updated[index].allowedDiscount || 15;

    updated[index] = {
      ...updated[index],
      discount: disc,
      lineTotal,
      margin,
      discountStatus: disc > allowed ? 'OVER' : disc > allowed - 3 ? 'WARNING' : 'OK',
      discountDifference: disc - allowed,
    };
    setEditedItems(updated);
  };

  const handleItemQtyChange = (index: number, newQty: number) => {
    const updated = [...editedItems];
    const qty = Math.max(1, newQty);
    const price = Number(updated[index].unitPrice) || 0;
    const disc = Number(updated[index].discount) || 0;
    const lineTotal = Math.round(qty * price * (1 - disc / 100) * 100) / 100;
    const cost = updated[index].costPrice || Math.round(price * 0.65);
    const margin = Math.round(lineTotal - cost * qty);

    updated[index] = {
      ...updated[index],
      quantity: qty,
      lineTotal,
      margin,
    };
    setEditedItems(updated);
  };

  const handleSaveEditedItems = () => {
    if (!quotation) return;

    const calculatedItems = editedItems.map((item) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const disc = Number(item.discount) || 0;
      const lineTotal = Math.round(qty * price * (1 - disc / 100) * 100) / 100;
      const cost = item.costPrice || Math.round(price * 0.65);
      const margin = Math.round(lineTotal - cost * qty);
      const allowed = item.allowedDiscount || 15;
      const discountStatus = disc > allowed ? 'OVER' : disc > allowed - 3 ? 'WARNING' : 'OK';

      return {
        ...item,
        quantity: qty,
        unitPrice: price,
        discount: disc,
        lineTotal,
        margin,
        discountStatus,
        discountDifference: disc - allowed,
      };
    });

    const { subtotal, totalDiscount, oneTimeTotal, recurringTotal, totalTax } =
      calculateEditedTotals(calculatedItems);

    updateQuotation(quotation.id, {
      items: calculatedItems,
      subtotal,
      totalDiscount,
      oneTimeTotal,
      recurringTotal,
      totalTax,
      updatedAt: new Date().toISOString(),
    });

    // Update matching invoices if any
    if (invoices && updateInvoice) {
      const matchingInvs = invoices.filter(
        (inv: any) =>
          inv.quotationId === quotation.id || inv.quotationNumber === quotation.quoteNumber
      );
      matchingInvs.forEach((inv: any) => {
        if (inv.status !== 'Paid') {
          updateInvoice(inv.id, {
            amount: oneTimeTotal + recurringTotal,
            total: oneTimeTotal + recurringTotal,
            subtotal,
            tax: totalTax,
            discount: totalDiscount,
            dueAmount: inv.dueAmount > 0 ? oneTimeTotal + recurringTotal : 0,
          });
        }
      });
    }

    // Update fulfillment order item quantities
    if (fulfillmentOrder && updateFulfillmentOrder) {
      const updatedAllocations = (fulfillmentOrder.allocations || []).map((alloc: any) => {
        const matchingItem = calculatedItems.find((ci: any) => ci.productId === alloc.productId);
        if (matchingItem) {
          return {
            ...alloc,
            requestedQty: matchingItem.quantity,
            allocatedQty: matchingItem.quantity,
          };
        }
        return alloc;
      });
      updateFulfillmentOrder(fulfillmentOrder.id, {
        allocations: updatedAllocations,
      });
    }

    addActivity({
      id: `act-${Date.now()}`,
      type: 'quotation',
      message: `Sales Rep updated line item prices and discounts for ${quotation.quoteNumber}. Revised total: $${(oneTimeTotal + recurringTotal).toLocaleString()}.`,
      relatedTo: quotation.id,
      timestamp: new Date().toISOString(),
    });

    setIsEditingItems(false);
    setEditSuccessBanner('Quotation pricing, discounts, and line totals updated successfully!');
    setTimeout(() => setEditSuccessBanner(null), 5000);
  };

  const handleApplyCounterDiscount = (requestedDiscount: number, targetProductName?: string) => {
    if (!quotation) return;

    const currentItems = quotation.items || [];
    const updatedItems = currentItems.map((item: any) => {
      const isTarget =
        !targetProductName ||
        targetProductName === 'Quotation Total' ||
        item.productName.toLowerCase().includes(targetProductName.toLowerCase()) ||
        targetProductName.toLowerCase().includes(item.productName.toLowerCase());

      if (isTarget) {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unitPrice) || 0;
        const disc = Number(requestedDiscount);
        const lineTotal = Math.round(qty * price * (1 - disc / 100) * 100) / 100;
        const cost = item.costPrice || Math.round(price * 0.65);
        const margin = Math.round(lineTotal - cost * qty);
        const allowed = item.allowedDiscount || 15;

        return {
          ...item,
          discount: disc,
          lineTotal,
          margin,
          discountStatus: disc > allowed ? 'OVER' : disc > allowed - 3 ? 'WARNING' : 'OK',
          discountDifference: disc - allowed,
        };
      }
      return item;
    });

    const { subtotal, totalDiscount, oneTimeTotal, recurringTotal, totalTax } =
      calculateEditedTotals(updatedItems);

    updateQuotation(quotation.id, {
      items: updatedItems,
      subtotal,
      totalDiscount,
      oneTimeTotal,
      recurringTotal,
      totalTax,
      updatedAt: new Date().toISOString(),
    });

    if (activeNeg && updateNegotiation) {
      const newMsg = {
        id: `msg-${Date.now()}`,
        negotiationId: activeNeg.id,
        senderId: currentUser?.id || 'user-2',
        senderName: currentUser?.name || quotation.assignedTo || 'Jasmine Rao',
        senderRole: 'SALES_REP' as const,
        message: `I have updated Quote ${quotation.quoteNumber} to apply your requested ${requestedDiscount}% discount. The line items and deal totals have been adjusted accordingly.`,
        timestamp: new Date().toISOString(),
        read: true,
      };
      updateNegotiation(activeNeg.id, {
        status: 'Counter-Offered',
        messages: [...(activeNeg.messages || []), newMsg],
      });
    }

    addActivity({
      id: `act-${Date.now()}`,
      type: 'negotiation',
      message: `Applied requested counter discount of ${requestedDiscount}% to ${quotation.quoteNumber}.`,
      relatedTo: quotation.id,
      timestamp: new Date().toISOString(),
    });

    setEditSuccessBanner(`Applied counter discount of ${requestedDiscount}% to quotation line items!`);
    setTimeout(() => setEditSuccessBanner(null), 5000);
  };

  const liveTotals = isEditingItems ? calculateEditedTotals(editedItems) : null;

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
              <Badge variant={quotation.stage === 'Approved' ? 'success' : quotation.stage === 'Returned' ? 'neutral' : 'warning'}>{quotation.stage}</Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
          {quotation.stage === 'Pending Approval' && (
            authCheck.allowed ? (
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
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setModalAction('RETURN');
                    setShowApprovalModal(true);
                  }}
                  leftIcon={<RotateCcw className="w-4 h-4 text-amber-400" />}
                  className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40"
                >
                  Return Deal
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
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>
                  {currentUser?.role === 'ADMIN'
                    ? `Admin Governance View — Approvals assigned to ${approvalReq?.stage || 'Sales Manager & Finance'}`
                    : `Awaiting Sign-Off (${approvalReq?.stage || 'Sales Manager & Finance'})`}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {editSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{editSuccessBanner}</span>
          </div>
          <button
            onClick={() => setEditSuccessBanner(null)}
            className="text-xs text-emerald-400/70 hover:text-emerald-300 font-bold"
          >
            ✕
          </button>
        </div>
      )}

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
          <div className="text-2xl font-black text-emerald-400">
            ${isEditingItems && liveTotals ? liveTotals.totalDealVal.toLocaleString() : totalAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Line Items Table & Interactive Editor */}
      <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-400" /> Quotation Line Items & Pricing Terms
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {isEditingItems
                ? 'Edit unit prices, quantities, and discounts. Line totals and deal value calculate in real time.'
                : 'Current commercial pricing structure, customer discounts, and line-item revenue.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingItems ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartEditing}
                leftIcon={<Edit3 className="w-4 h-4 text-indigo-400" />}
              >
                Edit Prices & Discounts
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingItems(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveEditedItems}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Table View / Edit Mode */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-tertiary)] uppercase">
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5 text-right w-36">Unit Price</th>
                <th className="px-4 py-2.5 text-center w-24">Qty</th>
                <th className="px-4 py-2.5 text-right w-32">Discount %</th>
                <th className="px-4 py-2.5 text-right w-36">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {(!isEditingItems ? quotation.items : editedItems).map((item: any, idx: number) => {
                const currentLineTotal = !isEditingItems
                  ? item.lineTotal || item.unitPrice * item.quantity * (1 - (item.discount || 0) / 100)
                  : item.lineTotal || item.unitPrice * item.quantity * (1 - (item.discount || 0) / 100);

                return (
                  <tr key={item.id || idx} className="border-b border-[var(--border-subtle)] text-xs hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                      <div className="flex items-center gap-2">
                        <span>{item.productName}</span>
                        {item.isSubscription && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                            Subscription
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Unit Price (Editable or Display) */}
                    <td className="px-4 py-3 text-right">
                      {!isEditingItems ? (
                        <span className="font-mono text-[var(--text-primary)] font-bold">
                          ${Number(item.unitPrice).toLocaleString()}
                        </span>
                      ) : (
                        <div className="relative inline-block w-full max-w-[120px]">
                          <span className="absolute left-2.5 top-2 text-[var(--text-tertiary)] font-bold">$</span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemPriceChange(idx, parseFloat(e.target.value) || 0)}
                            className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] focus:border-indigo-500 rounded-lg pl-6 pr-2 py-1.5 text-xs text-[var(--text-primary)] font-mono font-bold text-right outline-none"
                          />
                        </div>
                      )}
                    </td>

                    {/* Qty (Editable or Display) */}
                    <td className="px-4 py-3 text-center">
                      {!isEditingItems ? (
                        <span className="font-mono font-bold text-[var(--text-primary)]">{item.quantity}</span>
                      ) : (
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemQtyChange(idx, parseInt(e.target.value) || 1)}
                          className="w-16 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] focus:border-indigo-500 rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] font-mono font-bold text-center outline-none mx-auto"
                        />
                      )}
                    </td>

                    {/* Discount % (Editable or Display) */}
                    <td className="px-4 py-3 text-right">
                      {!isEditingItems ? (
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          (item.discount || 0) > 0 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-[var(--text-secondary)]'
                        }`}>
                          {item.discount || 0}%
                        </span>
                      ) : (
                        <div className="relative inline-block w-full max-w-[100px]">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount || 0}
                            onChange={(e) => handleItemDiscountChange(idx, parseFloat(e.target.value) || 0)}
                            className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] focus:border-indigo-500 rounded-lg pl-2 pr-6 py-1.5 text-xs text-[var(--text-primary)] font-mono font-bold text-right outline-none"
                          />
                          <span className="absolute right-2 top-2 text-[var(--text-tertiary)] font-bold">%</span>
                        </div>
                      )}
                    </td>

                    {/* Line Total */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      ${Math.round(currentLineTotal).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Live Deal Value Summary when Editing */}
        {isEditingItems && liveTotals && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Gross Subtotal</span>
              <span className="font-mono font-extrabold text-white text-sm">
                ${Math.round(liveTotals.subtotal).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Discounts Applied</span>
              <span className="font-mono font-extrabold text-amber-400 text-sm">
                -${Math.round(liveTotals.totalDiscount).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Revised Net Deal Value</span>
              <span className="font-mono font-black text-emerald-400 text-base">
                ${Math.round(liveTotals.totalDealVal).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Customer Counter Discount & Negotiation Request Card */}
      {activeNeg && (
        <div className="card p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Customer Negotiation Request & Counter Proposal</h3>
                <p className="text-xs text-slate-600 font-medium">
                  {quotation.customerName} submitted a counter proposal for Quote #{quotation.quoteNumber}
                </p>
              </div>
            </div>
            <Badge variant={activeNeg.status === 'Resolved' ? 'success' : activeNeg.status === 'Counter-Offered' ? 'info' : 'warning'}>
              Status: {activeNeg.status === 'Counter-Offered' ? 'Replied to Customer' : activeNeg.status}
            </Badge>
          </div>

          {/* Requested Changes Breakdown with 1-Click Apply */}
          {activeNeg.requestedChanges && activeNeg.requestedChanges.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <span className="font-bold text-amber-800 block uppercase tracking-wider text-[11px]">
                Requested Commercial Terms & Counter Discounts:
              </span>
              {activeNeg.requestedChanges.map((chg: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-slate-900">
                  <div>
                    <span className="font-extrabold text-slate-900">{chg.productName || 'Quotation Total'}</span>
                    {chg.comment && <p className="text-[11px] text-slate-700 font-medium mt-0.5">"{chg.comment}"</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {chg.requestedDiscount && (
                      <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 font-mono font-bold border border-amber-300 shrink-0">
                        Requested Discount: {chg.requestedDiscount}%
                      </span>
                    )}
                    {chg.requestedDiscount && (
                      <button
                        type="button"
                        onClick={() => handleApplyCounterDiscount(chg.requestedDiscount, chg.productName)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Apply {chg.requestedDiscount}% Discount
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Message Thread History */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Negotiation Thread History ({activeNeg.messages?.length || 0}):
            </span>
            <div className="space-y-2.5 max-h-56 overflow-y-auto p-3.5 rounded-xl bg-white border border-slate-200 scrollbar-thin shadow-sm">
              {(activeNeg.messages || []).map((msg: any) => {
                const isCustomer = msg.senderRole === 'CUSTOMER';

                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      isCustomer
                        ? 'bg-purple-50 border border-purple-200 text-slate-900 ml-0 mr-8'
                        : 'bg-slate-100 border border-slate-200 text-slate-900 ml-8 mr-0'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-purple-600" />
                        {msg.senderName} ({msg.senderRole})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-800 text-xs font-medium leading-relaxed">{msg.message}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reply Form for Sales Rep */}
          <div className="pt-2 flex items-center gap-3">
            <input
              type="text"
              placeholder={`Type reply message to ${quotation.customerName}...`}
              value={repReplyText}
              onChange={(e) => setRepReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendRepReply();
              }}
              className="flex-1 text-xs bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 shadow-sm"
            />
            <Button
              size="md"
              variant="primary"
              onClick={handleSendRepReply}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send Reply to Customer
            </Button>
          </div>
        </div>
      )}

      {/* Recommended Warehouse Split Card */}
      {fulfillmentOrder && (
        <div className="card p-6 bg-[var(--bg-card)] border border-indigo-500/20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Recommended Warehouse Split & Fulfillment Allocation</h3>
                <p className="text-xs text-slate-400">Automated multi-depot inventory allocation calculated for this quotation</p>
              </div>
            </div>
            <Badge variant={fulfillmentOrder.status === 'Completed' || fulfillmentOrder.status === 'Allocated' ? 'success' : 'warning'}>
              {fulfillmentOrder.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(fulfillmentOrder.allocations || []).map((alloc: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{alloc.warehouseName}</span>
                  </span>
                  <span className="font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {alloc.allocatedQty} Unit{alloc.allocatedQty > 1 ? 's' : ''} Allocated
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] flex justify-between">
                  <span className="text-slate-300 font-medium">Product: {alloc.productName}</span>
                  <span className="text-slate-400">Parcel 1/1 ($35.00 est. freight)</span>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-400 border-t border-slate-900">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Stock Reserved & Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blended Risk Matrix & Approval Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RiskPanel risk={quotation.blendedRisk || { riskScore: 25, riskLevel: 'LOW', worstLine: null, violations: [], estimatedMargin: 12000, estimatedMarginPercent: 32, requiresApproval: false, approvalLevel: 'AUTO_APPROVED', explanation: [] }} />
        <ApprovalTimeline approvalRequest={approvalReq} />
      </div>

      {/* Approval / Return / Rejection Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title={`${modalAction === 'APPROVE' ? 'Approve' : modalAction === 'RETURN' ? 'Return' : 'Reject'} Quotation ${quotation.quoteNumber}`}
        subtitle="This action will update approval workflow status and record an official audit log entry."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Approval Notes & Justification
            </label>
            <textarea
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Enter approval comments, margin mitigation terms, or return/rejection instructions..."
              className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowApprovalModal(false)}>
              Cancel
            </Button>
            <Button
              variant={modalAction === 'APPROVE' ? 'success' : modalAction === 'RETURN' ? 'outline' : 'danger'}
              size="sm"
              onClick={() => handleApprovalAction(modalAction)}
            >
              Confirm {modalAction === 'APPROVE' ? 'Approval' : modalAction === 'RETURN' ? 'Return to Rep' : 'Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
