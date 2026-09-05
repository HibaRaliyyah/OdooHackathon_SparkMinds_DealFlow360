'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { OrderTimeline } from '@/components/customer/OrderTimeline';
import { BackButton } from '@/components/ui/BackButton';
import { ShoppingBag, Truck, Package, Calendar } from 'lucide-react';

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const { fulfillmentOrders } = useStore();

  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const order = fulfillmentOrders.find((fo) => fo.id === orderId || fo.quotationNumber === orderId) || fulfillmentOrders[0];

  const currentStageIndex =
    order?.status === 'Completed' || (order?.status as string) === 'Fulfilled'
      ? 4
      : order?.status === 'Partially Shipped' || (order?.status as string) === 'Partially Fulfilled'
      ? 2
      : 1;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BackButton href="/portal/orders" label="All Orders" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {order?.status || 'Processing'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Order #{order?.id || 'ORD-1024'}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Quotation Reference: <span className="font-mono text-indigo-300">{order?.quotationNumber || 'Q-1042'}</span> · Customer: {order?.customerName || 'Acme Corp'}
          </p>
        </div>

        <Link
          href="/portal/fulfillment"
          className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 transition-colors"
        >
          <Truck className="w-4 h-4" /> View Warehouse Split
        </Link>
      </div>

      {/* 5-Step Order Timeline */}
      <div className="card p-6 bg-[var(--bg-card)] space-y-4">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider text-slate-400">
          Shipment Progress Timeline
        </h3>
        <OrderTimeline currentStageIndex={currentStageIndex} />
      </div>

      {/* Order Item Details */}
      <div className="card p-6 bg-[var(--bg-card)] space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-400" /> Order Items Summary
        </h3>

        <div className="space-y-3">
          {((order as any)?.allocations || (order as any)?.items || [
            { productName: 'Laptop Pro 14', requiredQty: 2, fulfilledQty: 2, status: 'Fulfilled' },
            { productName: 'Onsite Setup Service', requiredQty: 1, fulfilledQty: 1, status: 'Fulfilled' },
          ]).map((item: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white text-sm">{item.productName}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Required: {item.requiredQty} units</div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-emerald-400 block">{item.fulfilledQty} / {item.requiredQty} Fulfilled</span>
                <span className="text-[10px] uppercase font-extrabold text-slate-400">{item.status || 'Fulfilled'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
