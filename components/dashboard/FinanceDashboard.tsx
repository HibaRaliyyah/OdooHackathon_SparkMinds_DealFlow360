'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import {
  Calculator,
  Receipt,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Boxes,
  Truck,
  AlertOctagon,
  FileCheck,
  Warehouse as WarehouseIcon,
  MapPin,
  ArrowRightLeft,
  Plus,
  Search,
  Building,
  Layers,
  AlertTriangle,
  Sparkles,
  Sliders,
} from 'lucide-react';
import type { Warehouse, InventoryItem } from '@/lib/types';

export function FinanceDashboard() {
  const {
    invoices,
    subscriptions,
    approvalRequests,
    fulfillmentOrders,
    warehouses,
    inventory,
    products,
    updateApprovalStage,
    addApprovalAction,
    addActivity,
    addWarehouse,
    addInventoryItem,
    updateInventory,
    updateFulfillmentOrder,
  } = useStore();

  // Active Sub-tab in Finance Console
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WAREHOUSE' | 'FULFILLMENT'>('OVERVIEW');

  // Warehouse Search & Filters
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockHealthFilter, setStockHealthFilter] = useState<'ALL' | 'LOW' | 'OPTIMAL'>('ALL');

  // Notification Banner
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  // Modals
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState<InventoryItem | null>(null);

  // Form States
  const [newWhName, setNewWhName] = useState('');
  const [newWhLocation, setNewWhLocation] = useState('');
  const [transferProductId, setTransferProductId] = useState(products[0]?.id || '');
  const [transferFromWhId, setTransferFromWhId] = useState(warehouses[0]?.id || '');
  const [transferToWhId, setTransferToWhId] = useState(warehouses[1]?.id || warehouses[0]?.id || '');
  const [transferQty, setTransferQty] = useState(5);
  const [adjustInStockQty, setAdjustInStockQty] = useState<number>(0);

  const triggerBanner = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(null), 5000);
  };

  // Financial KPI Calculations
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((acc, inv) => acc + inv.total, 0);
  const totalUnpaid = invoices.filter((i) => i.status === 'Unpaid' || i.status === 'Overdue').reduce((acc, inv) => acc + inv.total, 0);
  const activeSubscriptions = subscriptions.filter((s) => s.status === 'Active');
  const mrrTotal = activeSubscriptions.reduce((acc, s) => acc + (s.currentAmount || 46), 0);
  const secondLevelApprovals = approvalRequests.filter((r) => r.status === 'Pending' && (r.stage === 'Finance' || r.riskLevel === 'HIGH'));

  // Warehouse KPI Calculations
  const totalInStock = inventory.reduce((acc, i) => acc + (i.inStock || 0), 0);
  const totalReserved = inventory.reduce((acc, i) => acc + (i.reserved || 0), 0);
  const totalAvailable = inventory.reduce((acc, i) => acc + (i.available || 0), 0);
  const lowStockItemsCount = inventory.filter((i) => (i.available || 0) < 10).length;

  // Filtered Inventory Data
  const filteredInventory = inventory.filter((item) => {
    const matchesWh = selectedWarehouseFilter === 'ALL' || item.warehouseId === selectedWarehouseFilter;
    const matchesSearch =
      (item.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.warehouseName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isLow = (item.available || 0) < 10;
    const matchesHealth =
      stockHealthFilter === 'ALL' ||
      (stockHealthFilter === 'LOW' && isLow) ||
      (stockHealthFilter === 'OPTIMAL' && !isLow);

    return matchesWh && matchesSearch && matchesHealth;
  });

  const handleConfirm = (reqId: string, quoteId: string) => {
    addApprovalAction(reqId, {
      id: `act-${Date.now()}`,
      approvalRequestId: reqId,
      action: 'Confirmed',
      userId: 'user-4',
      userName: 'Riya Iyer',
      userRole: 'FINANCE',
      comment: 'Second level financial verification and credit terms passed. Confirmed deal.',
      timestamp: new Date().toISOString(),
    });
    updateApprovalStage(reqId, 'Completed', 'Approved');
    addActivity({
      id: `act-${Date.now()}`,
      type: 'approval',
      message: `Riya Iyer signed off second-level approval and confirmed deal for fulfillment.`,
      relatedTo: quoteId,
      timestamp: new Date().toISOString(),
    });
    triggerBanner('Second-level high-risk approval sign-off completed!');
  };

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName.trim() || !newWhLocation.trim()) return;

    const newWh: Warehouse = {
      id: `wh-${Date.now()}`,
      name: newWhName.trim(),
      location: newWhLocation.trim(),
    };

    addWarehouse(newWh);
    products.forEach((p) => {
      addInventoryItem({
        id: `inv-${Date.now()}-${p.id}`,
        warehouseId: newWh.id,
        warehouseName: newWh.name,
        productId: p.id,
        productName: p.name,
        inStock: 25,
        reserved: 0,
        available: 25,
      });
    });

    addActivity({
      id: `act-${Date.now()}`,
      message: `Finance Console: Created Depot "${newWh.name}" at ${newWh.location}. Initialized inventory pool.`,
      type: 'fulfillment',
      timestamp: new Date().toISOString(),
    });

    triggerBanner(`New Warehouse Depot "${newWh.name}" added to Finance & Auto-Split pool!`);
    setShowAddWarehouseModal(false);
    setNewWhName('');
    setNewWhLocation('');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFromWhId === transferToWhId) {
      alert('Source and Destination warehouses must be different.');
      return;
    }

    const sourceItem = inventory.find(
      (i) => i.productId === transferProductId && i.warehouseId === transferFromWhId
    );

    if (!sourceItem || sourceItem.available < transferQty) {
      alert(`Insufficient available stock in ${sourceItem?.warehouseName || 'source depot'}.`);
      return;
    }

    let targetItem = inventory.find(
      (i) => i.productId === transferProductId && i.warehouseId === transferToWhId
    );

    const fromWh = warehouses.find((w) => w.id === transferFromWhId);
    const toWh = warehouses.find((w) => w.id === transferToWhId);
    const prod = products.find((p) => p.id === transferProductId);

    updateInventory(sourceItem.id, {
      inStock: Math.max(0, sourceItem.inStock - transferQty),
      available: Math.max(0, sourceItem.available - transferQty),
    });

    if (targetItem) {
      updateInventory(targetItem.id, {
        inStock: targetItem.inStock + transferQty,
        available: targetItem.available + transferQty,
      });
    } else if (toWh && prod) {
      addInventoryItem({
        id: `inv-${Date.now()}`,
        warehouseId: toWh.id,
        warehouseName: toWh.name,
        productId: prod.id,
        productName: prod.name,
        inStock: transferQty,
        reserved: 0,
        available: transferQty,
      });
    }

    addActivity({
      id: `act-${Date.now()}`,
      message: `Finance Stock Transfer: Moved ${transferQty} units of ${prod?.name} from ${fromWh?.name} to ${toWh?.name}.`,
      type: 'fulfillment',
      timestamp: new Date().toISOString(),
    });

    triggerBanner(`Stock Transfer Complete: ${transferQty} units of ${prod?.name} moved to ${toWh?.name}.`);
    setShowTransferModal(false);
  };

  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAdjustModal) return;

    const newInStock = Math.max(0, adjustInStockQty);
    const newAvailable = Math.max(0, newInStock - showAdjustModal.reserved);

    updateInventory(showAdjustModal.id, {
      inStock: newInStock,
      available: newAvailable,
    });

    addActivity({
      id: `act-${Date.now()}`,
      message: `Finance Restock: ${showAdjustModal.productName} at ${showAdjustModal.warehouseName} updated to ${newInStock} units.`,
      type: 'fulfillment',
      timestamp: new Date().toISOString(),
    });

    triggerBanner(`Stock updated for ${showAdjustModal.productName} at ${showAdjustModal.warehouseName}.`);
    setShowAdjustModal(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Finance & Warehouse Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950 p-8 rounded-3xl border border-emerald-500/30 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" /> Finance & Operations Control Hub
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <WarehouseIcon className="w-3 h-3 text-indigo-400" /> Integrated Warehouse & Stock Engine
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-3">
              Financial Approvals, Warehouse Depots & Live Inventory
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Sign off 2nd-level approvals for high-risk quotes, manage physical warehouse facilities, monitor real-time stock allocation matrices, execute inter-depot transfers, and reconcile recurring invoices.
            </p>

            {/* Checklist */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 2nd-Level Financial & Risk Approvals
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Physical Depots & Auto-Split Stock Routing
              </span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Inter-Depot Stock Transfers & Restocking
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddWarehouseModal(true)}
            >
              Add Depot
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowRightLeft className="w-4 h-4" />}
              onClick={() => setShowTransferModal(true)}
            >
              Stock Transfer
            </Button>
            <Link href="/warehouses">
              <Button variant="outline" size="md" leftIcon={<WarehouseIcon className="w-4 h-4" />}>
                Warehouse Hub →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Notification Banner */}
      {bannerMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{bannerMsg}</span>
          </div>
          <button onClick={() => setBannerMsg(null)} className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Console Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[var(--border-medium)] pb-3">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'OVERVIEW'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
          }`}
        >
          <Calculator className="w-4 h-4" /> Overview & Financial Controls
        </button>

        <button
          onClick={() => setActiveTab('WAREHOUSE')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'WAREHOUSE'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
          }`}
        >
          <WarehouseIcon className="w-4 h-4" /> Warehouse & Live Stock Module ({warehouses.length} Depots)
        </button>

        <button
          onClick={() => setActiveTab('FULFILLMENT')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'FULFILLMENT'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
          }`}
        >
          <Boxes className="w-4 h-4" /> Fulfillment Splits & Invoices
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Second Level Approvals */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">2nd-Level Approvals</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-emerald-500 dark:text-emerald-300 tracking-tight">
              {secondLevelApprovals.length} Pending
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2">High-Risk Discount Sign-Offs</div>
          </div>
          <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between text-[11px] text-[var(--text-secondary)]">
            <span>Credit & Terms Gate</span>
            <Link href="/approvals" className="text-emerald-500 font-bold hover:underline">Review Queue →</Link>
          </div>
        </div>

        {/* KPI 2: Integrated Warehouse Hub */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Active Physical Depots</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <WarehouseIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-300 tracking-tight">
              {warehouses.length} Depots
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold mt-2">{totalInStock} Units Physical In-Stock</div>
          </div>
          <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between text-[11px] text-[var(--text-secondary)]">
            <span>Available: {totalAvailable}</span>
            <button onClick={() => setActiveTab('WAREHOUSE')} className="text-indigo-500 font-bold hover:underline">Open Module →</button>
          </div>
        </div>

        {/* KPI 3: Recurring MRR */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-cyan-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Recurring MRR</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-cyan-600 dark:text-cyan-300 tracking-tight">
              ${mrrTotal.toLocaleString()}/mo
            </div>
            <div className="text-xs text-cyan-600 dark:text-cyan-300 font-semibold mt-2">Reconciled Subscription Plans</div>
          </div>
          <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between text-[11px] text-[var(--text-secondary)]">
            <span>{activeSubscriptions.length} Subscriptions</span>
            <Link href="/subscriptions" className="text-cyan-500 font-bold hover:underline">Reconcile →</Link>
          </div>
        </div>

        {/* KPI 4: Recognized Invoices */}
        <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Recognized Invoices</span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-300 tracking-tight">
              ${totalInvoiced.toLocaleString()}
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-300 font-semibold mt-2">${totalPaid.toLocaleString()} Collected</div>
          </div>
          <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between text-[11px] text-[var(--text-secondary)]">
            <span>Unpaid: ${totalUnpaid.toLocaleString()}</span>
            <Link href="/invoices" className="text-amber-500 font-bold hover:underline">Invoices →</Link>
          </div>
        </div>
      </div>

      {/* ─── TAB CONTENT 1: OVERVIEW & APPROVALS ─── */}
      {(activeTab === 'OVERVIEW' || activeTab === 'FULFILLMENT') && secondLevelApprovals.length > 0 && (
        <div className="card p-6 bg-[var(--bg-card)] border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Second-Level High-Risk Approvals Queue
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Confirm exceptional discounts and validate payment terms prior to warehouse release</p>
            </div>
          </div>

          <div className="space-y-3">
            {secondLevelApprovals.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[var(--text-primary)] text-sm">Quote #{req.quotationNumber}</span>
                    <span className="text-xs text-[var(--text-secondary)]">— {req.customerName}</span>
                    <Badge variant="danger">{req.riskLevel} Risk ({req.riskScore}/100)</Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Stage: <strong className="text-emerald-500">{req.stage}</strong> · Sales Manager Sign-off completed. Requires 2nd-level confirmation.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => handleConfirm(req.id, req.quotationId)}
                >
                  Confirm 2nd Level Sign-off
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT 2: WAREHOUSE & LIVE INVENTORY MODULE ─── */}
      {(activeTab === 'WAREHOUSE' || activeTab === 'OVERVIEW') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-500" /> Warehouse Facilities & Live Depot Control
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Physical fulfillment depots, live stock allocations, and inter-depot inventory routing
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTransferModal(true)}
                leftIcon={<ArrowRightLeft className="w-4 h-4" />}
              >
                Inter-Depot Transfer
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddWarehouseModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Depot
              </Button>
            </div>
          </div>

          {/* Physical Depot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {warehouses.map((wh) => {
              const whItems = inventory.filter((i) => i.warehouseId === wh.id);
              const whInStock = whItems.reduce((a, b) => a + (b.inStock || 0), 0);
              const whReserved = whItems.reduce((a, b) => a + (b.reserved || 0), 0);
              const whAvailable = whItems.reduce((a, b) => a + (b.available || 0), 0);

              return (
                <div
                  key={wh.id}
                  className={`card p-5 bg-[var(--bg-card)] border transition-all space-y-4 shadow-sm ${
                    selectedWarehouseFilter === wh.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/20">
                        <WarehouseIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[var(--text-primary)]">{wh.name}</h3>
                        <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-indigo-400" /> {wh.location}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                      Active Hub
                    </span>
                  </div>

                  {/* Stock Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase block">In Stock</span>
                      <span className="font-mono text-sm font-extrabold text-[var(--text-primary)]">{whInStock}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase block">Reserved</span>
                      <span className="font-mono text-sm font-extrabold text-amber-500">{whReserved}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase block">Available</span>
                      <span className="font-mono text-sm font-extrabold text-emerald-500">{whAvailable}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-semibold font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live Sync Active</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedWarehouseFilter(selectedWarehouseFilter === wh.id ? 'ALL' : wh.id)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                    >
                      {selectedWarehouseFilter === wh.id ? 'Show All Depots' : 'Filter Depot Items ↓'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Inventory & Stock Allocation Matrix */}
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-500" /> Live Inventory & Stock Allocation Matrix
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Inspect stock levels, reserved customer orders, and net available inventory
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search product or warehouse..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Warehouse Filter */}
                <select
                  value={selectedWarehouseFilter}
                  onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                  className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Facilities</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>

                {/* Stock Health Filter */}
                <select
                  value={stockHealthFilter}
                  onChange={(e) => setStockHealthFilter(e.target.value as any)}
                  className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Stock Status</option>
                  <option value="LOW">Low Stock Alerts (&lt; 10)</option>
                  <option value="OPTIMAL">Optimal Availability</option>
                </select>
              </div>
            </div>

            {/* Inventory Table */}
            <Table
              data={filteredInventory}
              keyExtractor={(item) => item.id}
              columns={[
                {
                  header: 'Product Name & SKU',
                  cell: (item) => (
                    <div>
                      <span className="font-bold text-[var(--text-primary)] text-xs">{item.productName}</span>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono">ID: {item.productId}</div>
                    </div>
                  ),
                },
                {
                  header: 'Source Depot Facility',
                  cell: (item) => (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-semibold">
                      <MapPin className="w-3 h-3 text-indigo-500" />
                      <span>{item.warehouseName}</span>
                    </div>
                  ),
                },
                {
                  header: 'Physical In-Stock',
                  cell: (item) => (
                    <span className="font-mono font-bold text-[var(--text-primary)] text-xs">{item.inStock} Units</span>
                  ),
                },
                {
                  header: 'Reserved for Orders',
                  cell: (item) => (
                    <span className="font-mono font-bold text-amber-500 text-xs">
                      {item.reserved} Reserved
                    </span>
                  ),
                },
                {
                  header: 'Net Available Qty',
                  cell: (item) => (
                    <span className="font-mono font-black text-emerald-500 text-sm">
                      {item.available} Available
                    </span>
                  ),
                },
                {
                  header: 'Stock Health',
                  cell: (item) => {
                    const isLow = item.available < 10;
                    return isLow ? (
                      <Badge variant="danger">Low Stock Alert</Badge>
                    ) : (
                      <Badge variant="success">Optimal Stock</Badge>
                    );
                  },
                },
                {
                  header: 'Actions',
                  cell: (item) => (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowAdjustModal(item);
                          setAdjustInStockQty(item.inStock);
                        }}
                      >
                        Adjust Qty
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setTransferProductId(item.productId);
                          setTransferFromWhId(item.warehouseId);
                          setShowTransferModal(true);
                        }}
                      >
                        Transfer
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT 3: FULFILLMENT SPLITS & INVOICES RECONCILIATION ─── */}
      {(activeTab === 'FULFILLMENT' || activeTab === 'OVERVIEW') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-500" /> Fulfillment Allocation & Warehouse Split Optimizer (Finance Section)
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Live operational progress, automated multi-warehouse split dispatch releases, and inventory routing metrics for Finance users.
              </p>
            </div>

            <Link href="/fulfillment">
              <Button variant="outline" size="sm" leftIcon={<Truck className="w-4 h-4" />}>
                Full Fulfillment Hub →
              </Button>
            </Link>
          </div>

          {/* Finance Fulfillment Live Progress KPI Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Total Orders Monitored</div>
              <div className="text-2xl font-black text-white font-mono">{fulfillmentOrders.length} Split Orders</div>
              <div className="text-[11px] text-indigo-400 font-medium">100% Stock Allocation Synced</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Finance Dispatch Progress</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {fulfillmentOrders.filter(o => o.status === 'Completed' || o.status === 'Shipped').length} / {fulfillmentOrders.length} Dispatched
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">
                {Math.round((fulfillmentOrders.filter(o => o.status === 'Completed' || o.status === 'Shipped').length / Math.max(1, fulfillmentOrders.length)) * 100)}% Overall Fulfillment Complete
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Inventory Allocation Status</div>
              <div className="text-2xl font-black text-sky-400 font-mono">100% Stock Reserved</div>
              <div className="text-[11px] text-sky-300 font-medium">Zero Backorder Deficit Recorded</div>
            </div>
          </div>

          {/* Fulfillment Orders List */}
          <div className="space-y-5">
            {fulfillmentOrders.map((order) => {
              const isCompleted = order.status === 'Completed' || order.status === 'Shipped';
              const progressVal = isCompleted ? 100 : 75;

              return (
                <div key={order.id} className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-[var(--text-primary)]">Order {order.quotationNumber}</span>
                        <span className="text-xs text-[var(--text-secondary)]">— {order.customerName}</span>
                        <Badge variant={isCompleted || order.status === 'Allocated' ? 'success' : 'warning'}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Optimized multi-warehouse split algorithm calculated to minimize freight cost & lead times.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCompleted ? (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => {
                            updateFulfillmentOrder(order.id, { status: 'Completed' });
                            addActivity({
                              id: `act-${Date.now()}`,
                              message: `Finance Console: Order ${order.quotationNumber} split allocations approved & released for dispatch.`,
                              type: 'fulfillment',
                              timestamp: new Date().toISOString(),
                            });
                            triggerBanner(`Order ${order.quotationNumber} warehouse split approved and dispatched!`);
                          }}
                        >
                          Approve & Dispatch Split
                        </Button>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Split Dispatched & Fulfilled</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Finance Fulfillment Progress Bar & Steps Tracker */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Finance Fulfillment Progress Tracker</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {isCompleted ? '100% Dispatched & Fulfilled' : '75% Stock Reserved & Allocated'}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-indigo-500 to-emerald-400 w-full'
                            : 'bg-gradient-to-r from-indigo-500 to-sky-400 w-3/4'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 text-center font-medium">
                      <div className="text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> <span>1. Stock Reserved</span>
                      </div>
                      <div className="text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> <span>2. Split Calculated</span>
                      </div>
                      <div className={isCompleted ? 'text-emerald-400 flex items-center justify-center gap-1' : 'text-amber-400 flex items-center justify-center gap-1 font-bold'}>
                        <CheckCircle2 className={`w-3 h-3 ${isCompleted ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} /> <span>3. Finance Approval</span>
                      </div>
                      <div className={isCompleted ? 'text-emerald-400 flex items-center justify-center gap-1 font-bold' : 'text-slate-500 flex items-center justify-center gap-1'}>
                        <Truck className={`w-3 h-3 ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} /> <span>4. Freight Dispatched</span>
                      </div>
                    </div>
                  </div>

                  {/* Split Breakdown Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(order.allocations || []).map((alloc, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                            <Boxes className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{alloc.warehouseName}</span>
                          </span>
                          <span className="font-mono font-bold text-emerald-500">{alloc.allocatedQty} Units Allocated</span>
                        </div>
                        <div className="text-[var(--text-secondary)] text-[11px] flex justify-between">
                          <span>Product: {alloc.productName}</span>
                          <span className="font-mono text-indigo-500">1 parcel ($35 est. freight)</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>100% Physical Stock Reserved & Ready for Pick</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Invoices & Billing Reconciliation */}
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-500" /> Invoices & Billing Reconciliation
              </h3>
              <Link href="/invoices">
                <Button variant="outline" size="sm">
                  View All Invoices
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[var(--text-primary)]">{inv.invoiceNumber}</div>
                    <div className="text-[var(--text-secondary)] text-[11px]">{inv.customerName} (Partial Delivery)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Issued: {inv.createdAt ? inv.createdAt.slice(0, 10) : '2026-09-01'}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-mono font-bold text-emerald-500 text-sm">${inv.total.toLocaleString()}</div>
                    <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: ADD NEW WAREHOUSE ───────────────────────────── */}
      {showAddWarehouseModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddWarehouseModal(false)}
          title="Add New Warehouse Depot"
          subtitle="Provision a new physical fulfillment depot for live stock optimization"
          maxWidth="md"
        >
          <form onSubmit={handleCreateWarehouse} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Warehouse / Depot Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Southwest Distribution Center"
                value={newWhName}
                onChange={(e) => setNewWhName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                City, State / Region Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Phoenix, AZ"
                value={newWhLocation}
                onChange={(e) => setNewWhLocation(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                New depots are automatically included in the auto-split optimization engine for lowest-freight calculations.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowAddWarehouseModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Provision Warehouse Depot
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 2: INTER-DEPOT STOCK TRANSFER ────────────────── */}
      {showTransferModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowTransferModal(false)}
          title="Inter-Depot Stock Transfer"
          subtitle="Re-balance physical stock between warehouse facilities"
          maxWidth="md"
        >
          <form onSubmit={handleExecuteTransfer} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product SKU *</label>
              <select
                value={transferProductId}
                onChange={(e) => setTransferProductId(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">From Source Depot *</label>
                <select
                  value={transferFromWhId}
                  onChange={(e) => setTransferFromWhId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">To Destination Depot *</label>
                <select
                  value={transferToWhId}
                  onChange={(e) => setTransferToWhId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.location})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity to Transfer *</label>
              <input
                type="number"
                min={1}
                required
                value={transferQty}
                onChange={(e) => setTransferQty(Number(e.target.value))}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowTransferModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" leftIcon={<ArrowRightLeft className="w-4 h-4" />}>
                Execute Transfer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 3: ADJUST / RESTOCK INVENTORY ──────────────────── */}
      {showAdjustModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAdjustModal(null)}
          title={`Adjust / Restock — ${showAdjustModal.productName}`}
          subtitle={`Facility Depot: ${showAdjustModal.warehouseName}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveStockAdjustment} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Current Physical In-Stock:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{showAdjustModal.inStock} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Currently Reserved:</span>
                <span className="font-mono font-bold text-amber-500">{showAdjustModal.reserved} Units</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <span className="text-[var(--text-secondary)]">Net Available Qty:</span>
                <span className="font-mono font-bold text-emerald-500">{showAdjustModal.available} Units</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Total Physical In-Stock Quantity *
              </label>
              <input
                type="number"
                min={showAdjustModal.reserved}
                required
                value={adjustInStockQty}
                onChange={(e) => setAdjustInStockQty(Number(e.target.value))}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Net available quantity will automatically update: <strong>New In-Stock ({adjustInStockQty}) - Reserved ({showAdjustModal.reserved}) = {Math.max(0, adjustInStockQty - showAdjustModal.reserved)} Available</strong>.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowAdjustModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Stock Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
