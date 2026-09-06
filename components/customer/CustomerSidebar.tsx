'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/data/store';
import styles from './CustomerSidebar.module.css';
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  ShoppingBag,
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
  { label: 'Official Proposal', href: '/portal/quotation', icon: FileCheck },
  { label: 'Quotations', href: '/portal/quotations', icon: FileText },
  { label: 'Orders', href: '/portal/orders', icon: ShoppingBag },
  { label: 'Invoices', href: '/portal/invoices', icon: Receipt },
  { label: 'Subscriptions', href: '/portal/subscriptions', icon: RefreshCw },
  { label: 'Notifications', href: '/portal/notifications', icon: Bell },
  { label: 'Profile', href: '/portal/profile', icon: User },
];

export function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, notifications, negotiations, quotations, currentUser } = useStore();

  const unreadNotifsCount = notifications.filter(
    (n) => !n.read && (n.userId === 'user-customer' || n.userId === 'all')
  ).length;

  const activeQuotation = quotations.find((q) =>
    q.customerName.toLowerCase().includes(currentUser?.company?.toLowerCase() || '')
  );
  const activeNeg = negotiations.find(
    (n) => n.quotationId === activeQuotation?.id || n.quotationNumber === activeQuotation?.quoteNumber
  );

  // Count unread sales rep messages for customer's active quotation
  const repMsgUnreadCount = (activeNeg?.messages || []).filter(
    (m) => (m.senderRole === 'SALES_REP' || m.senderRole === 'SALES_MANAGER') && m.read === false
  ).length;

  const totalNegUnread = repMsgUnreadCount;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src="/logo.png" alt="DealFlow360 Logo" className="w-9 h-9 rounded-full object-contain shadow-md" />
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
              : item.href === '/portal/quotation'
              ? pathname === '/portal/quotation'
              : pathname.startsWith(item.href);

          const isProposalItem = item.href === '/portal/quotation';
          const isNotifItem = item.href === '/portal/notifications';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Icon className={styles.navIcon} />
              <span>{item.label}</span>
              {isProposalItem && totalNegUnread > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-cyan-500 text-slate-950 shadow border border-cyan-300 animate-pulse">
                  {totalNegUnread} New
                </span>
              )}
              {isNotifItem && unreadNotifsCount > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-500 text-white shadow border border-rose-300 animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
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
