'use client';

import React from 'react';
import styles from './WarehouseFulfillmentCard.module.css';
import { Truck, AlertTriangle } from 'lucide-react';

interface WarehouseSplit {
  warehouseName: string;
  fulfilledQuantity: number;
}

interface WarehouseFulfillmentCardProps {
  productName: string;
  sku: string;
  totalRequired: number;
  totalFulfilled: number;
  backorderQuantity: number;
  splits: WarehouseSplit[];
}

export function WarehouseFulfillmentCard({
  productName,
  sku,
  totalRequired,
  totalFulfilled,
  backorderQuantity,
  splits,
}: WarehouseFulfillmentCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h4 className={styles.productName}>{productName}</h4>
          <span className={styles.sku}>SKU: {sku}</span>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-slate-300">
            Total Fulfilled: <span className="text-emerald-400 font-mono">{totalFulfilled}</span> / {totalRequired}
          </div>
        </div>
      </div>

      <div className={styles.splitGrid}>
        {splits.map((split) => (
          <div key={split.warehouseName} className={styles.whBox}>
            <span className={styles.whName}>{split.warehouseName}</span>
            <span className={styles.whValue}>+{split.fulfilledQuantity} units</span>
          </div>
        ))}
      </div>

      {backorderQuantity > 0 && (
        <div className={styles.backorderBanner}>
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{backorderQuantity} units currently on backorder (awaiting warehouse replenishment).</span>
        </div>
      )}
    </div>
  );
}
