'use client';

import React from 'react';
import { useDealFlowStore } from '@/lib/store/useDealFlowStore';
import { CustomerProfileForm } from '@/components/customer/CustomerProfileForm';
import { UserCheck, Shield } from 'lucide-react';

export default function ProfilePage() {
  const currentCustomer = useDealFlowStore((state) => state.currentCustomer);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-sky-400" />
          <span>Account & Profile Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update primary account contacts, billing addresses, and shipping destination preferences.
        </p>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-3">
        <Shield className="w-5 h-5 text-sky-400 shrink-0" />
        <div>
          <span className="font-bold">Enterprise Security & Compliance: </span>
          Company Name and Tier Level changes require authorization from your dedicated DealFlow360 Key Account Manager.
        </div>
      </div>

      {/* Profile Form Component */}
      <CustomerProfileForm
        initialCompany={currentCustomer.company}
        initialContact={currentCustomer.name}
        initialEmail={currentCustomer.email}
        initialPhone="+1 (555) 010-2020"
        initialTier={currentCustomer.tier}
      />
    </div>
  );
}
