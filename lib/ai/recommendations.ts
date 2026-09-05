// ============================================================
// DealFlow360 — AI Recommendation Engine
// OpenRouter with deterministic fallback
// ============================================================

import { callOpenRouter } from './openrouter';
import type { AIResponse, AIRecommendation, Quotation } from '@/lib/types';
import { PRODUCTS } from '@/lib/data/mockData';

// ─── Deterministic Fallback Rules ─────────────────────────────

const UPSELL_RULES: Record<string, string[]> = {
  'prod-1': ['prod-4', 'prod-5', 'prod-6'], // Laptop → Mouse, Dock, Care Plan
  'prod-2': ['prod-6', 'prod-7'],             // Setup → Care Plan, SLA
  'prod-3': ['prod-6'],                        // Warranty → Care Plan
  'prod-4': ['prod-5'],                        // Mouse → Dock
  'prod-5': ['prod-4', 'prod-6'],              // Dock → Mouse, Care Plan
};

function buildDeterministicRecommendations(quotation: Quotation): AIRecommendation[] {
  const existingProductIds = new Set(quotation.items.map(i => i.productId));
  const recommended: AIRecommendation[] = [];

  for (const item of quotation.items) {
    const related = UPSELL_RULES[item.productId] || [];
    for (const relatedId of related) {
      if (!existingProductIds.has(relatedId)) {
        const product = PRODUCTS.find(p => p.id === relatedId);
        if (product && !recommended.find(r => r.productId === relatedId)) {
          const estimatedRevenue = product.basePrice;
          const estimatedMargin = Math.round(estimatedRevenue * 0.35);
          recommended.push({
            productId: relatedId,
            productName: product.name,
            reason: `Complements ${item.productName} — frequently bundled together`,
            confidence: 0.82,
            estimatedRevenue,
            estimatedMargin,
            type: product.isSubscription ? 'Cross-sell' : 'Upsell',
          });
        }
      }
    }
  }

  return recommended.slice(0, 4); // max 4 recommendations
}

// ─── AI Recommendations ───────────────────────────────────────

const SYSTEM_PROMPT = `You are a B2B sales AI assistant for DealFlow360. 
Respond ONLY with valid JSON matching the exact schema requested.
Be concise, specific, and business-focused.`;

/**
 * Get upsell/cross-sell recommendations for a quotation.
 * Falls back to deterministic rules if AI is unavailable.
 */
export async function getUpsellRecommendations(quotation: Quotation): Promise<AIResponse> {
  const productNames = quotation.items.map(i => i.productName).join(', ');
  const allProducts = PRODUCTS.filter(p => !quotation.items.find(i => i.productId === p.id));

  const prompt = `Given a B2B quotation for ${quotation.customerName} containing: ${productNames}.
Available products to recommend: ${allProducts.map(p => `${p.id}:${p.name}($${p.basePrice})`).join(', ')}.
Customer tier: Gold. Deal value: $${quotation.oneTimeTotal.toFixed(0)}.

Return JSON: {"recommendations": [{"productId": "...", "productName": "...", "reason": "...", "confidence": 0.0-1.0, "estimatedRevenue": 0, "estimatedMargin": 0, "type": "Upsell|Cross-sell"}]}
Return max 4 recommendations for products that genuinely complement what's in the quote.`;

  const aiResponse = await callOpenRouter([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]);

  if (!aiResponse) {
    return {
      recommendations: buildDeterministicRecommendations(quotation),
      usedFallback: true,
    };
  }

  try {
    const parsed = JSON.parse(aiResponse);
    const recommendations: AIRecommendation[] = (parsed.recommendations || []).slice(0, 4);
    return { recommendations, usedFallback: false };
  } catch {
    return {
      recommendations: buildDeterministicRecommendations(quotation),
      usedFallback: true,
    };
  }
}

/**
 * Get AI deal health summary.
 */
export async function getDealHealthSummary(quotation: Quotation): Promise<{ summary: string; usedFallback: boolean }> {
  const prompt = `Summarize the deal health for quotation ${quotation.quoteNumber} (${quotation.customerName}).
Risk level: ${quotation.blendedRisk.riskLevel}.
Violations: ${quotation.blendedRisk.violations.join('; ')}.
Stage: ${quotation.stage}.
Return JSON: {"summary": "2-3 sentence business summary with recommended action"}`;

  const aiResponse = await callOpenRouter([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]);

  if (!aiResponse) {
    const fallback = `Deal ${quotation.quoteNumber} for ${quotation.customerName} has a ${quotation.blendedRisk.riskLevel} risk level. ${quotation.blendedRisk.violations.length > 0 ? `Key issue: ${quotation.blendedRisk.violations[0]}.` : 'No critical violations.'} ${quotation.blendedRisk.riskLevel === 'HIGH' ? 'Recommend immediate Sales Manager review.' : 'Monitor and proceed through normal workflow.'}`;
    return { summary: fallback, usedFallback: true };
  }

  try {
    const parsed = JSON.parse(aiResponse);
    return { summary: parsed.summary || '', usedFallback: false };
  } catch {
    return { summary: aiResponse, usedFallback: true };
  }
}

/**
 * Get negotiation response suggestion.
 */
export async function getNegotiationAdvice(params: {
  customerName: string;
  requestedChange: string;
  currentDiscount: number;
  allowedDiscount: number;
}): Promise<{ advice: string; usedFallback: boolean }> {
  const { customerName, requestedChange, currentDiscount, allowedDiscount } = params;

  const prompt = `A customer (${customerName}) has requested: "${requestedChange}".
Current discount: ${currentDiscount}%. Allowed limit: ${allowedDiscount}%.
Suggest a professional negotiation response for the sales rep.
Return JSON: {"advice": "concise response suggestion"}`;

  const aiResponse = await callOpenRouter([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]);

  if (!aiResponse) {
    const wouldExceed = currentDiscount > allowedDiscount;
    const fallback = wouldExceed
      ? `The requested discount of ${currentDiscount}% exceeds our policy limit of ${allowedDiscount}% for this category. I can offer ${allowedDiscount}% which is the maximum I'm authorized to apply. Shall I proceed with this revised offer?`
      : `I'd be happy to review this request. I can accommodate up to ${allowedDiscount}% on this line item. Let me confirm this with my manager and get back to you within one business day.`;
    return { advice: fallback, usedFallback: true };
  }

  try {
    const parsed = JSON.parse(aiResponse);
    return { advice: parsed.advice || '', usedFallback: false };
  } catch {
    return { advice: aiResponse, usedFallback: true };
  }
}
