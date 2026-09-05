'use client';

import React from 'react';
import { useStore } from '@/lib/data/store';
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard';
import { SalesRepDashboard } from '@/components/dashboard/SalesRepDashboard';
import { SalesManagerDashboard } from '@/components/dashboard/SalesManagerDashboard';
import { FinanceDashboard } from '@/components/dashboard/FinanceDashboard';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';

export default function DashboardPage() {
  const { currentUser } = useStore();
  const role = currentUser?.role;

  if (role === 'SALES_REP') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <SalesRepDashboard />
      </div>
    );
  }

  if (role === 'SALES_MANAGER') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <SalesManagerDashboard />
      </div>
    );
  }

  if (role === 'FINANCE') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <FinanceDashboard />
      </div>
    );
  }

  if (role === 'CUSTOMER') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <CustomerDashboard />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Enterprise Executive Management Dashboard */}
      <ExecutiveDashboard />
    </div>
  );
}
