// ============================================================
// DealFlow360 — Audit & Notification Helpers
// Helper utility functions to record structured audit logs and build in-app notifications
// ============================================================

import type { AuditEvent, Notification, UserRole } from '@/lib/types';

export function createAuditEvent(
  userId: string,
  userName: string,
  userRole: UserRole,
  action: string,
  entity: string,
  entityId: string,
  previousValue?: string,
  newValue?: string,
  reason?: string
): AuditEvent {
  return {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userName,
    userRole,
    action,
    entity,
    entityId,
    previousValue,
    newValue,
    reason,
    timestamp: new Date().toISOString(),
  };
}

export function createNotification(
  userId: string,
  title: string,
  message: string,
  type: Notification['type'],
  relatedEntity?: string,
  relatedEntityId?: string
): Notification {
  return {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    title,
    message,
    type,
    read: false,
    relatedEntity,
    relatedEntityId,
    createdAt: new Date().toISOString(),
  };
}
