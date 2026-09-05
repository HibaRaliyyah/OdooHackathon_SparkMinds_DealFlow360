'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/data/store';
import { ArrowLeft, LogOut, Building, ShieldCheck, Crown, Award, Gem, Medal } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, customers, logout } = useStore();

  const customerRecord = customers.find(
    (c) => c.company === currentUser?.company || c.email === currentUser?.email
  );
  const tier = customerRecord?.tier || (currentUser?.company?.includes('Acme') ? 'Gold' : 'Silver');

  const getTierBadge = () => {
    switch (tier) {
      case 'Bronze':
        return { icon: Medal, color: 'bg-amber-700/20 text-amber-300 border-amber-600/30' };
      case 'Silver':
        return { icon: Award, color: 'bg-slate-500/20 text-slate-200 border-slate-400/30' };
      case 'Gold':
        return { icon: Crown, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
      case 'Platinum':
        return { icon: Gem, color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      default:
        return { icon: Crown, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    }
  };

  const tierInfo = getTierBadge();
  const TierIcon = tierInfo.icon;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* Top Portal Banner */}
      <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
            DF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-[var(--text-primary)]">DealFlow360 Customer Portal</span>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Interactive
              </span>
            </div>
            {currentUser?.company && (
              <div className="text-[11px] text-slate-400 font-medium">
                Client: <strong className="text-slate-200">{currentUser.company}</strong> ({currentUser.name})
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tier indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${tierInfo.color}`}>
            <TierIcon className="w-3.5 h-3.5" />
            <span>{tier} Customer Tier</span>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Internal Ops</span>
          </Link>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 p-1.5 rounded-lg border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="p-6 lg:p-8 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
