'use client';

import React from 'react';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';
import { RoleSwitcherBar } from '@/components/dashboard/RoleSwitcherBar';

export default function CustomerPortalPage() {
  return (
    <div className="space-y-6">
      <RoleSwitcherBar />
      <CustomerDashboard />
    </div>
  );
}
