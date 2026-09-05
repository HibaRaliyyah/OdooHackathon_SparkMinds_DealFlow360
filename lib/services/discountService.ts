// ============================================================
// DealFlow360 — Discount Service
// Pure business logic — no React dependencies
// ============================================================

import type {
  LineDiscountResult, BlendedRiskResult, QuotationItem,
  CustomerTier, TierPolicy, ProductCategory, Product,
} from '@/lib/types';

const TIER_POLICIES_MAP: Record<CustomerTier, number> = {
  Bronze: 5, Silver: 10, Gold: 15, Platinum: 25,
};

/**
 * Calculate line-level discount risk for a single quotation item.
 */
export function calculateLineDiscountRisk(params: {
  discount: number;         // actual given %
  customerTier: CustomerTier;
  categoryDiscountCeiling: number;
  unitPrice: number;
  costPrice: number;
  quantity: number;
}): LineDiscountResult {
  const { discount, customerTier, categoryDiscountCeiling, unitPrice, costPrice, quantity } = params;
  const tierCeiling = TIER_POLICIES_MAP[customerTier];
  const allowedDiscount = Math.min(tierCeiling, categoryDiscountCeiling);
  const difference = parseFloat((discount - allowedDiscount).toFixed(2));
  const violations: string[] = [];

  if (discount > tierCeiling) {
    violations.push(`Exceeds ${customerTier} tier limit of ${tierCeiling}%`);
  }
  if (discount > categoryDiscountCeiling) {
    violations.push(`Exceeds category limit of ${categoryDiscountCeiling}%`);
  }

  const discountedPrice = unitPrice * (1 - discount / 100);
  const revenue = discountedPrice * quantity;
  const cost = costPrice * quantity;
  const marginImpact = parseFloat((revenue - cost).toFixed(2));

  let status: LineDiscountResult['status'] = 'OK';
  if (difference > 5) status = 'OVER';
  else if (difference > 0) status = 'WARNING';

  return {
    allowedDiscount,
    actualDiscount: discount,
    difference,
    status,
    violations,
    marginImpact,
  };
}

/**
 * Helper to check line discount violation for UI feedback
 */
export function checkLineDiscountViolation(
  productId: string,
  discountPercent: number,
  customerTier: CustomerTier,
  categories: ProductCategory[],
  products: Product[]
): { isViolation: boolean; ceilingPercent: number; reason?: string } {
  const product = products.find((p) => p.id === productId);
  const category = categories.find((c) => c.id === product?.categoryId);
  const catCeiling = category?.discountCeiling || 15;
  const tierCeiling = TIER_POLICIES_MAP[customerTier] || 15;
  const ceilingPercent = Math.min(catCeiling, tierCeiling);

  const isViolation = discountPercent > ceilingPercent;
  const reason = isViolation
    ? `Requested ${discountPercent}% exceeds ${ceilingPercent}% ceiling (${customerTier} tier & ${category?.name || 'category'}).`
    : undefined;

  return { isViolation, ceilingPercent, reason };
}

/**
 * Validates discounts across quotation items and computes blended risk
 */
export function validateQuotationDiscounts(
  customerTier: CustomerTier,
  items: QuotationItem[],
  categories?: ProductCategory[],
  products?: Product[]
): { blendedRisk: BlendedRiskResult } {
  const dealValue = items.reduce((acc, i) => acc + (i.lineTotal || (i.unitPrice * i.quantity * (1 - (i.discount || 0) / 100))), 0);
  const blendedRisk = calculateBlendedDealRisk({
    items,
    customerTier,
    categories: categories || [],
    dealValue,
  });

  return { blendedRisk };
}

/**
 * Calculate blended deal risk across all quotation items.
 */
export function calculateBlendedDealRisk(params: {
  items: QuotationItem[];
  customerTier: CustomerTier;
  categories: ProductCategory[];
  dealValue: number;
}): BlendedRiskResult {
  const { items, customerTier, dealValue } = params;

  let totalRevenue = 0;
  let totalCost = 0;
  let totalDiscount = 0;
  let totalOriginalRevenue = 0;
  let violations: string[] = [];
  let explanation: string[] = [];
  let worstLine: string | null = null;
  let worstDifference = 0;
  let violationCount = 0;
  let riskScore = 0;

  for (const item of items) {
    const discPct = item.discount !== undefined ? item.discount : 0;
    const allowedDisc = item.allowedDiscount !== undefined ? item.allowedDiscount : 15;
    const cost = item.costPrice !== undefined ? item.costPrice : item.unitPrice * 0.7;

    const discountedPrice = item.unitPrice * (1 - discPct / 100);
    const revenue = discountedPrice * item.quantity;
    const originalRevenue = item.unitPrice * item.quantity;

    totalRevenue += revenue;
    totalCost += cost * item.quantity;
    totalDiscount += (originalRevenue - revenue);
    totalOriginalRevenue += originalRevenue;

    const diff = discPct - allowedDisc;
    const statusLabel = discPct > allowedDisc + 5
      ? `OVER (+${diff}pt)`
      : discPct > allowedDisc
        ? `WARNING (+${diff}pt)`
        : 'OK';

    explanation.push(`${item.productName}: ${discPct}% / ${allowedDisc}% limit → ${statusLabel}`);

    if (discPct > allowedDisc) {
      violationCount++;
      const thisViolation = `${item.productName}: ${discPct}% discount exceeds ${allowedDisc}% limit by +${diff}pt`;
      violations.push(thisViolation);

      if (diff > worstDifference) {
        worstDifference = diff;
        worstLine = item.productName;
      }
    }
  }

  const estimatedMargin = parseFloat((totalRevenue - totalCost).toFixed(2));
  const estimatedMarginPercent = totalRevenue > 0
    ? parseFloat(((estimatedMargin / totalRevenue) * 100).toFixed(1))
    : 0;

  riskScore += Math.min(worstDifference * 6, 40);
  riskScore += Math.min(violationCount * 10, 20);
  riskScore += estimatedMarginPercent < 15 ? 20 : estimatedMarginPercent < 25 ? 10 : 0;
  riskScore += dealValue > 10000 ? 10 : 0;
  riskScore = Math.min(Math.round(riskScore), 100);

  let riskLevel: BlendedRiskResult['riskLevel'] = 'LOW';
  if (riskScore >= 70) riskLevel = 'HIGH';
  else if (riskScore >= 40) riskLevel = 'MEDIUM';

  const requiresApproval = riskLevel !== 'LOW';
  let approvalLevel: BlendedRiskResult['approvalLevel'] = 'AUTO_APPROVED';
  if (riskLevel === 'HIGH') approvalLevel = 'SALES_MANAGER_AND_FINANCE';
  else if (riskLevel === 'MEDIUM') approvalLevel = 'SALES_MANAGER';

  return {
    riskScore,
    riskLevel,
    worstLine,
    violations,
    estimatedMargin,
    estimatedMarginPercent,
    requiresApproval,
    approvalLevel,
    explanation,
  };
}

export function getAllowedDiscount(tier: CustomerTier, categoryDiscountCeiling: number): number {
  const tierCeiling = TIER_POLICIES_MAP[tier];
  return Math.min(tierCeiling, categoryDiscountCeiling);
}

export function formatDiscountStatus(status: string, difference: number): string {
  if (status === 'OK') return 'OK';
  if (status === 'OVER') return `OVER (+${difference}pt)`;
  if (status === 'WARNING') return `WARNING (+${difference}pt)`;
  return status;
}
