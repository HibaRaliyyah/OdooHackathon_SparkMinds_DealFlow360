'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, Eye, Truck, CheckCircle2 } from 'lucide-react';

export default function CustomerOrdersPage() {
  const { fulfillmentOrders } = useStore();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
            Order Fulfillment Tracking
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Confirmed Orders</h1>
        <p className="text-xs text-slate-600 mt-1">
          Track order progress, fulfillment stages, and shipment timelines.
        </p>
      </div>

      {/* Orders Table */}
      <div className="card p-6 bg-white border border-slate-200 shadow-sm text-slate-900 space-y-4">
        <Table
          data={fulfillmentOrders}
          keyExtractor={(fo) => fo.id}
          emptyMessage="No confirmed orders found for your account."
          columns={[
            {
              header: 'Order Number',
              cell: (fo) => <span className="font-mono font-bold text-emerald-700">{fo.id}</span>,
            },
            {
              header: 'Quotation Ref',
              cell: (fo) => <span className="font-mono text-indigo-700 font-bold text-xs">{fo.quotationNumber}</span>,
            },
            {
              header: 'Order Date',
              cell: (fo) => <span className="text-slate-700 text-xs font-medium">{new Date(fo.createdAt).toLocaleDateString()}</span>,
            },
            {
              header: 'Fulfillment Status',
              cell: (fo) => (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${
                    fo.status === 'Completed' || (fo.status as string) === 'Fulfilled'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : fo.status === 'Partially Shipped' || (fo.status as string) === 'Partially Fulfilled'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  }`}
                >
                  {fo.status}
                </span>
              ),
            },
            {
              header: 'Action',
              cell: (fo) => (
                <Link href={`/portal/orders/${fo.id}`}>
                  <Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                    Track Order
                  </Button>
                </Link>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
