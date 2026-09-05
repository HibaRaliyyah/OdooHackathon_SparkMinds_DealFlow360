'use client';

import React from 'react';
import styles from './OrderTimeline.module.css';
import { Check } from 'lucide-react';

interface OrderTimelineProps {
  currentStageIndex: number; // 0 to 4
}

const STEPS = [
  'Order Confirmed',
  'Warehouse Assigned',
  'Preparing Shipment',
  'Shipped',
  'Delivered',
];

export function OrderTimeline({ currentStageIndex }: OrderTimelineProps) {
  const progressPercent = (currentStageIndex / (STEPS.length - 1)) * 100;

  return (
    <div className={styles.timeline}>
      <div className={styles.line}>
        <div className={styles.progressLine} style={{ width: `${progressPercent}%` }} />
      </div>

      {STEPS.map((stepLabel, idx) => {
        const isCompleted = idx < currentStageIndex;
        const isActive = idx === currentStageIndex;

        return (
          <div key={stepLabel} className={styles.step}>
            <div
              className={`${styles.node} ${
                isCompleted
                  ? styles.nodeCompleted
                  : isActive
                  ? styles.nodeActive
                  : ''
              }`}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
            </div>
            <span
              className={`${styles.label} ${
                isCompleted || isActive ? styles.labelActive : ''
              }`}
            >
              {stepLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
