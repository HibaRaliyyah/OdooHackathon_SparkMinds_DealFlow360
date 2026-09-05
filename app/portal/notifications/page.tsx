'use client';

import React, { useState } from 'react';
import { useDealFlowStore } from '@/lib/store/useDealFlowStore';
import {
  Bell,
  CheckCheck,
  FileText,
  Truck,
  DollarSign,
  AlertCircle,
  Clock,
  Trash2,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'quotation' | 'order' | 'invoice' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'NOTIF-001',
      type: 'quotation',
      title: 'Quotation Negotiated Terms Updated',
      message: 'Account Executive submitted revised terms for Quotation QT-2026-881 (7.5% volume discount applied).',
      timestamp: '10 minutes ago',
      isRead: false,
      link: '/portal/quotations/QT-2026-881',
    },
    {
      id: 'NOTIF-002',
      type: 'order',
      title: 'Shipment Dispatched from Chicago Hub',
      message: 'Order ORD-2026-904 (Package 1 of 2) has shipped via FedEx Priority. Tracking # FX-9938210.',
      timestamp: '2 hours ago',
      isRead: false,
      link: '/portal/orders/ORD-2026-904',
    },
    {
      id: 'NOTIF-003',
      type: 'invoice',
      title: 'Invoice Issued - Net 30',
      message: 'Invoice INV-2026-441 ($29,400.00) has been generated for Order ORD-2026-904. Due in 30 days.',
      timestamp: '1 day ago',
      isRead: true,
      link: '/portal/invoices',
    },
    {
      id: 'NOTIF-004',
      type: 'system',
      title: 'Tier Upgrade Confirmed',
      message: 'Your company profile was upgraded to Enterprise Platinum Tier status.',
      timestamp: '3 days ago',
      isRead: true,
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'quotation':
        return <FileText className="w-5 h-5 text-sky-400" />;
      case 'order':
        return <Truck className="w-5 h-5 text-emerald-400" />;
      case 'invoice':
        return <DollarSign className="w-5 h-5 text-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time updates regarding your quotations, shipments, and billing alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-sky-400 border border-sky-500/30 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-2">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-semibold text-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground">You are all caught up with your updates.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                item.isRead
                  ? 'bg-[var(--surface-elevated)]/60 border-[var(--border-subtle)] opacity-85'
                  : 'bg-[var(--surface-elevated)] border-sky-500/40 shadow-sm shadow-sky-500/5'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-semibold ${item.isRead ? 'text-slate-300' : 'text-white'}`}>
                    {item.title}
                  </h3>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" /> {item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.message}</p>

                {item.link && (
                  <a
                    href={item.link}
                    className="inline-flex items-center text-xs font-semibold text-sky-400 hover:text-sky-300 mt-2 gap-1"
                  >
                    View Details &rarr;
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0 self-center">
                {!item.isRead && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(item.id)}
                  title="Remove notification"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
