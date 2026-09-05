import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* Top Portal Banner */}
      <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm">
            360
          </div>
          <div>
            <span className="text-sm font-extrabold text-[var(--text-primary)]">DealFlow360 Customer Portal</span>
            <span className="ml-2 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Interactive Negotiation
            </span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Internal Ops</span>
        </Link>
      </header>

      <main className="p-8 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
