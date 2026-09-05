'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/data/store';
import styles from './CustomerSidebar.module.css';
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Truck,
  Receipt,
  RefreshCw,
  Bell,
  User,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { label: 'Quotations', href: '/portal/quotations', icon: FileText },
  { label: 'Orders', href: '/portal/orders', icon: ShoppingBag },
  { label: 'Fulfillment', href: '/portal/fulfillment', icon: Truck },
  { label: 'Invoices', href: '/portal/invoices', icon: Receipt },
  { label: 'Subscriptions', href: '/portal/subscriptions', icon: RefreshCw },
  { label: 'Notifications', href: '/portal/notifications', icon: Bell },
  { label: 'Profile', href: '/portal/profile', icon: User },
];

export function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>DF</div>
        <div>
          <h1 className={styles.brandTitle}>DealFlow360</h1>
          <span className={styles.brandSubtitle}>Customer Portal</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navSectionLabel}>Customer Menu</div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/portal'
              ? pathname === '/portal'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Icon className={styles.navIcon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button onClick={handleLogout} className={styles.logoutButton}>
        <LogOut className={styles.navIcon} />
        <span>Secure Logout</span>
      </button>
    </aside>
  );
}
