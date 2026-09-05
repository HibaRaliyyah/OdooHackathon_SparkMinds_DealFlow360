// ============================================================
// DealFlow360 — Negotiation Service
// Customer counter-offers, round tracking, re-approval trigger evaluation
// ============================================================

import type { NegotiationRequest, Quotation, QuotationItem, CustomerTier } from '@/lib/types';
import { validateQuotationDiscounts } from './discountService';

export interface CounterOfferEvaluation {
  requiresReapproval: boolean;
  reason?: string;
  revisedRiskScore: number;
  newBlendedDiscount: number;
  suggestedAction: 'accept' | 'counter' | 'escalate_to_finance' | 'reject';
}

/**
 * Evaluates customer counter-offer proposal and checks if re-approval is triggered.
 */
export function evaluateCounterOffer(
  quotation: Quotation,
  items: QuotationItem[],
  requestedTotalAmount: number,
  notes: string,
  customerTier: CustomerTier = 'Gold'
): CounterOfferEvaluation {
  const currentTotal = quotation.oneTimeTotal + quotation.recurringTotal || 1000;
  const priceDifference = currentTotal - requestedTotalAmount;
  const extraDiscountPct = currentTotal > 0 ? (priceDifference / currentTotal) * 100 : 0;

  // Calculate new proposed line discounts evenly or proportionally
  const updatedItems = items.map((item) => {
    const currentDisc = item.discount || 0;
    const newDisc = Math.min(100, Math.max(0, currentDisc + extraDiscountPct));
    return {
      ...item,
      discount: Math.round(newDisc * 10) / 10,
    };
  });

  const validation = validateQuotationDiscounts(customerTier, updatedItems);
  const blendedRisk = validation.blendedRisk;

  const requiresReapproval =
    blendedRisk.riskScore > 50 ||
    extraDiscountPct > 5 ||
    blendedRisk.riskLevel === 'HIGH';

  let suggestedAction: CounterOfferEvaluation['suggestedAction'] = 'accept';
  let reason = 'Counter-offer within pre-approved rep margin.';

  if (blendedRisk.riskLevel === 'HIGH') {
    suggestedAction = 'escalate_to_finance';
    reason = `Counter-offer increases risk score to ${blendedRisk.riskScore}, requiring Finance Re-approval.`;
  } else if (extraDiscountPct > 2) {
    suggestedAction = 'counter';
    reason = 'Counter with split price difference to protect margin.';
  }

  return {
    requiresReapproval,
    reason,
    revisedRiskScore: blendedRisk.riskScore,
    newBlendedDiscount: extraDiscountPct,
    suggestedAction,
  };
}

/**
 * Formats round summary for negotiation history timeline.
 */
export function getNegotiationSummary(negotiation: NegotiationRequest): string {
  return `Negotiation status: ${negotiation.status}. Related to quotation ${negotiation.quotationNumber}.`;
}
