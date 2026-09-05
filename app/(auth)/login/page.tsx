'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/data/store';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  Shield,
  Briefcase,
  Calculator,
  UserCheck,
  Building,
  Check,
  UserPlus,
  LogIn,
  KeyRound,
  Wand2,
  Sliders,
  LayoutDashboard,
} from 'lucide-react';

interface DemoAccount {
  id: string;
  label: string;
  officialName: string;
  roleTitle: string;
  email: string;
  icon: React.ComponentType<{ className?: string }>;
  pillBg: string;
  badgeBg: string;
  badgeColor: string;
  duties: string[];
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'admin',
    label: 'Admin',
    officialName: 'Alex Admin',
    roleTitle: 'Backend Setup & Platform Administrator',
    email: 'admin@dealflow360.demo',
    icon: Shield,
    pillBg: 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30',
    badgeBg: 'bg-indigo-500/20 border-indigo-500/30',
    badgeColor: 'text-indigo-300',
    duties: [
      'Manages backend setup: products, price lists, discount tiers, warehouses, subscription plans',
      'Views platform-wide analytics and reporting',
      'Controls global security, user provisioning, and audit logs',
    ],
  },
  {
    id: 'manager',
    label: 'Sales Manager / Approver',
    officialName: 'Mihail Shah',
    roleTitle: 'Sales Manager & Deal Approver',
    email: 'manager@dealflow360.demo',
    icon: Briefcase,
    pillBg: 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30',
    badgeBg: 'bg-purple-500/20 border-purple-500/30',
    badgeColor: 'text-purple-300',
    duties: [
      'Reviews and approves or rejects quotations that exceed discount thresholds',
      'Configures discount tiers and approval chains',
      'Monitors deal health dashboard for at-risk deals',
    ],
  },
  {
    id: 'sales',
    label: 'Sales Rep',
    officialName: 'Jasmine Rao',
    roleTitle: 'Sales Operations Representative',
    email: 'sales@dealflow360.demo',
    icon: UserCheck,
    pillBg: 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30',
    badgeBg: 'bg-amber-500/20 border-amber-500/30',
    badgeColor: 'text-amber-300',
    duties: [
      'Builds quotations, applies discounts, adds upsell items',
      'Tracks approval status and fulfillment progress',
      'Responds to customer negotiation requests',
    ],
  },
  {
    id: 'finance',
    label: 'Finance / Operations User',
    officialName: 'Riya Iyer',
    roleTitle: 'Finance Controller & Operations',
    email: 'finance@dealflow360.demo',
    icon: Calculator,
    pillBg: 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/30',
    badgeColor: 'text-emerald-300',
    duties: [
      'Handles second level approvals for high-risk discounts',
      'Manages warehouse fulfillment splits and backorder decisions',
      'Reconciles recurring billing and credit notes',
    ],
  },
  {
    id: 'customer',
    label: 'Customer (Portal User)',
    officialName: 'Tom Acme',
    roleTitle: 'Acme Corp Client Representative',
    email: 'customer@dealflow360.demo',
    icon: Building,
    pillBg: 'bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30',
    badgeBg: 'bg-cyan-500/20 border-cyan-500/30',
    badgeColor: 'text-cyan-300',
    duties: [
      'Views quotation online',
      'Requests changes, asks line-level questions, or counters a discount',
      'Confirms final terms with one click',
    ],
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'magiclink'>('signin');
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState('demo1234');
  const [name, setName] = useState('');
  const [signupRole, setSignupRole] = useState('SALES_REP');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<DemoAccount>(DEMO_ACCOUNTS[0]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        if (email === 'customer@dealflow360.demo') {
          router.push('/portal/quotation');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(result.error || 'Invalid credentials');
        setLoading(false);
      }
    }, 350);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login('sales@dealflow360.demo', 'demo1234');
      router.push('/dashboard');
    }, 400);
  };

  const handleSendMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setMagicLinkSent(true);
      setLoading(false);
    }, 400);
  };

  const handleQuickSelect = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword('demo1234');
    setSelectedAccount(account);
    setError('');
  };

  const SelectedIcon = selectedAccount.icon;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#06080e] text-white">
      {/* ─── Left Hero Section (Gradient Showcase) ─── */}
      <div className="lg:w-1/2 w-full min-h-[480px] lg:min-h-screen bg-gradient-to-br from-[#4338ca] via-[#6366f1] to-[#7c3aed] p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden select-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-900/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />

        {/* Top Brand Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/95 text-indigo-700 shadow-2xl flex items-center justify-center font-black text-2xl p-1.5 border border-white/40">
              <div className="w-full h-full rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm font-extrabold">
                AF
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white tracking-tight">DealFlow360</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/20">
                  Enterprise CPQ
                </span>
              </div>
              <p className="text-xs text-indigo-100/80 font-medium">B2B Deal Operations & Configuration Platform</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => {
                login('admin@dealflow360.demo', 'demo1234');
                router.push('/admin');
              }}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Go to Backend Setup</span>
            </button>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="relative z-10 my-auto py-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold text-indigo-100 mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>A1–A7 Backend Setup + B1–B9 Sales Workspace</span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-4 drop-shadow-sm">
            AI-Powered B2B Deal & Asset Operations System
          </h1>
          <p className="text-sm lg:text-base text-indigo-100/90 font-normal leading-relaxed max-w-lg drop-shadow-sm">
            From quote configuration, live discount validation, and multi-tier approval routing to warehouse fulfillment splits, customer negotiations, and automated recurring billing.
          </p>

          {/* 4 Stat / Metric Cards */}
          <div className="grid grid-cols-2 gap-3.5 mt-8">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="text-2xl font-black text-white tracking-tight font-mono">10,000+</div>
              <div className="text-xs text-indigo-100 font-medium mt-0.5">Assets & Deals Tracked</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="text-2xl font-black text-white tracking-tight font-mono">99.9%</div>
              <div className="text-xs text-indigo-100 font-medium mt-0.5">Platform Uptime SLA</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="text-2xl font-black text-white tracking-tight font-mono">70%</div>
              <div className="text-xs text-indigo-100 font-medium mt-0.5">Approval Time Saved</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="text-2xl font-black text-white tracking-tight font-mono">500+</div>
              <div className="text-xs text-indigo-100 font-medium mt-0.5">Enterprise Clients</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-indigo-100/70 border-t border-white/15 pt-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> Multi-Stage Approvals & GAAP Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-300" /> Real-Time Live Sync
          </span>
        </div>
      </div>

      {/* ─── Right Auth Section (A1 Authentication Modes) ─── */}
      <div className="lg:w-1/2 w-full bg-[#090d16] p-6 lg:p-12 flex flex-col justify-center items-center relative z-10 overflow-y-auto">
        <div className="w-full max-w-lg space-y-5">
          {/* Auth Mode Switcher */}
          <div className="flex items-center justify-between bg-[#141b2b] p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setAuthMode('signin');
                setError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Internal Sign In</span>
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signup' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>User Sign Up</span>
            </button>
            <button
              onClick={() => {
                setAuthMode('magiclink');
                setError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'magiclink' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Customer Magic Link</span>
            </button>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {authMode === 'signin' && 'Sign in to Workspace'}
              {authMode === 'signup' && 'Create Internal Account'}
              {authMode === 'magiclink' && 'Customer Portal Access'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {authMode === 'signin' && 'Access Sales Workspace or Backend Configuration with standard credentials.'}
              {authMode === 'signup' && 'Register a new official account to join the deal operations workspace.'}
              {authMode === 'magiclink' && 'Enter your customer email to access online quotations and negotiations.'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          {/* ─── Mode 1: Sign In ─── */}
          {authMode === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@dealflow360.demo"
                    className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl pl-11 pr-11 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer text-xs"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to {selectedAccount.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ─── Mode 2: Sign Up ─── */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@company.com"
                  className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assigned Official Role</label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="SALES_REP">Sales Rep (Build Quotes, Discounts, Upsells)</option>
                  <option value="SALES_MANAGER">Sales Manager / Approver (Thresholds, Health)</option>
                  <option value="FINANCE">Finance / Operations (2nd Level, Splits, Billing)</option>
                  <option value="ADMIN">Admin (Backend Setup & Analytics)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Enter Sales Workspace</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ─── Mode 3: Magic Link (Customer Portal) ─── */}
          {authMode === 'magiclink' && (
            <div className="space-y-4">
              {magicLinkSent ? (
                <div className="p-5 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">Magic Link Generated!</h3>
                  <p className="text-xs text-slate-300">
                    Your secure 1-click token for <strong>Acme Corp Quotations</strong> is active.
                  </p>
                  <button
                    onClick={() => {
                      login('customer@dealflow360.demo', 'demo1234');
                      router.push('/portal/quotation');
                    }}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                  >
                    Open Customer Portal Now →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMagicLink} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Customer Portal Email</label>
                    <input
                      type="email"
                      required
                      defaultValue="customer@dealflow360.demo"
                      placeholder="client@acme.com"
                      className="w-full bg-[#141b2b] border border-slate-700/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Send Portal Magic Link</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ─── Role Selector with Exact Roles & Duties ─── */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Select Official / Customer Persona
              </p>
              <span className="text-[10px] text-slate-500">1-Click Auto Fill</span>
            </div>

            {/* Role Pills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = selectedAccount.id === acc.id;
                const Icon = acc.icon;

                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickSelect(acc)}
                    className={`p-2 rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-2 border-indigo-400 text-white shadow-md'
                        : 'bg-[#141b2b]/70 hover:bg-[#141b2b] border border-slate-800 text-slate-300'
                    } ${acc.id === 'customer' ? 'sm:col-span-2' : ''}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                        <span>{acc.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Selected Role Responsibilities Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#131b2e] to-[#0d1320] border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <SelectedIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-none">{selectedAccount.label}</h3>
                    <span className="text-[10px] text-slate-400">{selectedAccount.officialName} — {selectedAccount.roleTitle}</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20">
                  Ready to Sign In
                </span>
              </div>

              {/* Responsibilities bullet points */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Role Capabilities & Workflow Duties:
                </p>
                {selectedAccount.duties.map((duty, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-indigo-400 font-bold mt-0.5">•</span>
                    <span className="text-[11px] leading-snug">{duty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
