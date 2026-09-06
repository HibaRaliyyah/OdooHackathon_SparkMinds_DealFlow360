'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/data/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import {
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  Shield,
  Briefcase,
  Award,
  CreditCard,
  Building,
  Check,
  LogOut,
  Settings,
} from 'lucide-react';

export function Header() {
  const { currentUser, users, setCurrentUser, logout, notifications, markNotificationRead } = useStore();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (userObj: any) => {
    setCurrentUser(userObj);
    setDropdownOpen(false);
    if (userObj.role === 'CUSTOMER') {
      router.push('/portal');
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push('/login');
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  const handleNotificationClick = (n: any) => {
    if (!n.read) markNotificationRead(n.id);
    setNotifDropdownOpen(false);
    const titleLower = (n.title || '').toLowerCase();
    if (titleLower.includes('quotation') || titleLower.includes('negotiation')) {
      router.push('/quotations');
    } else if (titleLower.includes('order') || titleLower.includes('fulfillment')) {
      router.push('/orders');
    } else if (titleLower.includes('invoice') || titleLower.includes('payment')) {
      router.push('/invoices');
    }
  };

  // Default notifications list fallback if empty
  const activeNotifs = notifications.length > 0 ? notifications : [
    {
      id: 'notif-demo-1',
      userId: 'user-1',
      title: 'Quotation Terms Confirmed',
      message: 'Acme Corp accepted quotation terms. Order fulfillment initialized.',
      type: 'success' as const,
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-demo-2',
      userId: 'user-1',
      title: 'Negotiation Proposal Received',
      message: 'Counter offer of 18% target discount submitted for review.',
      type: 'info' as const,
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  // Preset role choices for quick selection
  const availableUsers = users.length > 0 ? users : [
    { id: 'user-1', email: 'admin@dealflow360.demo', name: 'Alex Admin', role: 'ADMIN', avatarInitials: 'AA' },
    { id: 'user-2', email: 'sales@dealflow360.demo', name: 'Jasmine Rao', role: 'SALES_REP', avatarInitials: 'JR' },
    { id: 'user-3', email: 'manager@dealflow360.demo', name: 'Mihail Shah', role: 'SALES_MANAGER', avatarInitials: 'MS' },
    { id: 'user-4', email: 'finance@dealflow360.demo', name: 'Riya Iyer', role: 'FINANCE', avatarInitials: 'RI' },
    { id: 'user-5', email: 'customer@dealflow360.demo', name: 'Tom Acme', role: 'CUSTOMER', avatarInitials: 'TA', company: 'Acme Corp' },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return Shield;
      case 'SALES_REP': return Briefcase;
      case 'SALES_MANAGER': return Award;
      case 'FINANCE': return CreditCard;
      case 'CUSTOMER': return Building;
      default: return UserIcon;
    }
  };

  return (
    <header className={styles.header}>
      {/* Search Input */}
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search deals, accounts, quotes, or team reps..."
          className={styles.searchInput}
        />
      </div>

      {/* Action Controls */}
      <div className={styles.actionsGroup}>
        {/* Interactive Notifications Button & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className={styles.iconBtn}
            title="Notifications"
            aria-expanded={notifDropdownOpen}
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && <span className={styles.notifBadge} />}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Dropdown Header */}
              <div className="p-3.5 bg-[var(--bg-card-hover)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-[var(--text-primary)]">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                {activeNotifs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--text-tertiary)]">
                    No new notifications right now.
                  </div>
                ) : (
                  activeNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-[var(--bg-card-hover)] ${
                        !n.read ? 'bg-sky-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-[var(--text-primary)] leading-snug">{n.title}</span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1" />}
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-[var(--text-tertiary)] mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Interactive User Profile & Role Switcher Option Component */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={styles.userBadge}
            aria-expanded={dropdownOpen}
            title="Click to switch role or view profile options"
          >
            <div className={styles.userAvatar}>
              {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
            </div>
            <span className={styles.userRoleText}>{currentUser?.role || 'ADMIN'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Option Component Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header Info */}
              <div className="p-4 bg-[var(--bg-card-hover)] border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/30">
                    {currentUser?.avatarInitials || (currentUser?.name ? currentUser.name.charAt(0) : 'A')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-[var(--text-primary)] truncate">
                      {currentUser?.name || 'Alex Admin'}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)] truncate font-mono">
                      {currentUser?.email || 'admin@dealflow360.demo'}
                    </p>
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <span>{currentUser?.role || 'ADMIN'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Option List: Select System Role */}
              <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Switch Active Role Option
                </div>
                {availableUsers.map((u) => {
                  const RoleIcon = getRoleIcon(u.role);
                  const isSelected = (currentUser?.id === u.id) || (currentUser?.role === u.role && !currentUser?.id);

                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                        isSelected
                          ? 'bg-sky-500/15 text-sky-400 font-bold border border-sky-500/30'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <RoleIcon className="w-4 h-4 shrink-0 text-sky-400" />
                        <div className="text-left truncate">
                          <div className="font-semibold truncate">{u.name}</div>
                          <div className="text-[10px] text-[var(--text-tertiary)] truncate font-mono">{u.role}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="p-2 bg-[var(--bg-card-hover)] border-t border-[var(--border-subtle)] space-y-1">
                <Link
                  href="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Admin Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
