'use client';

import React from 'react';
import { useStore } from '@/lib/data/store';
import { Bell, Check, Info, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markNotificationRead, currentUser } = useStore();

  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser?.id || n.userId === 'all' || !n.userId
  );

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card-hover)]/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--accent-indigo-light)]" />
          <h4 className="text-xs font-bold text-[var(--text-primary)]">Notifications</h4>
        </div>
        <span className="text-[10px] text-[var(--text-tertiary)] font-medium">
          {userNotifications.filter((n) => !n.read).length} unread
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-subtle)]">
        {userNotifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--text-tertiary)]">No notifications</div>
        ) : (
          userNotifications.map((n) => {
            let Icon = Info;
            let iconColor = 'text-blue-400';
            if (n.type === 'success') {
              Icon = Check;
              iconColor = 'text-emerald-400';
            } else if (n.type === 'warning') {
              Icon = AlertTriangle;
              iconColor = 'text-amber-400';
            } else if (n.type === 'error') {
              Icon = XCircle;
              iconColor = 'text-rose-400';
            }

            return (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3.5 flex gap-3 transition-colors ${
                  n.read ? 'opacity-70 bg-transparent' : 'bg-[var(--accent-indigo)]/5'
                } hover:bg-[var(--bg-card-hover)] cursor-pointer`}
              >
                <div className={`mt-0.5 ${iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{n.title}</p>
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">{n.message}</p>
                  {n.relatedEntityId && (
                    <Link
                      href={`/quotations/${n.relatedEntityId}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--accent-purple-light)] hover:underline mt-1.5"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
