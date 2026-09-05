'use client';

import React from 'react';
import styles from './CustomerKpiCard.module.css';

interface CustomerKpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  accentColor?: string;
  iconBg?: string;
}

export function CustomerKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = '#ffffff',
  iconBg = 'rgba(99, 102, 241, 0.15)',
}: CustomerKpiCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{title}</span>
        <div className={styles.iconBox} style={{ backgroundColor: iconBg, color: accentColor }}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className={styles.value} style={{ color: accentColor }}>
        {value}
      </div>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}
