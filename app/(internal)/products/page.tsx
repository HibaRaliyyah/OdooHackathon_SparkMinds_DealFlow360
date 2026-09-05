'use client';

import React from 'react';
import { useStore } from '@/lib/data/store';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Package } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function ProductsPage() {
  const { products, productCategories } = useStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <BackButton href="/dashboard" label="Dashboard" />
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Product Catalog & Pricelists</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Catalog products, SKUs, category discount ceilings, and list price definitions
          </p>
        </div>
      </div>

      <div className="card p-6 bg-[var(--bg-card)]">
        <Table
          data={products}
          keyExtractor={(p) => p.id}
          columns={[
            {
              header: 'Product Name',
              cell: (p) => (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo-light)]">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--text-primary)]">{p.name}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">{p.description}</div>
                  </div>
                </div>
              ),
            },
            {
              header: 'SKU',
              cell: (p) => <span className="font-mono text-xs font-bold text-[var(--text-secondary)]">{p.sku}</span>,
            },
            {
              header: 'Category',
              cell: (p) => {
                const cat = productCategories.find((c) => c.id === p.categoryId);
                return (
                  <div>
                    <span className="font-semibold text-xs text-[var(--text-primary)]">{cat?.name || 'Category'}</span>
                    <div className="text-[10px] text-amber-400 font-medium">Ceiling: {cat?.discountCeiling}%</div>
                  </div>
                );
              },
            },
            {
              header: 'Base Price',
              cell: (p) => (
                <span className="font-mono text-xs font-bold text-emerald-400">
                  ${p.basePrice.toLocaleString()}
                </span>
              ),
            },
            {
              header: 'Status',
              cell: (p) => <Badge variant={p.status === 'Active' ? 'success' : 'neutral'}>{p.status}</Badge>,
            },
          ]}
        />
      </div>
    </div>
  );
}
