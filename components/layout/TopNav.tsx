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
  const { notifications, resetDemoData, currentUser, logout } = useStore();

  const unreadCount = notifications.filter((n) => !n.read && (n.userId === currentUser?.id || n.userId === 'all')).length;

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
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <Link
            href="/quotations"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              pathname === '/quotations'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Quotations</span>
          </Link>
        </div>

        {/* Global Search */}
        <div className="hidden md:flex items-center relative w-56 lg:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search deals, customers, SKUs..."
            className="w-full bg-[#111827]/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions (B1: Reload Data, Go to Back-end, Close Workspace) */}
      <div className="flex items-center gap-2.5">
        {reloadedNotice && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" /> Data Refreshed!
          </span>
        )}

        {/* Action 1: Reload Data */}
        <button
          onClick={handleReloadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-700/80 text-xs text-slate-300 hover:text-white font-medium transition-all cursor-pointer shadow-sm"
          title="Refreshes pricing, stock, and approval data from backend"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Reload Data</span>
        </button>

        {/* Action 2: Go to Back-end */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-600/15 hover:bg-indigo-600/30 text-xs text-indigo-300 hover:text-white font-medium transition-all shadow-sm"
          title="Opens configuration and backend settings screen"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Go to Back-end</span>
        </Link>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-400 hover:text-white transition-all cursor-pointer relative"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
        </div>

        {/* Action 3: Close Workspace */}
        <button
          onClick={handleCloseWorkspace}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs text-rose-300 font-medium transition-all cursor-pointer shadow-sm"
          title="Ends the current working session view"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Close Workspace</span>
        </button>
      </div>
    </header>
  );
}
