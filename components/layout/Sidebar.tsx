'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Package,
  Users,
  Boxes,
  RefreshCw,
  Receipt,
  ShieldAlert,
  BarChart3,
  Settings,
  Sparkles,
  LogOut,
  Building,
  Warehouse,
} from 'lucide-react';
import { useStore } from '@/lib/data/store';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Quotations', href: '/quotations', icon: FileText },
  { label: 'Approvals', href: '/approvals', icon: CheckSquare, badgeKey: 'approvalRequests' },
  { label: 'Fulfillment', href: '/fulfillment', icon: Boxes },
  { label: 'Warehouses', href: '/warehouses', icon: Warehouse },
  { label: 'Subscriptions', href: '/subscriptions', icon: RefreshCw },
  { label: 'Invoices', href: '/invoices', icon: Receipt },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Deal Health', href: '/deal-health', icon: ShieldAlert, badgeKey: 'dealHealthFlags' },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Admin Settings', href: '/admin', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, approvalRequests, dealHealthFlags } = useStore();

  const pendingApprovals = approvalRequests.filter((r) => r.status === 'Pending').length;
  const criticalFlags = dealHealthFlags.filter((f) => f.severity === 'HIGH').length;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-[var(--bg-card)] border-r border-[var(--border-subtle)] flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Logo */}
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--accent-indigo)] via-[var(--accent-purple)] to-[var(--accent-cyan)] flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
            360
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-[var(--text-primary)] flex items-center gap-1.5">
              DealFlow<span className="text-[var(--accent-purple-light)]">360</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)]">Enterprise B2B Ops</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            let badgeCount = 0;
            if (item.badgeKey === 'approvalRequests') badgeCount = pendingApprovals;
            if (item.badgeKey === 'dealHealthFlags') badgeCount = criticalFlags;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--accent-indigo)]/15 to-[var(--accent-purple)]/15 text-[var(--accent-purple-light)] border border-[var(--accent-indigo)]/30 font-semibold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent-purple-light)]' : 'text-[var(--text-tertiary)]'}`} />
                  <span>{item.label}</span>
                </div>
                {badgeCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}

          {(currentUser?.role === 'CUSTOMER' || currentUser?.role === 'SALES_REP') && (
            <div className="pt-3 mt-3 border-t border-[var(--border-subtle)]">
              <Link
                href="/portal/quotation"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-400" />
                  <span>Customer Portal</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-300">Acme Corp</span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card-hover)]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {currentUser?.avatarInitials || currentUser?.name?.slice(0, 2).toUpperCase() || 'AA'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{currentUser?.name || 'Alex Admin'}</p>
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">{currentUser?.role || 'ADMIN'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
