'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BackButton } from '@/components/ui/BackButton';
import {
  Warehouse as WarehouseIcon,
  Boxes,
  Plus,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  MapPin,
  Activity,
  Sliders,
  RotateCcw,
  Lock,
  Building,
  Sparkles,
} from 'lucide-react';
import type { Warehouse, InventoryItem } from '@/lib/types';
import { canManageFulfillment } from '@/lib/services/permissionService';

export default function WarehousesPage() {
  const {
    warehouses,
    inventory,
    products,
    addWarehouse,
    updateWarehouse,
    addInventoryItem,
    updateInventory,
    addActivity,
    addNotification,
    currentUser,
  } = useStore();

  const authCheck = canManageFulfillment(currentUser?.role);

  // Filter States
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockHealthFilter, setStockHealthFilter] = useState<'ALL' | 'LOW' | 'OPTIMAL'>('ALL');

  // Notification Banner
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Modals
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState<InventoryItem | null>(null);

  // New Warehouse Form State
  const [newWhName, setNewWhName] = useState('');
  const [newWhLocation, setNewWhLocation] = useState('');

  // Transfer Form State
  const [transferProductId, setTransferProductId] = useState(products[0]?.id || '');
  const [transferFromWhId, setTransferFromWhId] = useState(warehouses[0]?.id || '');
  const [transferToWhId, setTransferToWhId] = useState(warehouses[1]?.id || warehouses[0]?.id || '');
  const [transferQty, setTransferQty] = useState(5);

  // Adjust Stock Form State
  const [adjustInStockQty, setAdjustInStockQty] = useState<number>(0);

  const triggerBanner = (text: string, type: 'success' | 'info' = 'success') => {
    setBannerMsg({ text, type });
    setTimeout(() => setBannerMsg(null), 6000);
  };

  // KPI Calculations
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

  // ─── 1. ADD WAREHOUSE ──────────────────────────────────────────
  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName.trim() || !newWhLocation.trim()) return;

    const newWh: Warehouse = {
      id: `wh-${Date.now()}`,
      name: newWhName.trim(),
      location: newWhLocation.trim(),
    };

    addWarehouse(newWh);

    // Create initial zero inventory records for existing products
    products.forEach((p) => {
      const newInv: InventoryItem = {
        id: `inv-${Date.now()}-${p.id}`,
        warehouseId: newWh.id,
        warehouseName: newWh.name,
        productId: p.id,
        productName: p.name,
        inStock: 25,
        reserved: 0,
        available: 25,
      };
      addInventoryItem(newInv);
    });

    addActivity({
      id: `act-${Date.now()}`,
      message: `New Depot "${newWh.name}" added at ${newWh.location}. Initialized stock allocations.`,
      type: 'fulfillment',
      timestamp: new Date().toISOString(),
    });

    triggerBanner(`Warehouse "${newWh.name}" successfully provisioned and added to auto-split pool!`);
    setShowAddWarehouseModal(false);
    setNewWhName('');
    setNewWhLocation('');
  };

  // ─── 2. TRANSFER INVENTORY ─────────────────────────────────────
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

    // Update Source
    const newSourceInStock = Math.max(0, sourceItem.inStock - transferQty);
    const newSourceAvailable = Math.max(0, sourceItem.available - transferQty);
    updateInventory(sourceItem.id, {
      inStock: newSourceInStock,
      available: newSourceAvailable,
    });

    // Update or Create Target
    if (targetItem) {
      updateInventory(targetItem.id, {
        inStock: targetItem.inStock + transferQty,
        available: targetItem.available + transferQty,
      });
    } else if (toWh && prod) {
      const newTargetInv: InventoryItem = {
        id: `inv-${Date.now()}`,
        warehouseId: toWh.id,
        warehouseName: toWh.name,
        productId: prod.id,
        productName: prod.name,
        inStock: transferQty,
        reserved: 0,
        available: transferQty,
      };
      addInventoryItem(newTargetInv);
    }

    addActivity({
      id: `act-${Date.now()}`,
      message: `Stock Transfer: Moved ${transferQty} units of ${prod?.name} from ${fromWh?.name} to ${toWh?.name}.`,
      type: 'fulfillment',
      timestamp: new Date().toISOString(),
    });

    triggerBanner(
      `Inter-Depot Stock Transfer Complete! Moved ${transferQty} units of ${prod?.name} to ${toWh?.name}.`
    );
    setShowTransferModal(false);
  };

  // ─── 3. ADJUST / RESTOCK INVENTORY ─────────────────────────────
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
      message: `Inventory Restock: ${showAdjustModal.productName} at ${showAdjustModal.warehouseName} updated to ${newInStock} units (Available: ${newAvailable}).`,
      type: 'fulfillment',
      timestamp: new Date().toISOString(),
    });

    triggerBanner(
      `Stock updated for ${showAdjustModal.productName} at ${showAdjustModal.warehouseName}.`
    );
    setShowAdjustModal(null);
  };

  if (!authCheck.allowed) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl mx-auto py-12">
        <BackButton href="/dashboard" label="Dashboard" />

        <div className="card p-8 bg-[var(--bg-card)] border border-amber-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Access Restricted — Warehouse & Inventory</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Physical depot management, stock level matrix, and inter-depot transfers are restricted exclusively to <strong>Finance / Operations</strong> and <strong>Admin</strong> logins.
            </p>
            <p className="text-xs text-amber-400 font-semibold mt-1">
              Active Logged-in Role: {currentUser?.role || 'Sales Rep'}
            </p>
          </div>

          <div className="pt-3 flex justify-center">
            <Link href="/dashboard">
              <Button variant="primary" size="md">
                Return to Dashboard Console
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BackButton href="/dashboard" label="Dashboard" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                B6 Warehouses & Live Inventory
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
            Depot Management & Stock Allocation Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage physical warehouses, monitor real-time stock levels, re-balance inventory, and configure auto-split priority routing.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {authCheck.allowed ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTransferModal(true)}
                leftIcon={<ArrowRightLeft className="w-4 h-4" />}
              >
                Transfer Inventory
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddWarehouseModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add New Depot
              </Button>
            </>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Read-Only Tracking (Restricted to Finance / Operations)</span>
            </div>
          )}
        </div>
      </div>

      {/* Global Notification Banner */}
      {bannerMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{bannerMsg.text}</span>
          </div>
          <button
            onClick={() => setBannerMsg(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-1 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Warehouses */}
        <div className="card p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Depots</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <WarehouseIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-white tracking-tight">{warehouses.length} Facilities</div>
            <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Sync Active</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Primary Hub: Chicago</span>
            <span className="text-indigo-400 font-bold">Auto-Split On</span>
          </div>
        </div>

        {/* KPI 2: Total In Stock */}
        <div className="card p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Physical Stock</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">{totalInStock} Units</div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              Available: <strong className="text-emerald-300 font-bold">{totalAvailable}</strong> | Reserved: <strong className="text-amber-300 font-bold">{totalReserved}</strong>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Allocated to Orders</span>
            <span className="text-emerald-400 font-bold">{totalReserved} Reserved</span>
          </div>
        </div>

        {/* KPI 3: Available for Fulfillment */}
        <div className="card p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-cyan-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Available Units</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-cyan-300 tracking-tight">{totalAvailable} Ready</div>
            <div className="text-xs text-cyan-300 font-semibold mt-1">Ready for immediate dispatch</div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Quote Allocation Ready</span>
            <span className="text-cyan-400 font-bold">100% Unbound</span>
          </div>
        </div>

        {/* KPI 4: Stock Alerts */}
        <div className="card p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-rose-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reorder / Safety Alerts</span>
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-rose-400 tracking-tight">{lowStockItemsCount} SKUs Low</div>
            <div className="text-xs text-rose-300 font-semibold mt-1">Below safety reorder threshold</div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Replenishment Priority</span>
            <span className="text-rose-400 font-bold">Action Needed</span>
          </div>
        </div>
      </div>

      {/* Warehouse Facilities Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-400" /> Physical Depots & Auto-Split Routing Weighting
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {warehouses.map((wh) => {
            const whItems = inventory.filter((i) => i.warehouseId === wh.id);
            const whInStock = whItems.reduce((a, b) => a + (b.inStock || 0), 0);
            const whReserved = whItems.reduce((a, b) => a + (b.reserved || 0), 0);
            const whAvailable = whItems.reduce((a, b) => a + (b.available || 0), 0);

            return (
              <div
                key={wh.id}
                className={`card p-5 bg-[var(--bg-card)] border transition-all space-y-4 shadow-lg ${
                  selectedWarehouseFilter === wh.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                      <WarehouseIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">{wh.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" /> {wh.location}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                    Priority Hub
                  </span>
                </div>

                {/* Stock Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">In Stock</span>
                    <span className="font-mono text-sm font-extrabold text-white">{whInStock}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Reserved</span>
                    <span className="font-mono text-sm font-extrabold text-amber-400">{whReserved}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Available</span>
                    <span className="font-mono text-sm font-extrabold text-emerald-400">{whAvailable}</span>
                  </div>
                </div>

                {/* Live Sync Badge & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Sync Active</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedWarehouseFilter(selectedWarehouseFilter === wh.id ? 'ALL' : wh.id)
                    }
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
                  >
                    {selectedWarehouseFilter === wh.id ? 'Show All Depots' : 'Filter Items ↓'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Inventory & Stock Allocation Table */}
      <div className="card p-6 bg-[var(--bg-card)] border border-slate-800 space-y-4">
        {/* Table Filters & Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" /> Live Inventory & Stock Allocation Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect physical stock counts, reserved orders, and available quantities across facilities.
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
                className="text-xs bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Warehouse Filter */}
            <select
              value={selectedWarehouseFilter}
              onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Facilities</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            {/* Health Filter */}
            <select
              value={stockHealthFilter}
              onChange={(e) => setStockHealthFilter(e.target.value as any)}
              className="text-xs bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
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
                  <span className="font-bold text-white text-xs">{item.productName}</span>
                  <div className="text-[10px] text-slate-500 font-mono">ID: {item.productId}</div>
                </div>
              ),
            },
            {
              header: 'Source Facility / Depot',
              cell: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  <span>{item.warehouseName}</span>
                </div>
              ),
            },
            {
              header: 'Total Physical Stock',
              cell: (item) => (
                <span className="font-mono font-bold text-white text-xs">{item.inStock} Units</span>
              ),
            },
            {
              header: 'Reserved for Orders',
              cell: (item) => (
                <span className="font-mono font-bold text-amber-400 text-xs">
                  {item.reserved} Reserved
                </span>
              ),
            },
            {
              header: 'Net Available Qty',
              cell: (item) => (
                <span className="font-mono font-black text-emerald-400 text-sm">
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
                authCheck.allowed ? (
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
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">View Only</span>
                )
              ),
            },
          ]}
        />
      </div>

      {/* ─── MODAL 1: ADD NEW WAREHOUSE ───────────────────────────── */}
      {showAddWarehouseModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddWarehouseModal(false)}
          title="Add New Warehouse Depot"
          subtitle="Provision a new physical fulfillment facility for live stock split optimization"
          maxWidth="md"
        >
          <form onSubmit={handleCreateWarehouse} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Warehouse / Depot Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Southwest Distribution Center"
                value={newWhName}
                onChange={(e) => setNewWhName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                City, State / Region Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Phoenix, AZ"
                value={newWhLocation}
                onChange={(e) => setNewWhLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                New depots are automatically included in the auto-split optimization engine for lowest-freight calculations.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
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
              <label className="block text-xs font-bold text-slate-300 mb-1">Product SKU *</label>
              <select
                value={transferProductId}
                onChange={(e) => setTransferProductId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                <label className="block text-xs font-bold text-slate-300 mb-1">From Source Depot *</label>
                <select
                  value={transferFromWhId}
                  onChange={(e) => setTransferFromWhId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">To Destination Depot *</label>
                <select
                  value={transferToWhId}
                  onChange={(e) => setTransferToWhId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
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
              <label className="block text-xs font-bold text-slate-300 mb-1">Quantity to Transfer *</label>
              <input
                type="number"
                min={1}
                required
                value={transferQty}
                onChange={(e) => setTransferQty(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
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
          subtitle={`Facility: ${showAdjustModal.warehouseName}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveStockAdjustment} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Physical In-Stock:</span>
                <span className="font-mono font-bold text-white">{showAdjustModal.inStock} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Currently Reserved:</span>
                <span className="font-mono font-bold text-amber-400">{showAdjustModal.reserved} Units</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1.5">
                <span className="text-slate-400">Net Available Qty:</span>
                <span className="font-mono font-bold text-emerald-400">{showAdjustModal.available} Units</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                New Total Physical In-Stock Quantity *
              </label>
              <input
                type="number"
                min={showAdjustModal.reserved}
                required
                value={adjustInStockQty}
                onChange={(e) => setAdjustInStockQty(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Available quantity will automatically re-calculate as <strong>New In-Stock ({adjustInStockQty}) - Reserved ({showAdjustModal.reserved}) = {Math.max(0, adjustInStockQty - showAdjustModal.reserved)}</strong>.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
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
