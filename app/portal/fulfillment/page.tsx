'use client';

import React from 'react';
import { WarehouseFulfillmentCard } from '@/components/customer/WarehouseFulfillmentCard';
import { Truck, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function CustomerFulfillmentPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Logistics & Multi-Warehouse Split
          </span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Fulfillment & Backorder Status</h1>
        <p className="text-xs text-slate-400 mt-1">
          View real-time warehouse fulfillment allocation and backorder replenishment status.
        </p>
      </div>

      {/* Info Notice for Customer Restrictions */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0" />
        <span>
          Fulfillment splits and warehouse routing are automatically managed by DealFlow360 Operations. Status updates refresh in real time as shipments leave warehouses.
        </span>
      </div>

      {/* Warehouse Cards */}
      <div className="space-y-5">
        <WarehouseFulfillmentCard
          productName="Laptop Pro 14"
          sku="LAP-PRO-14"
          totalRequired={50}
          totalFulfilled={50}
          backorderQuantity={0}
          splits={[
            { warehouseName: 'Main Warehouse (Chicago)', fulfilledQuantity: 35 },
            { warehouseName: 'East Depot (Newark)', fulfilledQuantity: 15 },
          ]}
        />

        <WarehouseFulfillmentCard
          productName="Onsite Setup Service"
          sku="SVC-SETUP-ONS"
          totalRequired={10}
          totalFulfilled={10}
          backorderQuantity={0}
          splits={[
            { warehouseName: 'Main Warehouse (Chicago)', fulfilledQuantity: 10 },
          ]}
        />

        <WarehouseFulfillmentCard
          productName="Wireless Mouse"
          sku="HW-MOUSE-WL"
          totalRequired={100}
          totalFulfilled={80}
          backorderQuantity={20}
          splits={[
            { warehouseName: 'Main Warehouse (Chicago)', fulfilledQuantity: 50 },
            { warehouseName: 'West Hub (Los Angeles)', fulfilledQuantity: 30 },
          ]}
        />
      </div>
    </div>
  );
}
