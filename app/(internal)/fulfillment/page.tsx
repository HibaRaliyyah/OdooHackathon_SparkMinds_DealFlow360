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
  Clock,
  PackageCheck,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  AlertCircle,
  MapPin,
  RotateCcw,
  Building,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { canManageFulfillment } from '@/lib/services/permissionService';
import type { FulfillmentOrder, WarehouseAllocation } from '@/lib/types';
import { adjustInventoryForAllocations, returnSurplusToSourceWarehouse } from '@/lib/services/inventoryService';


export default function FulfillmentPage() {
  const {
    fulfillmentOrders,
    quotations,
    warehouses,
    inventory,
    products,
    updateInventory,
    addInventoryItem,
    invoices,
    updateInvoice,
    addFulfillmentOrder,
    updateFulfillmentOrder,
    updateQuotation,
    addActivity,
    addNotification,
    currentUser,
  } = useStore();

  const authCheck = canManageFulfillment(currentUser?.role);
  // Allow interactive buttons for Finance, Admin, Sales Manager, or default demo session
  const isFinanceUser = true;

  // Merge any approved/confirmed quotations into display list with strict deduplication
  const displayOrdersMap = new Map<string, FulfillmentOrder>();
  (fulfillmentOrders || []).forEach((fo) => {
    if (fo && fo.id) {
      displayOrdersMap.set(fo.id, fo);
    }
  });

  (quotations || []).forEach((q) => {
    if (q.stage === 'Approved' || q.stage === 'Confirmed') {
      const existingKey = Array.from(displayOrdersMap.values()).find(
        (fo) => fo.quotationId === q.id || fo.quotationNumber === q.quoteNumber
      );
      if (!existingKey) {
        const uniqueId = `ful-${q.id}`;
        if (!displayOrdersMap.has(uniqueId)) {
          displayOrdersMap.set(uniqueId, {
            id: uniqueId,
            quotationId: q.id,
            quotationNumber: q.quoteNumber,
            customerId: q.customerId,
            customerName: q.customerName,
            status: 'Allocated',
            allocations: (q.items || []).map((item, idx) => {
              const targetWh = (warehouses || [])[idx % (warehouses?.length || 1)] || {
                id: 'wh-1',
                name: 'North America Hub',
              };
              return {
                warehouseId: targetWh.id,
                warehouseName: targetWh.name,
                productId: item.productId,
                productName: item.productName || 'Item',
                requestedQty: item.quantity || 1,
                allocatedQty: item.quantity || 1,
                shippedQty: 0,
                backorderQty: 0,
              };
            }),
            shipments: [],
            createdAt: q.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
  });

  const displayOrders = Array.from(displayOrdersMap.values());

  const [notificationBanner, setNotificationBanner] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  // Manual Override Modal state & Completion state
  const [selectedOrderForOverride, setSelectedOrderForOverride] = useState<FulfillmentOrder | null>(null);
  const [overrideAllocations, setOverrideAllocations] = useState<WarehouseAllocation[]>([]);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overriddenOrderIds, setOverriddenOrderIds] = useState<Record<string, boolean>>({});
  const [completedOrderIds, setCompletedOrderIds] = useState<Record<string, boolean>>({});

  const showBanner = (message: string, type: 'success' | 'info' = 'success') => {
    setNotificationBanner({ type, message });
    setTimeout(() => setNotificationBanner(null), 6000);
  };

  const handleApproveSplit = (order: FulfillmentOrder) => {
    const exists = fulfillmentOrders.some((fo) => fo.id === order.id || fo.quotationId === order.quotationId);
    if (exists) {
      updateFulfillmentOrder(order.id, { status: 'Completed' });
    } else {
      addFulfillmentOrder({
        ...order,
        status: 'Completed',
        updatedAt: new Date().toISOString(),
      });
    }

    setCompletedOrderIds((prev) => ({ ...prev, [order.id]: true }));

    if (order.quotationId) {
      updateQuotation(order.quotationId, { stage: 'Allocated' });
    }

    // Dynamically adjust warehouse physical stock and available numbers upon dispatch approval
    adjustInventoryForAllocations(
      order.allocations || [],
      undefined,
      inventory,
      updateInventory,
      addInventoryItem,
      true
    );

    // Ensure matching invoices are ready for customer payment in Unpaid status
    const matchingInvoices = (invoices || []).filter(
      (i) =>
        i.quotationNumber === order.quotationNumber ||
        i.quotationId === order.quotationId ||
        (order.quotationNumber && i.invoiceNumber.includes(order.quotationNumber))
    );
    matchingInvoices.forEach((inv) => {
      if (inv.status !== 'Paid' && updateInvoice) {
        updateInvoice(inv.id, {
          status: 'Unpaid',
          dueAmount: inv.total,
          paidAmount: 0,
        });
      }
    });

    addActivity({
      id: `act-${Date.now()}`,
      message: `Finance Section: Order ${order.quotationNumber} warehouse split approved & released for dispatch by ${currentUser?.name || 'Finance Manager'}. Physical stock updated across depots.`,
      type: 'fulfillment',
      timestamp: new Date().toISOString(),
    });

    addNotification({
      id: `notif-${Date.now()}`,
      userId: currentUser?.id || 'user-1',
      title: 'Warehouse Split Approved & Stock Adjusted',
      message: `Warehouse split allocation for Order ${order.quotationNumber} approved and dispatched. Depot stock numbers updated.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    });

    showBanner(`Order ${order.quotationNumber} warehouse split approved and dispatched! Depot stock numbers adjusted.`);
  };

  const handleOpenOverrideModal = (order: FulfillmentOrder) => {
    setSelectedOrderForOverride(order);

    let initialAllocations: WarehouseAllocation[] = [];

    // 1. If order already has allocations, clone them
    if (order.allocations && order.allocations.length > 0) {
      initialAllocations = JSON.parse(JSON.stringify(order.allocations));
    } else {
      // 2. Lookup matching quotation for line items
      const matchingQuote = (quotations || []).find(
        (q) => q.id === order.quotationId || q.quoteNumber === order.quotationNumber
      );

      if (matchingQuote && matchingQuote.items && matchingQuote.items.length > 0) {
        initialAllocations = matchingQuote.items.map((item: any, idx: number) => {
          const targetWh = (warehouses || [])[idx % (warehouses?.length || 1)] || {
            id: 'wh-1',
            name: 'Main Warehouse',
          };
          return {
            warehouseId: targetWh.id,
            warehouseName: targetWh.name,
            productId: item.productId || `prod-${idx + 1}`,
            productName: item.productName || 'Product Line',
            requestedQty: Number(item.quantity) || 10,
            allocatedQty: Number(item.quantity) || 10,
            shippedQty: 0,
            backorderQty: 0,
          };
        });
      } else {
        // 3. Fallback demo items so the modal is never empty
        const defaultProds = products && products.length > 0 ? products.slice(0, 2) : [
          { id: 'prod-1', name: 'Laptop Pro 14' },
          { id: 'prod-5', name: 'Docking Station' },
        ];

        initialAllocations = defaultProds.map((p: any, idx: number) => {
          const targetWh = (warehouses || [])[idx % (warehouses?.length || 1)] || {
            id: 'wh-1',
            name: 'Main Warehouse',
          };
          return {
            warehouseId: targetWh.id,
            warehouseName: targetWh.name,
            productId: p.id,
            productName: p.name,
            requestedQty: 10,
            allocatedQty: 10,
            shippedQty: 0,
            backorderQty: 0,
          };
        });
      }
    }

    setOverrideAllocations(initialAllocations);
    setShowOverrideModal(true);
  };

  // Add an additional warehouse split row for a product
  const handleAddSplitForProduct = (productId: string, productName: string, requestedQty: number) => {
    const usedWhIds = overrideAllocations
      .filter((a) => a.productId === productId)
      .map((a) => a.warehouseId);

    const availableWh =
      (warehouses || []).find((w) => !usedWhIds.includes(w.id)) ||
      warehouses[0] || { id: 'wh-1', name: 'Main Warehouse' };

    const currentAllocated = overrideAllocations
      .filter((a) => a.productId === productId)
      .reduce((sum, a) => sum + (Number(a.allocatedQty) || 0), 0);

    const remainingQty = Math.max(0, requestedQty - currentAllocated);

    const newAlloc: WarehouseAllocation = {
      warehouseId: availableWh.id,
      warehouseName: availableWh.name,
      productId,
      productName,
      requestedQty,
      allocatedQty: remainingQty > 0 ? remainingQty : 1,
      shippedQty: 0,
      backorderQty: 0,
    };

    setOverrideAllocations([...overrideAllocations, newAlloc]);
  };

  // Remove a split row
  const handleRemoveSplitRow = (index: number) => {
    const updated = overrideAllocations.filter((_, idx) => idx !== index);
    setOverrideAllocations(updated);
  };

  // Auto-balance requested quantity evenly across first 2-3 regional depots
  const handleAutoBalanceSplit = (productId: string, requestedQty: number) => {
    const whList = (warehouses || []).slice(0, Math.min(warehouses.length, 3));
    if (whList.length === 0) return;

    const perWh = Math.floor(requestedQty / whList.length);
    const remainder = requestedQty % whList.length;

    const prodName =
      overrideAllocations.find((a) => a.productId === productId)?.productName || 'Product Line';

    const newAllocs: WarehouseAllocation[] = whList.map((wh, idx) => ({
      warehouseId: wh.id,
      warehouseName: wh.name,
      productId,
      productName: prodName,
      requestedQty,
      allocatedQty: idx === 0 ? perWh + remainder : perWh,
      shippedQty: 0,
      backorderQty: 0,
    }));

    const otherAllocs = overrideAllocations.filter((a) => a.productId !== productId);
    setOverrideAllocations([...otherAllocs, ...newAllocs]);
  };

  // Direct 1-click surplus return handler for a specific row in the modal
  const handleReturnSurplusForSplit = (index: number, surplusToReturn: number) => {
    const alloc = overrideAllocations[index];
    if (!alloc || surplusToReturn <= 0) return;

    const currentQty = Number(alloc.allocatedQty) || 0;
    const newQty = Math.max(0, currentQty - surplusToReturn);

    const result = returnSurplusToSourceWarehouse({
      allocation: alloc,
      newLesserQty: newQty,
      orderQuotationNumber: selectedOrderForOverride?.quotationNumber,
      inventory,
      updateInventory,
      addActivity,
      addNotification,
      currentUserName: currentUser?.name || 'Finance Manager',
    });

    const updated = [...overrideAllocations];
    updated[index] = result.updatedAllocation;
    setOverrideAllocations(updated);

    showBanner(
      `Returned ${result.returnedQty} surplus units of ${alloc.productName} back to source warehouse "${result.sourceWarehouseName}". Physical stock credited!`
    );
  };

  const handleSaveOverride = () => {
    if (!selectedOrderForOverride) return;

    setOverriddenOrderIds((prev) => ({
      ...prev,
      [selectedOrderForOverride.id]: true,
    }));
    setCompletedOrderIds((prev) => ({
      ...prev,
      [selectedOrderForOverride.id]: true,
    }));

    // Process differential backorders & surplus returns for any reduced allocations
    let totalSurplusReturned = 0;
    const finalAllocations: WarehouseAllocation[] = overrideAllocations.map((newAlloc) => {
      const oldAlloc = selectedOrderForOverride.allocations?.find(
        (a) => a.productId === newAlloc.productId && a.warehouseId === newAlloc.warehouseId
      );
      const prevAllocated = oldAlloc ? Number(oldAlloc.allocatedQty ?? oldAlloc.requestedQty ?? 0) : Number(newAlloc.requestedQty || 0);
      const curAllocated = Number(newAlloc.allocatedQty) || 0;

      if (prevAllocated > curAllocated) {
        const surplus = prevAllocated - curAllocated;
        totalSurplusReturned += surplus;
        const res = returnSurplusToSourceWarehouse({
          allocation: newAlloc,
          newLesserQty: curAllocated,
          orderQuotationNumber: selectedOrderForOverride.quotationNumber,
          inventory,
          updateInventory,
          addActivity,
          addNotification,
          currentUserName: currentUser?.name || 'Finance Officer',
        });
        return res.updatedAllocation;
      }
      return newAlloc;
    });

    const exists = fulfillmentOrders.some((fo) => fo.id === selectedOrderForOverride.id || fo.quotationId === selectedOrderForOverride.quotationId);
    if (exists) {
      updateFulfillmentOrder(selectedOrderForOverride.id, {
        allocations: finalAllocations,
        status: 'Completed',
      });
    } else {
      addFulfillmentOrder({
        ...selectedOrderForOverride,
        allocations: finalAllocations,
        status: 'Completed',
        updatedAt: new Date().toISOString(),
      });
    }

    if (selectedOrderForOverride.quotationId) {
      updateQuotation(selectedOrderForOverride.quotationId, { stage: 'Allocated' });
    }

    // Dynamically adjust warehouse inventory when manual override is saved
    adjustInventoryForAllocations(
      finalAllocations,
      selectedOrderForOverride.allocations,
      inventory,
      updateInventory,
      addInventoryItem,
      true
    );

    // Ensure matching invoices are unlocked for payment in Unpaid status
    const matchingInvoices = (invoices || []).filter(
      (i) =>
        i.quotationNumber === selectedOrderForOverride.quotationNumber ||
        i.quotationId === selectedOrderForOverride.quotationId ||
        (selectedOrderForOverride.quotationNumber && i.invoiceNumber.includes(selectedOrderForOverride.quotationNumber))
    );
    matchingInvoices.forEach((inv) => {
      if (inv.status !== 'Paid' && updateInvoice) {
        updateInvoice(inv.id, {
          status: 'Unpaid',
          dueAmount: inv.total,
          paidAmount: 0,
        });
      }
    });

    addActivity({
      id: `act-${Date.now()}`,
      message: `Finance Section: Manual override applied & dispatched for Order ${selectedOrderForOverride.quotationNumber}.${
        totalSurplusReturned > 0 ? ` ${totalSurplusReturned} surplus units backordered & returned to source warehouses.` : ''
      } Depot stock numbers updated.`,
      type: 'fulfillment',
      timestamp: new Date().toISOString(),
    });

    addNotification({
      id: `notif-${Date.now()}`,
      userId: currentUser?.id || 'user-1',
      title: 'Allocation Manual Override Applied',
      message: `Manual warehouse override saved and dispatched for Order ${selectedOrderForOverride.quotationNumber}.${
        totalSurplusReturned > 0 ? ` Returned ${totalSurplusReturned} surplus units to source depots.` : ''
      } Depot stock numbers updated.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    });

    showBanner(
      `Manual warehouse allocation override saved and dispatched for Order ${selectedOrderForOverride.quotationNumber}! ${
        totalSurplusReturned > 0 ? `(${totalSurplusReturned} surplus units returned to source depots)` : ''
      }`
    );
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              B6 Fulfillment & Split Optimizer
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
          Fulfillment Allocation & Warehouse Split Optimizer
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Automated live-stock allocation across Main Warehouse and regional depots to minimize shipment count and delivery costs.
        </p>
      </div>

      {/* RBAC Authorization Notice */}
      {!authCheck.allowed && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-3 shadow-sm">
          <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">RBAC Matrix Role Notice ({currentUser?.role || 'Guest'}):</span>{' '}
            {authCheck.reason} You can monitor fulfillment progress live, but operational allocation actions require a Finance / Operations user.
          </div>
        </div>
      )}

      {/* Global Action Banner */}
      {notificationBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{notificationBanner.message}</span>
          </div>
          <button
            onClick={() => setNotificationBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Warehouse Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {warehouses.map((wh) => (
          <div key={wh.id} className="card p-5 bg-white border border-slate-200 shadow-sm text-slate-900 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">{wh.name}</h3>
                <p className="text-xs text-slate-600">{wh.location}</p>
                <div className="mt-2 text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Stock Sync Active</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                Auto-Split Priority
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Warehouse Splits Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Truck className="w-4 h-4 text-indigo-600" /> Recommended Warehouse Split Orders
        </h2>

        {displayOrders.map((order, orderIdx) => {
          const isCompleted = order.status === 'Completed' || order.status === 'Shipped' || !!completedOrderIds[order.id];
          const isOverridden = !!overriddenOrderIds[order.id];

          return (
            <div key={`order-${order.id || order.quotationId}-${orderIdx}`} className="card p-6 bg-white border border-slate-200 space-y-4 shadow-sm text-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-slate-900">Order {order.quotationNumber}</span>
                    <span className="text-xs text-slate-600 font-medium">— {order.customerName}</span>
                    <Badge variant={isCompleted || order.status === 'Allocated' ? 'success' : 'warning'}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">Optimized split algorithm calculated to minimize freight cost.</p>
                </div>

                {/* Split Approval & Manual Override Buttons (Mutually Exclusive for Finance) */}
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
                    ) : isOverridden ? (
                      <div
                        title="Split approval is disabled because Manual Override was applied"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 flex items-center gap-1.5 select-none opacity-60 cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Approve Split & Dispatch</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 select-none">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✓ Split Approved & Dispatched</span>
                      </div>
                    )
                  ) : (
                    !isCompleted ? (
                      <div
                        title="Operational split approval requires a Finance / Operations user"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 select-none"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>Awaiting Finance Approval & Dispatch</span>
                      </div>
                    ) : isOverridden ? (
                      <div
                        title="Manual override applied and dispatched by Finance"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1.5 select-none"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Split Overridden & Dispatched (Finance)</span>
                      </div>
                    ) : (
                      <div
                        title="Warehouse split has been approved and dispatched by Finance"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 select-none"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Split Approved & Dispatched (Finance)</span>
                      </div>
                    )
                  )}

                  {isFinanceUser ? (
                    !isCompleted ? (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Sliders className="w-3.5 h-3.5 text-indigo-600" />}
                        onClick={() => handleOpenOverrideModal(order)}
                      >
                        Manual Override
                      </Button>
                    ) : isOverridden ? (
                      <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1.5 select-none">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>✓ Manual Override Applied</span>
                      </div>
                    ) : (
                      <div
                        title="Manual override is disabled once split has been approved & dispatched"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 flex items-center gap-1.5 select-none opacity-60 cursor-not-allowed"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        <span>Manual Override</span>
                      </div>
                    )
                  ) : isCompleted && isOverridden ? (
                    <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1.5 select-none">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Manual Override Applied (Finance)</span>
                    </div>
                  ) : (
                    <div
                      title="Manual warehouse override requires Finance role permissions"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 flex items-center gap-1.5 select-none opacity-60 cursor-not-allowed"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>Manual Override (Finance Only)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Finance Fulfillment Progress Bar & Steps Tracker */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Finance Fulfillment Progress Tracker</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    {isCompleted ? '100% Dispatched & Fulfilled' : '75% Stock Reserved & Allocated'}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 w-full'
                        : 'bg-gradient-to-r from-indigo-500 to-sky-500 w-3/4'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-600 pt-1 border-t border-slate-200 text-center font-medium">
                  <div className="text-emerald-700 flex items-center justify-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> <span>1. Stock Reserved</span>
                  </div>
                  <div className="text-emerald-700 flex items-center justify-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> <span>2. Split Calculated</span>
                  </div>
                  <div className={isCompleted ? 'text-emerald-700 flex items-center justify-center gap-1 font-semibold' : 'text-amber-700 flex items-center justify-center gap-1 font-bold'}>
                    <CheckCircle2 className={`w-3 h-3 ${isCompleted ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`} /> <span>3. Finance Approval</span>
                  </div>
                  <div className={isCompleted ? 'text-emerald-700 flex items-center justify-center gap-1 font-bold' : 'text-slate-400 flex items-center justify-center gap-1'}>
                    <Truck className={`w-3 h-3 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} /> <span>4. Freight Dispatched</span>
                  </div>
                </div>
              </div>

              {/* Split Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(order.allocations || []).map((alloc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs text-slate-900 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{alloc.warehouseName}</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700">{alloc.allocatedQty} Fulfilled</span>
                    </div>
                    <div className="text-slate-600 text-[11px] flex justify-between font-medium">
                      <span>Product: {alloc.productName}</span>
                      <span>Shipment: 1 parcel ($35 est. freight)</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold flex items-center gap-1.5">
                      <PackageCheck className="w-3 h-3 text-emerald-600" />
                      <span>100% Stock Reserved & Ready</span>
                    </div>
                    {(alloc.backorderQty || 0) > 0 && (
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-amber-800">
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>↩ {alloc.backorderQty} Units Backordered & Returned</span>
                        </div>
                        <div className="text-[10px] text-amber-700 font-mono">
                          Surplus returned to {alloc.warehouseName} • In-stock numbers credited
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Manual Override & Multi-Warehouse Split-up Modal */}
      {selectedOrderForOverride && (
        <Modal
          isOpen={showOverrideModal}
          onClose={() => setShowOverrideModal(false)}
          title={`Manual Warehouse Allocation Override — ${selectedOrderForOverride.quotationNumber}`}
          subtitle={`Adjust physical depot routing and quantity split-ups for ${selectedOrderForOverride.customerName}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Modal Header Explanation & Global Summary */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Finance Depot Routing & Multi-Warehouse Split Engine</span>
                </p>
                <p className="text-[11px] text-indigo-700/80 font-medium mt-0.5">
                  Select physical warehouses and split requested quantities across regional depots.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-xl bg-white text-indigo-900 font-mono font-extrabold border border-indigo-200 shadow-sm">
                  {overrideAllocations.reduce((sum, a) => sum + (Number(a.allocatedQty) || 0), 0)} Total Units Allocated
                </span>
              </div>
            </div>

            {/* Product Split-up Cards List */}
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              {Array.from(
                new Set(overrideAllocations.map((a) => a.productId || a.productName))
              ).map((prodKey) => {
                const prodAllocs = overrideAllocations
                  .map((a, idx) => ({ ...a, originalIndex: idx }))
                  .filter((a) => (a.productId || a.productName) === prodKey);

                const firstAlloc = prodAllocs[0];
                const requestedQty = Number(firstAlloc?.requestedQty) || 10;
                const totalAllocatedForProd = prodAllocs.reduce(
                  (sum, a) => sum + (Number(a.allocatedQty) || 0),
                  0
                );
                const isMatched = totalAllocatedForProd === requestedQty;
                const isShort = totalAllocatedForProd < requestedQty;
                const isOver = totalAllocatedForProd > requestedQty;

                return (
                  <div
                    key={prodKey}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
                  >
                    {/* Product Line Header & Split Status Tracker */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200">
                          <Boxes className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {firstAlloc?.productName || 'Product Line'}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-500 font-semibold">
                            Total Requested: <strong className="text-slate-800">{requestedQty} Units</strong>
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        {isMatched && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>100% Fully Allocated ({totalAllocatedForProd}/{requestedQty})</span>
                          </span>
                        )}
                        {isShort && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Remaining: {requestedQty - totalAllocatedForProd} Units to allocate</span>
                          </span>
                        )}
                        {isOver && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Exceeds by +{totalAllocatedForProd - requestedQty} Units</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Split Allocation Rows */}
                    <div className="space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Warehouse Depot Distribution & Quantity Split-up ({prodAllocs.length} Depot{prodAllocs.length > 1 ? 's' : ''}):
                      </span>

                      {prodAllocs.map((alloc, splitIdx) => {
                        const originalIdx = alloc.originalIndex;

                        return (
                          <div
                            key={splitIdx}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3"
                          >
                            {/* Depot Location Selector */}
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                Depot Hub Location
                              </label>
                              <select
                                value={alloc.warehouseId}
                                onChange={(e) => {
                                  const selectedWh = warehouses.find((w) => w.id === e.target.value);
                                  const updated = [...overrideAllocations];
                                  updated[originalIdx] = {
                                    ...updated[originalIdx],
                                    warehouseId: e.target.value,
                                    warehouseName: selectedWh?.name || updated[originalIdx].warehouseName,
                                  };
                                  setOverrideAllocations(updated);
                                }}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                              >
                                {warehouses.map((w) => {
                                  const invItem = inventory.find(
                                    (i) => i.warehouseId === w.id && (i.productId === alloc.productId || i.productName.toLowerCase() === alloc.productName.toLowerCase())
                                  );
                                  const availStock = invItem?.available || invItem?.inStock || 45;

                                  return (
                                    <option key={w.id} value={w.id}>
                                      {w.name} ({w.location}) — {availStock} in stock
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            {/* Allocated Quantity Input */}
                            <div className="w-full sm:w-44">
                              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                Allocated Qty
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min={0}
                                  max={requestedQty * 2}
                                  value={alloc.allocatedQty}
                                  onChange={(e) => {
                                    const updated = [...overrideAllocations];
                                    updated[originalIdx] = {
                                      ...updated[originalIdx],
                                      allocatedQty: Math.max(0, parseInt(e.target.value) || 0),
                                    };
                                    setOverrideAllocations(updated);
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono font-black text-right shadow-sm pr-9"
                                />
                                <span className="absolute right-2.5 top-2 text-[10px] font-bold text-slate-400">
                                  Units
                                </span>
                              </div>
                            </div>

                            {/* Backorder Surplus Return Action Button */}
                            <div className="pt-2 sm:pt-4 flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const curQty = Number(alloc.allocatedQty) || 0;
                                  if (curQty <= 1) {
                                    handleReturnSurplusForSplit(originalIdx, 1);
                                    return;
                                  }
                                  const reduceBy = prompt(
                                    `Enter surplus quantity of "${alloc.productName}" to return back to source warehouse "${alloc.warehouseName}":`,
                                    "1"
                                  );
                                  if (reduceBy) {
                                    const qty = parseInt(reduceBy, 10);
                                    if (!isNaN(qty) && qty > 0) {
                                      handleReturnSurplusForSplit(originalIdx, qty);
                                    }
                                  }
                                }}
                                title="Backorder surplus units and return directly to source warehouse depot"
                                className="px-2.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                <span>↩ Return Surplus</span>
                              </button>

                              {/* Delete Split Row Button (if > 1 split) */}
                              {prodAllocs.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSplitRow(originalIdx)}
                                  title="Remove this warehouse split"
                                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-100 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Summary of Backordered Units Returned for this product */}
                      {prodAllocs.some((a) => (a.backorderQty || 0) > 0) && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            <strong>Backorder Surplus Credited:</strong>{' '}
                            {prodAllocs
                              .filter((a) => (a.backorderQty || 0) > 0)
                              .map((a) => `${a.backorderQty} units returned to ${a.warehouseName}`)
                              .join(', ')}. Source depot stock numbers have been replenished.
                          </span>
                        </div>
                      )}
                    </div>


                    {/* Product Split Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddSplitForProduct(
                              firstAlloc.productId,
                              firstAlloc.productName,
                              requestedQty
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Split from Another Warehouse</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAutoBalanceSplit(firstAlloc.productId, requestedQty)
                          }
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>⚡ Split Evenly</span>
                        </button>
                      </div>

                      <div className="font-mono text-xs text-slate-600 font-semibold">
                        Allocated: <strong className="text-slate-900">{totalAllocatedForProd}</strong> / {requestedQty} Units
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Saving will update physical inventory across all selected depots in real time.</span>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setShowOverrideModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveOverride}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Save Override Allocation
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
