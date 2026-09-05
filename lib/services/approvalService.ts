// ============================================================
// DealFlow360 — Approval Service
// Pure business logic — no React dependencies
// ============================================================

import type { Quotation, ApprovalRequest, ApprovalAction, UserRole } from '@/lib/types';

/**
 * Determine the correct approval route based on blended risk.
 */
export function determineApprovalRoute(riskLevel: string): ApprovalRequest['stage'] {
  if (riskLevel === 'LOW') return 'Auto-Approved';
  if (riskLevel === 'MEDIUM') return 'Sales Manager';
  return 'Sales Manager'; // HIGH starts at Sales Manager then goes to Finance
}

/**
 * Check if a user can approve a quotation (cannot approve own submission).
 */
export function canApprove(approverId: string, quotationAssignedToId: string, requiredRole: UserRole, approverRole: UserRole): { allowed: boolean; reason?: string } {
  if (approverId === quotationAssignedToId) {
    return { allowed: false, reason: 'Sales representatives cannot approve their own quotations.' };
  }
  if (requiredRole === 'SALES_MANAGER' && approverRole !== 'SALES_MANAGER' && approverRole !== 'ADMIN') {
    return { allowed: false, reason: 'Only a Sales Manager can approve at this stage.' };
  }
  if (requiredRole === 'FINANCE' && approverRole !== 'FINANCE' && approverRole !== 'ADMIN') {
    return { allowed: false, reason: 'Only Finance can confirm at this stage.' };
  }
  return { allowed: true };
}

/**
 * Get the next stage after sales manager approval.
 */
export function getNextStageAfterManagerApproval(riskLevel: string): ApprovalRequest['stage'] {
  if (riskLevel === 'HIGH') return 'Finance';
  return 'Completed'; // MEDIUM only needs Sales Manager
}

/**
 * Build an audit action record.
 */
export function buildApprovalAction(params: {
  approvalRequestId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: ApprovalAction['action'];
  comment?: string;
  reason?: string;
}): ApprovalAction {
  return {
    id: `act-${Date.now()}`,
    ...params,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate that an approval stage transition is allowed.
 */
export function validateApprovalTransition(
  currentStage: ApprovalRequest['stage'],
  action: 'approve' | 'return' | 'reject' | 'confirm',
  userRole: UserRole,
): { valid: boolean; error?: string } {
  if (currentStage === 'Completed' || currentStage === 'Rejected') {
    return { valid: false, error: 'This approval request is already resolved.' };
  }
  if (currentStage === 'Sales Manager' && action === 'confirm' && userRole !== 'FINANCE') {
    return { valid: false, error: 'Finance confirmation is not available at the Sales Manager stage.' };
  }
  if (currentStage === 'Finance' && action === 'approve' && userRole !== 'FINANCE') {
    return { valid: false, error: 'Only Finance can act on Finance stage approvals.' };
  }
  return { valid: true };
}
