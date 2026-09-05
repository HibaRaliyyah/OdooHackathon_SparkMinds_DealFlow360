'use client';

import React, { useState, useEffect } from 'react';
import type { Quotation, Product, AIRecommendation } from '@/lib/types';
import { getUpsellRecommendations } from '@/lib/ai/recommendations';
import { Sparkles, Plus, Check, Zap, X, TrendingUp, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AIRecommendationsProps {
  quotation: Quotation;
  products: Product[];
  onAddProduct: (productId: string, quantity: number) => void;
}

export function AIRecommendations({ quotation, products, onAddProduct }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [dismissedItems, setDismissedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getUpsellRecommendations(quotation).then((res) => {
      setRecommendations(res.recommendations);
    });
  }, [quotation]);

  const handleAdd = (productId: string) => {
    onAddProduct(productId, 1);
    setAddedItems((prev) => ({ ...prev, [productId]: true }));
  };

  const handleDismiss = (productId: string) => {
    setDismissedItems((prev) => ({ ...prev, [productId]: true }));
  };

  const visibleRecs = recommendations.filter((r) => !dismissedItems[r.productId]);

  if (visibleRecs.length === 0) return null;

  return (
    <div className="card p-6 bg-gradient-to-br from-[var(--bg-card)] via-[#131b2e] to-indigo-950/30 border border-indigo-500/30 relative overflow-hidden space-y-4">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles className="w-32 h-32 text-indigo-400" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white">B5) Upsell & Cross-Sell Co-Purchase Suggestions</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Ranked AI Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Ranked suggestions based on co-purchase history and promotional campaigns with positive margin impact
            </p>
          </div>
        </div>
      </div>

      {/* Ranked Suggestion List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {visibleRecs.map((addon, index) => {
          const isAdded = addedItems[addon.productId];
          const marginDelta = addon.estimatedMargin ? `+${(addon.estimatedMargin * 0.1).toFixed(1)}%` : '+2.8%';
          const isPromoted = index === 0 || addon.type === 'Upsell';

          return (
            <div
              key={addon.productId}
              className="p-4 bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl flex flex-col justify-between gap-3 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{addon.productName}</span>
                    {isPromoted && (
                      <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" /> Promoted
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                    <TrendingUp className="w-3 h-3" /> {marginDelta} Margin
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{addon.reason}</p>
                <div className="text-[11px] font-mono font-bold text-emerald-400 mt-2">
                  +${addon.estimatedRevenue.toLocaleString()} Revenue ({addon.type})
                </div>
              </div>

              {/* Action Buttons: Add to Quote & Dismiss */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleDismiss(addon.productId)}
                  className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Dismiss
                </button>
                <Button
                  size="sm"
                  variant={isAdded ? 'success' : 'primary'}
                  onClick={() => handleAdd(addon.productId)}
                  disabled={isAdded}
                  leftIcon={isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                >
                  {isAdded ? 'Added to Cart' : 'Add to Quote'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
