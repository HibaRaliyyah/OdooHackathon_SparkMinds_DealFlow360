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
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BackButton href="/portal/orders" label="All Orders" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
              {order?.status || 'Processing'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order #{order?.id || 'ORD-1024'}</h1>
          <p className="text-xs text-slate-600 mt-1">
            Quotation Reference: <span className="font-mono text-indigo-700 font-extrabold">{order?.quotationNumber || 'Q-1042'}</span> · Customer: <strong className="text-slate-800">{order?.customerName || 'Acme Corp'}</strong>
          </p>
        </div>

        <Link
          href="/portal/fulfillment"
          className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Truck className="w-4 h-4" /> View Warehouse Split
        </Link>
      </div>

      {/* 5-Step Order Timeline */}
      <div className="card p-6 bg-white border border-slate-200 shadow-sm text-slate-900 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          Shipment Progress Timeline
        </h3>
        <OrderTimeline currentStageIndex={currentStageIndex} />
      </div>

      {/* Order Item Details */}
      <div className="card p-6 bg-white border border-slate-200 shadow-sm text-slate-900 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-600" /> Order Items Summary
        </h3>

        <div className="space-y-3">
          {((order as any)?.allocations || (order as any)?.items || [
            { productName: 'Laptop Pro 14', requiredQty: 2, fulfilledQty: 2, status: 'Fulfilled' },
            { productName: 'Onsite Setup Service', requiredQty: 1, fulfilledQty: 1, status: 'Fulfilled' },
          ]).map((item: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-900 shadow-sm">
              <div>
                <div className="font-bold text-slate-900 text-sm">{item.productName}</div>
                <div className="text-slate-600 text-[11px] mt-0.5 font-medium">Required: {item.requiredQty} units</div>
              </div>

              <div className="text-right">
                <span className="font-mono font-extrabold text-emerald-700 block text-xs">{item.fulfilledQty} / {item.requiredQty} Fulfilled</span>
                <span className="text-[10px] uppercase font-extrabold text-slate-700">{item.status || 'Fulfilled'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
