'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import styles from './CustomerHeader.module.css';
import { Bell, Crown, Award, Gem, Medal } from 'lucide-react';

export function CustomerHeader() {
  const { currentUser, customers, notifications } = useStore();

  const customerRecord = customers.find(
    (c) => c.company === currentUser?.company || c.email === currentUser?.email
  );
  const tier = customerRecord?.tier || 'Gold';
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTierInfo = () => {
    switch (tier) {
      case 'Bronze':
        return { icon: Medal, style: { backgroundColor: 'rgba(180, 83, 9, 0.15)', color: '#fcd34d', borderColor: 'rgba(180, 83, 9, 0.3)' } };
      case 'Silver':
        return { icon: Award, style: { backgroundColor: 'rgba(100, 116, 139, 0.15)', color: '#e2e8f0', borderColor: 'rgba(100, 116, 139, 0.3)' } };
      case 'Platinum':
        return { icon: Gem, style: { backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#67e8f9', borderColor: 'rgba(6, 182, 212, 0.3)' } };
      case 'Gold':
      default:
        return { icon: Crown, style: { backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#fde047', borderColor: 'rgba(234, 179, 8, 0.3)' } };
    }
  };

  const tierInfo = getTierInfo();
  const TierIcon = tierInfo.icon;

  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <h2 className={styles.titleText}>DealFlow360 Customer Portal</h2>
        <span className={styles.badge}>Live Account</span>
      </div>

      <div className={styles.rightArea}>
        {/* Tier badge */}
        <div className={styles.tierBadge} style={tierInfo.style}>
          <TierIcon className="w-3.5 h-3.5" />
          <span>{tier} Tier</span>
        </div>

        {/* Customer User Details */}
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {currentUser?.avatarInitials || 'TA'}
          </div>
          <div>
            <div className={styles.userName}>{currentUser?.name || 'Tom Acme'}</div>
            <div className={styles.userCompany}>{currentUser?.company || 'Acme Corp'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
