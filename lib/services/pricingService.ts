// ============================================================
// DealFlow360 — Pricing Service
// Calculates list price, effective unit price, volume discounts, tier discounts
// ============================================================

import type { Product, Customer, PriceList, QuotationItem } from '@/lib/types';
import { PRICE_LISTS, TIER_POLICIES } from '@/lib/data/mockData';

export interface CalculatedItemPrice {
  baseListPrice: number;
  tierDiscountPercent: number;
  volumeDiscountPercent: number;
  contractPrice?: number;
  finalUnitPrice: number;
  effectiveDiscountPercent: number;
}

/**
 * Calculates item baseline pricing based on customer tier, pricelists, and volume tiers.
 */
export function calculateItemPrice(
  product: Product,
  customer: Customer,
  quantity: number,
  selectedPricelistId?: string
): CalculatedItemPrice {
  let baseListPrice = product.basePrice;

  // Check if customer or selected pricelist overrides price
  const activePricelistId = selectedPricelistId || customer.priceListId;
  const pricelist = PRICE_LISTS.find((p) => p.id === activePricelistId);

  if (pricelist) {
    const itemInList = pricelist.items.find((i) => i.productId === product.id);
    if (itemInList) {
      baseListPrice = itemInList.price;
    }
  }

  // Tier policy baseline ceiling reference
  const tierPolicy = TIER_POLICIES.find((t) => t.tier === customer.tier);
  const tierDiscountPercent = tierPolicy ? Math.min(tierPolicy.discountCeiling, 5) : 0;

  // Volume discount calculation (simple tier curve based on qty)
  let volumeDiscountPercent = 0;
  if (quantity >= 500) {
    volumeDiscountPercent = 10;
  } else if (quantity >= 100) {
    volumeDiscountPercent = 7;
  } else if (quantity >= 50) {
    volumeDiscountPercent = 5;
  } else if (quantity >= 20) {
    volumeDiscountPercent = 3;
  }

  // Combined discount before rep manual line discount
  const combinedDisc = Math.min(tierDiscountPercent + volumeDiscountPercent, 25);
  const finalUnitPrice = Math.round(baseListPrice * (1 - combinedDisc / 100) * 100) / 100;

  return {
    baseListPrice,
    tierDiscountPercent,
    volumeDiscountPercent,
    finalUnitPrice,
    effectiveDiscountPercent: combinedDisc,
  };
}

/**
 * Recalculates total line figures for a quotation item given manual discount input.
 */
export function calculateLineTotals(
  unitPrice: number,
  quantity: number,
  discountPercent: number,
  taxRatePercent: number = 18
): { subtotal: number; discountAmount: number; taxAmount: number; totalAmount: number } {
  const listTotal = unitPrice * quantity;
  const discountAmount = Math.round(((listTotal * discountPercent) / 100) * 100) / 100;
  const subtotal = listTotal - discountAmount;
  const taxAmount = Math.round(((subtotal * taxRatePercent) / 100) * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
  };
}
