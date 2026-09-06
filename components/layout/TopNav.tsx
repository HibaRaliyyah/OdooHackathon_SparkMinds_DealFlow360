'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  RefreshCw,
  Sliders,
  LogOut,
  FileText,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useStore } from '@/lib/data/store';
import { NotificationsPanel } from './NotificationsPanel';
import { BackButton } from '@/components/ui/BackButton';

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [reloadedNotice, setReloadedNotice] = useState(false);
  const { notifications, negotiations, resetDemoData, currentUser, logout } = useStore();

  const unreadNotifsCount = notifications.filter((n) => !n.read && (n.userId === currentUser?.id || n.userId === 'user-salesrep' || n.userId === 'user-2' || n.userId === 'all')).length;

  const unreadCustMsgsCount = (negotiations || []).reduce(
    (acc, neg) => acc + (neg.messages || []).filter((m) => m.senderRole === 'CUSTOMER' && m.read === false).length,
    0
  );

  const negNotifUnreadCount = notifications.filter(
    (n) => !n.read && (n.title.includes('Negotiation') || n.title.includes('Customer'))
  ).length;

  const totalCustNegUnread = unreadCustMsgsCount > 0 ? unreadCustMsgsCount : negNotifUnreadCount;
  const totalUnreadBadge = Math.max(unreadNotifsCount, totalCustNegUnread);

  const handleReloadData = () => {
    resetDemoData();
    setReloadedNotice(true);
    setTimeout(() => setReloadedNotice(false), 2500);
  };

  const handleCloseWorkspace = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-[var(--bg-card)]/90 border-b border-[var(--border-subtle)] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl">
      {/* Left: Global Back Button & Top Workspace Navigation Links (B1) */}
      <div className="flex items-center gap-3">
        {/* Global TopNav Back Button */}
        <BackButton label="Back" />

        {/* Workspace Quick Links */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <Link
            href="/quotations"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              pathname === '/quotations'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Quotations</span>
            {totalCustNegUnread > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-purple-200 text-purple-900 animate-pulse">
                {totalCustNegUnread} New
              </span>
            )}
          </Link>
        </div>

        {/* Global Search */}
        <div className="hidden md:flex items-center relative w-56 lg:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search deals, customers, SKUs..."
            style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      {/* Right: Actions (B1: Reload Data, Go to Back-end, Close Workspace) */}
      <div className="flex items-center gap-2.5">
        {reloadedNotice && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" /> Data Refreshed!
          </span>
        )}

        {/* Action 1: Reload Data */}
        <button
          onClick={handleReloadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 font-semibold transition-all cursor-pointer shadow-sm"
          title="Refreshes pricing, stock, and approval data from backend"
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
          <span className="hidden sm:inline">Reload Data</span>
        </button>

        {/* Action 2: Go to Back-end */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-xs text-purple-700 font-semibold transition-all shadow-sm"
          title="Opens configuration and backend settings screen"
        >
          <Sliders className="w-3.5 h-3.5 text-purple-600" />
          <span className="hidden sm:inline">Go to Back-end</span>
        </Link>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer relative shadow-sm"
          >
            <Bell className="w-3.5 h-3.5" />
            {totalUnreadBadge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center border border-white shadow-md animate-pulse">
                {totalUnreadBadge}
              </span>
            )}
          </button>
          {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
        </div>

        {/* Action 3: Close Workspace */}
        <button
          onClick={handleCloseWorkspace}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs text-rose-700 font-semibold transition-all cursor-pointer shadow-sm"
          title="Ends the current working session view"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Close Workspace</span>
        </button>
      </div>
    </header>
  );
}
