// ============================================================
// DealFlow360 — Deal Health Service
// Anomaly detection and deal health scoring
// ============================================================

import type { Quotation, DealHealthScore, DealHealthFlag } from '@/lib/types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / MS_PER_DAY);
}

/**
 * Calculate deal health score for a quotation.
 * Returns a score 0-100 (higher = healthier) and risk level.
 */
export function calculateDealHealth(quotation: Quotation): DealHealthScore {
  const flags: string[] = [];
  const recommendedActions: string[] = [];

  const age = daysSince(quotation.updatedAt);
  const isStalled = age >= 7 && ['Draft', 'Pending Approval'].includes(quotation.stage);

  // Dimension scores (0-100, lower = riskier)
  let pricingRisk = 100 - quotation.blendedRisk.riskScore;
  let approvalRisk = 100;
  let inventoryRisk = 100;
  let deliveryRisk = 100;
  let paymentRisk = 100;
  let customerRisk = 100;

  // Pricing risk from blended risk score
  if (quotation.blendedRisk.riskLevel === 'HIGH') {
    flags.push('High blended discount risk');
    recommendedActions.push('Review discount justification with Sales Manager');
  }

  // Approval risk
  if (quotation.stage === 'Pending Approval') {
    const approvalAge = daysSince(quotation.updatedAt);
    if (approvalAge >= 3) {
      approvalRisk = Math.max(0, 100 - approvalAge * 15);
      flags.push(`Approval pending for ${approvalAge} days`);
      recommendedActions.push('Escalate approval to Sales Manager');
    }
  }

  // Stalled deal
  if (isStalled) {
    deliveryRisk = Math.max(0, 100 - age * 5);
    flags.push(`Deal idle for ${age} days`);
    recommendedActions.push('Nudge assigned sales rep');
  }

  // Discount anomaly (vs average 8% for demo)
  const avgDiscount = quotation.items.reduce((sum, i) => sum + i.discount, 0) / (quotation.items.length || 1);
  if (avgDiscount > 16) {
    flags.push(`Average discount ${avgDiscount.toFixed(0)}% significantly above rep average (8%)`);
    recommendedActions.push('Flag for manager review');
  }

  // Calculate overall score (weighted average of dimensions)
  const score = Math.round(
    (pricingRisk * 0.3) +
    (approvalRisk * 0.2) +
    (inventoryRisk * 0.15) +
    (deliveryRisk * 0.15) +
    (paymentRisk * 0.1) +
    (customerRisk * 0.1)
  );

  let level: DealHealthScore['level'] = 'LOW';
  if (score < 40) level = 'HIGH';
  else if (score < 70) level = 'MEDIUM';

  return {
    quotationId: quotation.id,
    score: Math.max(0, Math.min(100, score)),
    level,
    dimensions: { pricingRisk, approvalRisk, inventoryRisk, deliveryRisk, paymentRisk, customerRisk },
    flags,
    recommendedActions,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Detect anomalies across all quotations.
 */
export function detectAnomalies(quotations: Quotation[]): DealHealthFlag[] {
  const flags: DealHealthFlag[] = [];
  const avgRepDiscount = 8; // hardcoded demo average

  for (const q of quotations) {
    const age = daysSince(q.updatedAt);

    // Stalled deals
    if (age >= 7 && ['Draft', 'Pending Approval'].includes(q.stage)) {
      flags.push({
        id: `dhf-auto-${q.id}-stalled`,
        quotationId: q.id, quotationNumber: q.quoteNumber,
        customerName: q.customerName, type: 'Stalled', severity: age >= 14 ? 'HIGH' : 'MEDIUM',
        description: `Quote idle for ${age} days without activity`,
        detectedAt: new Date().toISOString(),
      });
    }

    // Discount anomaly
    const avgDiscount = q.items.reduce((sum, i) => sum + i.discount, 0) / (q.items.length || 1);
    if (avgDiscount > avgRepDiscount * 1.5) {
      flags.push({
        id: `dhf-auto-${q.id}-discount`,
        quotationId: q.id, quotationNumber: q.quoteNumber,
        customerName: q.customerName, type: 'Discount Anomaly', severity: avgDiscount > avgRepDiscount * 2 ? 'HIGH' : 'MEDIUM',
        description: `Discount ${avgDiscount.toFixed(0)}% vs avg ${avgRepDiscount}% — anomaly detected`,
        detectedAt: new Date().toISOString(),
      });
    }
  }

  return flags;
}
