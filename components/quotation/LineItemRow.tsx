'use client';

import React from 'react';
import type { QuotationItem, Product, ProductCategory, CustomerTier } from '@/lib/types';
import { checkLineDiscountViolation } from '@/lib/services/discountService';
import { Badge } from '@/components/ui/Badge';
import { Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LineItemRowProps {
  item: QuotationItem;
  products: Product[];
  categories: ProductCategory[];
  customerTier: CustomerTier;
  onUpdate: (updatedItem: QuotationItem) => void;
  onDelete: (itemId: string) => void;
  readOnly?: boolean;
}

export function LineItemRow({
  item,
  products,
  categories,
  customerTier,
  onUpdate,
  onDelete,
  readOnly = false,
}: LineItemRowProps) {
  const product = products.find((p) => p.id === item.productId);
  const category = categories.find((c) => c.id === product?.categoryId);

  const discountVal = item.discount !== undefined ? item.discount : 0;

  const violation = checkLineDiscountViolation(
    item.productId,
    discountVal,
    customerTier,
    categories,
    products
  );

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = Math.max(1, parseInt(e.target.value) || 1);
    const lineTotal = item.unitPrice * qty * (1 - discountVal / 100);
    onUpdate({ ...item, quantity: qty, lineTotal });
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const disc = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
    const lineTotal = item.unitPrice * item.quantity * (1 - disc / 100);
    onUpdate({ ...item, discount: disc, lineTotal });
  };

  return (
    <tr className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)]/50 transition-colors text-xs">
      {/* Product Name & SKU */}
      <td className="px-4 py-3 min-w-[200px]">
        <div className="font-semibold text-[var(--text-primary)]">{item.productName}</div>
        <div className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-2 mt-0.5">
          <span>SKU: {product?.sku || item.productId}</span>
          <span className="text-[var(--border-subtle)]">•</span>
          <span>{category?.name || 'Category'}</span>
        </div>
      </td>

      {/* Unit Price */}
      <td className="px-4 py-3 text-right text-[var(--text-secondary)] font-mono font-medium">
        ${item.unitPrice.toLocaleString()}
      </td>

      {/* Quantity */}
      <td className="px-4 py-3 text-center">
        {readOnly ? (
          <span className="font-bold text-[var(--text-primary)] font-mono">{item.quantity}</span>
        ) : (
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={handleQtyChange}
            className="w-16 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-center text-xs font-mono font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-indigo)]"
          />
        )}
      </td>

      {/* Line Discount Input + Violation Badge */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {readOnly ? (
            <span className="font-bold font-mono text-[var(--text-primary)]">{discountVal}%</span>
          ) : (
            <div className="relative w-20">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={discountVal}
                onChange={handleDiscountChange}
                className={`w-full bg-[var(--bg-card)] border rounded-lg px-2 py-1 text-right text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none ${
                  violation.isViolation ? 'border-rose-500 text-rose-400 bg-rose-500/5' : 'border-[var(--border-subtle)]'
                }`}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-tertiary)] font-bold pointer-events-none">
                %
              </span>
            </div>
          )}
        </div>

        {/* Real-time Category & Tier Ceiling Status */}
        <div className="flex justify-end mt-1">
          {violation.isViolation ? (
            <span
              className="text-[10px] text-rose-400 font-medium flex items-center gap-1 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20"
              title={violation.reason}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
              <span>Exceeds {violation.ceilingPercent}% Ceiling</span>
            </span>
          ) : (
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Within Limit (Max {violation.ceilingPercent}%)</span>
            </span>
          )}
        </div>
      </td>

      {/* Calculated Net Subtotal */}
      <td className="px-4 py-3 text-right font-mono font-bold text-[var(--text-primary)] text-sm">
        ${(item.lineTotal || (item.unitPrice * item.quantity * (1 - discountVal / 100))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>

      {/* Action */}
      {!readOnly && (
        <td className="px-4 py-3 text-center">
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-[var(--text-tertiary)] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      )}
    </tr>
  );
}
