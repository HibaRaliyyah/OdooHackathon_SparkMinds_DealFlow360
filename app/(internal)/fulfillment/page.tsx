'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Truck,
  Sliders,
  Sparkles,
  ArrowRight,
  PackageCheck,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function FulfillmentPage() {
  const { fulfillmentOrders, warehouses } = useStore();
  const [acceptedSplits, setAcceptedSplits] = useState<Record<string, boolean>>({});
  const [overridingOrderId, setOverridingOrderId] = useState<string | null>(null);
  const [consolidatedNotice, setConsolidatedNotice] = useState('');

  const handleAcceptSplit = (orderId: string) => {
    setAcceptedSplits((prev) => ({ ...prev, [orderId]: true }));
  };

  const handleConsolidateBackorder = (orderId: string) => {
    setConsolidatedNotice(`Order #${orderId}: Newly arrived stock merged from Main Hub. Remaining backorders consolidated into 1 final shipment.`);
    setTimeout(() => setConsolidatedNotice(''), 6000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BackButton href="/dashboard" label="Dashboard" />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              B6 Fulfillment & Split Optimizer
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
          Fulfillment Allocation & Warehouse Split Optimizer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated live-stock allocation across Main Warehouse and East Depot to minimize shipment count and delivery costs.
        </p>
      </div>

      {consolidatedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{consolidatedNotice}</span>
        </div>
      )}

      {/* Warehouse Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {warehouses.map((wh) => (
          <div key={wh.id} className="card p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 shrink-0">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">{wh.name}</h3>
                <p className="text-xs text-slate-400">{wh.location}</p>
                <div className="mt-2 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Stock Sync Active</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                Auto-Split Priority
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Warehouse Splits Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Truck className="w-4 h-4 text-indigo-400" /> Recommended Warehouse Split Orders
        </h2>

        {fulfillmentOrders.map((order) => {
          const isAccepted = acceptedSplits[order.id];
          const hasBackorder = (order.allocations || []).some((a) => a.backorderQty > 0);

          return (
            <div key={order.id} className="card p-6 bg-[var(--bg-card)] border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-white">Order {order.quotationNumber}</span>
                    <span className="text-xs text-slate-400">— {order.customerName}</span>
                    <Badge variant={order.status === 'Completed' ? 'success' : 'warning'}>{order.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Optimized split algorithm calculated to minimize freight cost.</p>
                </div>

                {/* Accept Split / Manual Override Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isAccepted ? 'success' : 'primary'}
                    onClick={() => handleAcceptSplit(order.id)}
                    leftIcon={isAccepted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PackageCheck className="w-3.5 h-3.5" />}
                  >
                    {isAccepted ? 'Suggested Split Accepted' : 'Accept Suggested Split'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOverridingOrderId(overridingOrderId === order.id ? null : order.id)}
                    leftIcon={<Sliders className="w-3.5 h-3.5" />}
                  >
                    Manual Override
                  </Button>
                </div>
              </div>

              {/* Split Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(order.allocations || []).map((alloc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{alloc.warehouseName}</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400">{alloc.allocatedQty} Fulfilled</span>
                    </div>
                    <div className="text-slate-400 text-[11px] flex justify-between">
                      <span>Product: {alloc.productName}</span>
                      <span>Shipment: 1 parcel ($35 est. freight)</span>
                    </div>
                    {alloc.backorderQty > 0 && (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-semibold flex items-center justify-between">
                        <span>{alloc.backorderQty} Units Backordered</span>
                        <span className="text-[10px] text-slate-400">Arriving in 3 days</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Stock Mid-Fulfillment Consolidate Backorder Prompt */}
              {hasBackorder && (
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-indigo-200">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Stock replenishment arrived at East Depot mid-fulfillment. Would you like to consolidate remaining backorders?
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConsolidateBackorder(order.id)}
                    className="shrink-0"
                  >
                    Consolidate Remaining Backorder
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
