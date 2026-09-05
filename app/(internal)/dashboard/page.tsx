'use client';

import React from 'react';
import { useStore } from '@/lib/data/store';
import { RoleSwitcherBar } from '@/components/dashboard/RoleSwitcherBar';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { SalesManagerDashboard } from '@/components/dashboard/SalesManagerDashboard';
import { SalesRepDashboard } from '@/components/dashboard/SalesRepDashboard';
import { FinanceDashboard } from '@/components/dashboard/FinanceDashboard';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';

export default function DashboardPage() {
  const { currentUser } = useStore();
  const currentRole = currentUser?.role || 'ADMIN';

  const renderDashboardByRole = () => {
    switch (currentRole) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'SALES_MANAGER':
        return <SalesManagerDashboard />;
      case 'FINANCE':
        return <FinanceDashboard />;
      case 'CUSTOMER':
        return <CustomerDashboard />;
      case 'SALES_REP':
      default:
        return <SalesRepDashboard />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Dynamic Role Switcher Bar for Seamless Official & Customer Testing */}
      <RoleSwitcherBar />

      {/* Role-Specific Official or Customer Dashboard */}
      {renderDashboardByRole()}
    </div>
  );
}
