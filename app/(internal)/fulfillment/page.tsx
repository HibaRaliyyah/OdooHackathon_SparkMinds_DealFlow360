'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Warehouse,
  CheckCircle2,
  Boxes,
  Truck,
  Sliders,
  Lock,
  PackageCheck,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { canManageFulfillment } from '@/lib/services/permissionService';
import type { FulfillmentOrder, WarehouseAllocation } from '@/lib/types';

export default function FulfillmentPage() {
  const {
    fulfillmentOrders,
    warehouses,
    updateFulfillmentOrder,
    addActivity,
    addNotification,
    currentUser,
  } = useStore();

  const authCheck = canManageFulfillment(currentUser?.role);
  const isFinanceUser = currentUser?.role === 'FINANCE' || currentUser?.role === 'ADMIN';

  const [notificationBanner, setNotificationBanner] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  // Manual Override Modal state
  const [selectedOrderForOverride, setSelectedOrderForOverride] = useState<FulfillmentOrder | null>(null);
  const [overrideAllocations, setOverrideAllocations] = useState<WarehouseAllocation[]>([]);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  const showBanner = (message: string, type: 'success' | 'info' = 'success') => {
    setNotificationBanner({ type, message });
    setTimeout(() => setNotificationBanner(null), 6000);
  };

  const handleApproveSplit = (order: FulfillmentOrder) => {
    updateFulfillmentOrder(order.id, { status: 'Completed' });

    addActivity({
      id: `act-${Date.now()}`,
      message: `Finance Section: Order ${order.quotationNumber} warehouse split approved & released for dispatch by ${currentUser?.name || 'Finance Manager'}.`,
      type: 'fulfillment',
      timestamp: new Date().toISOString(),
    });

    addNotification({
      id: `notif-${Date.now()}`,
      userId: currentUser?.id || 'user-1',
      title: 'Warehouse Split Approved',
      message: `Warehouse split allocation for Order ${order.quotationNumber} approved and dispatched.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    });

    showBanner(`Order ${order.quotationNumber} warehouse split approved and dispatched successfully by Finance!`);
  };

  const handleOpenOverrideModal = (order: FulfillmentOrder) => {
    setSelectedOrderForOverride(order);
    setOverrideAllocations(JSON.parse(JSON.stringify(order.allocations || [])));
    setShowOverrideModal(true);
  };

  const handleSaveOverride = () => {
    if (!selectedOrderForOverride) return;

    updateFulfillmentOrder(selectedOrderForOverride.id, {
      allocations: overrideAllocations,
      status: 'Allocated',
    });

    addActivity({
      id: `act-${Date.now()}`,
      message: `Finance Section: Manual override applied to warehouse allocations for Order ${selectedOrderForOverride.quotationNumber}.`,
      type: 'fulfillment',
      timestamp: new Date().toISOString(),
    });

    addNotification({
      id: `notif-${Date.now()}`,
      userId: currentUser?.id || 'user-1',
      title: 'Allocation Manual Override Saved',
      message: `Manual warehouse override saved for Order ${selectedOrderForOverride.quotationNumber}.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    });

    showBanner(`Manual warehouse allocation override saved for Order ${selectedOrderForOverride.quotationNumber}!`);
    setShowOverrideModal(false);
    setSelectedOrderForOverride(null);
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
            className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-1 rounded cursor-pointer"
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
          const isCompleted = order.status === 'Completed' || order.status === 'Shipped';

          return (
            <div key={order.id} className="card p-6 bg-[var(--bg-card)] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-white">Order {order.quotationNumber}</span>
                    <span className="text-xs text-slate-400">— {order.customerName}</span>
                    <Badge variant={isCompleted || order.status === 'Allocated' ? 'success' : 'warning'}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Optimized split algorithm calculated to minimize freight cost.</p>
                </div>

                {/* Split Approval & Manual Override Buttons (Enabled for Finance Section) */}
                <div className="flex items-center gap-2">
                  {isFinanceUser ? (
                    !isCompleted ? (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        onClick={() => handleApproveSplit(order)}
                      >
                        Approve Split & Dispatch
                      </Button>
                    ) : (
                      <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 select-none">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Split Approved & Dispatched</span>
                      </div>
                    )
                  ) : (
                    <div
                      title="Operational split approval requires a Finance / Operations user"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400/60 border border-emerald-500/20 flex items-center gap-1.5 select-none opacity-80"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" />
                      <span>Split Approved & Dispatched (Finance Only)</span>
                    </div>
                  )}

                  {isFinanceUser ? (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Sliders className="w-3.5 h-3.5 text-indigo-400" />}
                      onClick={() => handleOpenOverrideModal(order)}
                    >
                      Manual Override
                    </Button>
                  ) : (
                    <div
                      title="Manual warehouse override requires Finance role permissions"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 text-slate-500 border border-slate-700/60 flex items-center gap-1.5 select-none opacity-70"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      <span>Manual Override (Finance Only)</span>
                    </div>
                  )}
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
                      <PackageCheck className="w-3 h-3 text-emerald-400" />
                      <span>100% Stock Reserved & Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Override Modal */}
      {selectedOrderForOverride && (
        <Modal
          isOpen={showOverrideModal}
          onClose={() => setShowOverrideModal(false)}
          title={`Manual Warehouse Allocation Override — ${selectedOrderForOverride.quotationNumber}`}
          subtitle={`Adjust physical depot routing and item quantities for ${selectedOrderForOverride.customerName}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            <p className="text-xs text-slate-300">
              Finance operational override allows manual routing of warehouse inventory allocations. Select target depot hubs and specify allocated quantities.
            </p>

            <div className="space-y-4">
              {overrideAllocations.map((alloc, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-indigo-400" />
                      <span>{alloc.productName}</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-400 text-[11px]">
                      Requested: {alloc.requestedQty} Units
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Depot Hub Location
                      </label>
                      <select
                        value={alloc.warehouseId}
                        onChange={(e) => {
                          const selectedWh = warehouses.find((w) => w.id === e.target.value);
                          const updated = [...overrideAllocations];
                          updated[idx] = {
                            ...updated[idx],
                            warehouseId: e.target.value,
                            warehouseName: selectedWh?.name || updated[idx].warehouseName,
                          };
                          setOverrideAllocations(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.location})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Allocated Quantity
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={alloc.requestedQty || 1000}
                        value={alloc.allocatedQty}
                        onChange={(e) => {
                          const updated = [...overrideAllocations];
                          updated[idx] = {
                            ...updated[idx],
                            allocatedQty: Math.max(0, parseInt(e.target.value) || 0),
                          };
                          setOverrideAllocations(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setShowOverrideModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveOverride} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Save Override Allocation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
