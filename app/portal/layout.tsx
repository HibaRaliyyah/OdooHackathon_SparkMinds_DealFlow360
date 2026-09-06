'use client';

import React from 'react';
import { CustomerSidebar } from '@/components/customer/CustomerSidebar';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { DealFlowCustomerChat } from '@/components/ai/DealFlowCustomerChat';

export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]">
      {/* Customer Dedicated Sidebar */}
      <CustomerSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <CustomerHeader />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>
      {/* DealFlow Friendly Customer AI — portal-only */}
      <DealFlowCustomerChat />
    </div>
  );
}
