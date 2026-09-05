'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import {
  Warehouse,
  CheckCircle2,
  Boxes,
  Truck,
  Sliders,
  Lock,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { canManageFulfillment } from '@/lib/services/permissionService';

export default function FulfillmentPage() {
  const {
    fulfillmentOrders,
    warehouses,
    inventory,
    updateFulfillmentOrder,
    addActivity,
    addNotification,
    currentUser,
  } = useStore();

  const authCheck = canManageFulfillment(currentUser?.role);

  const [notificationBanner, setNotificationBanner] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  const showBanner = (message: string, type: 'success' | 'info' = 'success') => {
    setNotificationBanner({ type, message });
    setTimeout(() => setNotificationBanner(null), 6000);
  };



  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
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
          Automated live-stock allocation across Main Warehouse and regional depots to minimize shipment count and delivery costs.
        </p>
      </div>

      {/* RBAC Authorization Notice */}
      {!authCheck.allowed && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-3 shadow-lg">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-white">RBAC Matrix Role Notice ({currentUser?.role || 'Guest'}):</span>{' '}
            {authCheck.reason} You can monitor fulfillment progress live, but operational allocation actions require a Finance / Operations user.
          </div>
        </div>
      )}

      {/* Global Action Banner */}
      {notificationBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notificationBanner.message}</span>
          </div>
          <button
            onClick={() => setNotificationBanner(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-1 rounded"
          >
            Dismiss
          </button>
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
          const isAllocated = order.status === 'Allocated' || order.status === 'Completed' || order.status === 'Shipped';

          return (
            <div key={order.id} className="card p-6 bg-[var(--bg-card)] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-white">Order {order.quotationNumber}</span>
                    <span className="text-xs text-slate-400">— {order.customerName}</span>
                    <Badge variant={order.status === 'Completed' || order.status === 'Allocated' ? 'success' : 'warning'}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Optimized split algorithm calculated to minimize freight cost.</p>
                </div>

                {/* Accept Split / Manual Override Display Tags (Non-interactive) */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 select-none cursor-default">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Split Approved & Dispatched</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/60 flex items-center gap-1.5 select-none cursor-default">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span>Manual Override</span>
                  </div>
                </div>
              </div>

              {/* Split Breakdown Cards */}
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
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>100% Stock Reserved & Ready</span>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
}
