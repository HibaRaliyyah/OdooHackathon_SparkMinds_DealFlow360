'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/data/store';
import type { QuotationItem, Customer, Product, Quotation, QuotationStage } from '@/lib/types';
import { calculateItemPrice, calculateLineTotals } from '@/lib/services/pricingService';
import { validateQuotationDiscounts } from '@/lib/services/discountService';
import { LineItemRow } from '@/components/quotation/LineItemRow';
import { RiskPanel } from '@/components/quotation/RiskPanel';
import { AIRecommendations } from '@/components/ai/AIRecommendations';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Plus, Send, Save, Building, Lock } from 'lucide-react';
import Link from 'next/link';
import { canCreateQuotation } from '@/lib/services/permissionService';

export default function NewQuotationPage() {
  const router = useRouter();
  const { customers, products, productCategories, addQuotation, updateQuotation, addApprovalRequest, addActivity, currentUser } = useStore();

  const createAuth = canCreateQuotation(currentUser?.role);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [addQty, setAddQty] = useState<number>(10);

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const validationResult = validateQuotationDiscounts(currentCustomer.tier, items);
  const blendedRisk = validationResult.blendedRisk;

  const subtotal = items.reduce((acc, i) => acc + (i.lineTotal || i.unitPrice * i.quantity), 0);
  const taxAmount = subtotal * 0.18;
  const totalAmount = subtotal + taxAmount;

  const handleAddItem = (productIdToAdd?: string, qtyToAdd?: number) => {
    const pId = productIdToAdd || selectedProductId;
    const qty = qtyToAdd || addQty;
    const prod = products.find((p) => p.id === pId);
    if (!prod) return;

    const priceInfo = calculateItemPrice(prod, currentCustomer, qty);
    const lineTotals = calculateLineTotals(priceInfo.finalUnitPrice, qty, 0);

    const newItem: QuotationItem = {
      id: `item-${Date.now()}-${items.length + 1}`,
      productId: prod.id,
      productName: prod.name,
      quantity: qty,
      unitPrice: priceInfo.finalUnitPrice,
      costPrice: Math.round(priceInfo.finalUnitPrice * 0.65),
      discount: 0,
      allowedDiscount: 15,
      taxPercent: prod.taxPercent || 18,
      lineTotal: lineTotals.subtotal,
      margin: Math.round(lineTotals.subtotal * 0.35),
      discountStatus: 'OK',
      discountDifference: 0,
      isSubscription: prod.isSubscription || false,
    };

    setItems([...items, newItem]);
  };

  const handleUpdateItem = (updatedItem: QuotationItem) => {
    setItems(items.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter((i) => i.id !== itemId));
  };

  const handleSaveQuotation = (stage: QuotationStage) => {
    const qId = `q-${Date.now().toString().slice(-4)}`;
    const qNum = `Q-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newQuotation: Quotation = {
      id: qId,
      quoteNumber: qNum,
      customerId: currentCustomer.id,
      customerName: currentCustomer.company || currentCustomer.contact || 'Customer',
      priceListId: currentCustomer.priceListId || 'pl-1',
      currency: 'USD',
      stage,
      items,
      subtotal,
      totalDiscount: 0,
      totalTax: taxAmount,
      oneTimeTotal: totalAmount,
      recurringTotal: 0,
      blendedRisk,
      assignedTo: currentUser?.name || 'Sarah Jenkins',
      assignedToId: currentUser?.id || 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addQuotation(newQuotation);

    if (stage === 'Pending Approval') {
      // LOW risk with discounts within allowed limits → auto-approve
      const isAutoApproved = blendedRisk.riskLevel === 'LOW' && !blendedRisk.requiresApproval;

      if (isAutoApproved) {
        // Directly approve — skip Sales Manager & Finance stages
        updateQuotation(qId, { stage: 'Approved' });

        const autoApprovalAction = {
          id: `act-${Date.now()}`,
          approvalRequestId: `appr-${qId}`,
          userId: 'system',
          userName: 'System Auto-Approval',
          userRole: 'ADMIN' as const,
          action: 'Auto-Approved' as const,
          comment: `Auto-approved: LOW risk (score ${blendedRisk.riskScore}/100). All discounts are within the allowed subscription plan and product category ceilings.`,
          timestamp: new Date().toISOString(),
        };

        const approvalReq = {
          id: `appr-${qId}`,
          quotationId: qId,
          quotationNumber: qNum,
          customerId: currentCustomer.id,
          customerName: currentCustomer.company || 'Customer',
          stage: 'Auto-Approved' as const,
          status: 'Auto-Approved' as const,
          riskLevel: blendedRisk.riskLevel,
          riskScore: blendedRisk.riskScore,
          actions: [autoApprovalAction],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addApprovalRequest(approvalReq);

        addActivity({
          id: `act-auto-${Date.now()}`,
          message: `${qNum} auto-approved — LOW risk (score ${blendedRisk.riskScore}/100). Discounts within subscription plan & category ceilings.`,
          type: 'approval',
          timestamp: new Date().toISOString(),
        });
      } else {
        // MEDIUM/HIGH risk → route through multi-stage approval
        const initialStage = blendedRisk.riskLevel === 'HIGH' ? 'Sales Manager' as const : 'Sales Manager' as const;

        const approvalReq = {
          id: `appr-${qId}`,
          quotationId: qId,
          quotationNumber: qNum,
          customerId: currentCustomer.id,
          customerName: currentCustomer.company || 'Customer',
          stage: initialStage,
          status: 'Pending' as const,
          riskLevel: blendedRisk.riskLevel,
          riskScore: blendedRisk.riskScore,
          actions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addApprovalRequest(approvalReq);
      }
    }

    router.push(`/quotations/${qId}`);
  };

  if (currentUser && currentUser.role !== 'SALES_REP') {
    return (
      <div className="max-w-2xl mx-auto p-8 mt-12 bg-slate-900/90 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl animate-in fade-in">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <Building className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Quotation Builder Restricted</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Only official <strong>Sales Representatives (SALES_REP)</strong> have permission to build and submit new deal quotations. Your role is <strong>{currentUser.role}</strong>.
        </p>
        <div className="pt-2">
          <Link href="/quotations">
            <Button variant="primary" size="md">
              Return to Quotations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/quotations">
            <button className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Interactive Quotation Builder</h1>
            <p className="text-xs text-[var(--text-tertiary)]">Configure deal lines, line-level discount limits & blended risk analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={() => handleSaveQuotation('Draft')} leftIcon={<Save className="w-4 h-4" />}>
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => handleSaveQuotation('Pending Approval')}
            disabled={items.length === 0}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Submit for Approval
          </Button>
        </div>
      </div>

      {/* Customer Selection */}
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-subtle)]">
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
          Select Customer Account
        </label>
        <div className="relative">
          <Building className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[var(--accent-indigo)]"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company || c.contact} ({c.tier} Tier)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Adder Control */}
      <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="flex-1 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-medium focus:outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (${p.basePrice.toLocaleString()}) — {p.sku}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={addQty}
            onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-center text-xs font-mono font-bold text-[var(--text-primary)]"
          />
        </div>

        <Button variant="primary" size="sm" onClick={() => handleAddItem()} leftIcon={<Plus className="w-4 h-4" />}>
          Add Line Item
        </Button>
      </div>

      {/* Line Items Table */}
      <div className="card p-6 bg-[var(--bg-card)] overflow-hidden">
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Line Items & Discount Matrix</h3>
        {items.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-tertiary)]">
            No items added yet. Use the product selector above to add line items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-tertiary)] uppercase">
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2 text-right">Unit Price</th>
                  <th className="px-4 py-2 text-center">Qty</th>
                  <th className="px-4 py-2 text-right">Discount %</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    products={products}
                    categories={productCategories}
                    customerTier={currentCustomer.tier}
                    onUpdate={handleUpdateItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Financial Summary */}
        <div className="flex justify-end mt-6 pt-4 border-t border-[var(--border-subtle)]">
          <div className="w-64 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-[var(--text-tertiary)]">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[var(--text-tertiary)]">
              <span>Estimated Tax (18%):</span>
              <span>${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-emerald-400 pt-2 border-t border-[var(--border-subtle)]">
              <span>Grand Total:</span>
              <span>${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blended Risk Score Panel */}
      <RiskPanel risk={blendedRisk} />

      {/* OpenRouter AI Copilot Recommendations */}
      {items.length > 0 && (
        <AIRecommendations
          quotation={{
            id: 'temp',
            quoteNumber: 'TEMP',
            customerId: currentCustomer.id,
            customerName: currentCustomer.company || 'Customer',
            priceListId: 'pl-1',
            currency: 'USD',
            stage: 'Draft',
            items,
            subtotal,
            totalDiscount: 0,
            totalTax: taxAmount,
            oneTimeTotal: totalAmount,
            recurringTotal: 0,
            blendedRisk,
            assignedTo: 'Sarah Rep',
            assignedToId: 'user-2',
            createdAt: '',
            updatedAt: '',
          }}
          products={products}
          onAddProduct={(pId, q) => handleAddItem(pId, q)}
        />
      )}
    </div>
  );
}
