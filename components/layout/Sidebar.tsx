'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/data/store';
import styles from './Sidebar.module.css';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Radar,
  AlertTriangle,
  FileText,
  Sliders,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Warehouse as WarehouseIcon,
  Truck,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, approvalRequests, dealHealthFlags } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  const isAccountsAllowed = currentUser?.role === 'ADMIN' || currentUser?.role === 'SALES_MANAGER';
  const isWarehouseAllowed = currentUser?.role === 'ADMIN' || currentUser?.role === 'FINANCE';
  const isFulfillmentAllowed = currentUser?.role === 'ADMIN' || currentUser?.role === 'FINANCE' || currentUser?.role === 'SALES_MANAGER';
  const isAdmin = currentUser?.role === 'ADMIN';

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Deals', href: '/quotations', icon: Briefcase },
    ...(isAccountsAllowed ? [{ label: 'Accounts', href: '/customers', icon: Users }] : []),
    ...(isWarehouseAllowed ? [{ label: 'Warehouse & Inventory', href: '/warehouses', icon: WarehouseIcon }] : []),
    ...(isFulfillmentAllowed ? [{ label: 'Fulfillment & Splits', href: '/fulfillment', icon: Truck }] : []),
    { label: 'Anomaly Radar', href: '/deal-health', icon: Radar },
    { label: 'Escalations', href: '/approvals', icon: AlertTriangle },
    { label: 'Reports', href: '/reports', icon: FileText },
    ...(isAdmin ? [{ label: 'Integrations', href: '/admin', icon: Sliders }] : []),
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <div>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          {!collapsed && (
            <div className={styles.brandLogo}>
              <div className={styles.logoBadge}>DF</div>
              <span className={styles.brandName}>DealFlow360</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={styles.toggleBtn}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className={styles.navGroup}>
          {!collapsed && <div className={styles.navSectionTitle}>Navigation</div>}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={styles.navIcon} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      {!collapsed && (
        <div className={styles.footerSection}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{currentUser?.name || 'Alex Admin'}</span>
              <span className={styles.userRole}>{currentUser?.role || 'ADMIN'}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
