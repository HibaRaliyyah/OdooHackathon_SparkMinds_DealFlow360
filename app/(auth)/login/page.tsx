'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/data/store';
import { authService } from '@/lib/services/api/authService';
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
  Wand2,
  Sliders,
  Award,
  Crown,
  Gem,
  Medal,
  Users,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

interface DemoAccount {
  id: string;
  module: 'customer' | 'admin';
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  tierDiscount?: string;
  label: string;
  officialName: string;
  roleTitle: string;
  company?: string;
  email: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  activeBorder: string;
  badgeBg: string;
  badgeColor: string;
  duties: string[];
}

// ─── Customer Tier Accounts ──────────────────────────────────────
// ─── Customer Tier Accounts ──────────────────────────────────────
const CUSTOMER_TIER_ACCOUNTS: DemoAccount[] = [
  {
    id: 'cust-bronze',
    module: 'customer',
    tier: 'Bronze',
    tierDiscount: '5% Max Discount',
    label: 'Bronze Tier Customer',
    officialName: 'Priya Zen',
    roleTitle: 'Procurement Specialist',
    company: 'Zenith Co',
    email: 'customer.bronze@dealflow360.demo',
    icon: Medal,
    accentColor: 'from-amber-700/30 to-amber-900/30 text-amber-300',
    activeBorder: 'border-amber-500/80 bg-amber-500/10 shadow-amber-500/10',
    badgeBg: 'bg-amber-100 border-amber-300 text-amber-900 font-extrabold',
    badgeColor: 'text-amber-900',
    duties: [
      'Standard tier catalog pricing with up to 5% pre-approved discount ceiling',
      'Interactive online proposal review & line-level negotiation notes',
      '1-click electronic acceptance with instant standard fulfillment order generation',
    ],
  },
  {
    id: 'cust-silver',
    module: 'customer',
    tier: 'Silver',
    tierDiscount: '10% Max Discount',
    label: 'Silver Tier Customer',
    officialName: 'Sarah Bet',
    roleTitle: 'VP of Technology & Ops',
    company: 'Beta Industries',
    email: 'customer.silver@dealflow360.demo',
    icon: Award,
    accentColor: 'from-slate-500/30 to-slate-700/30 text-slate-200',
    activeBorder: 'border-slate-300/80 bg-slate-300/10 shadow-slate-300/10',
    badgeBg: 'bg-slate-200 border-slate-300 text-slate-900 font-extrabold',
    badgeColor: 'text-slate-900',
    duties: [
      'Silver tier pre-approved discounts up to 10% on hardware & software',
      'Direct line-level comments and counter-proposal submission tool',
      'Priority delivery queue and split-shipment status tracking',
    ],
  },
  {
    id: 'cust-gold',
    module: 'customer',
    tier: 'Gold',
    tierDiscount: '15% Max Discount',
    label: 'Gold Tier Customer',
    officialName: 'Tom Acme',
    roleTitle: 'Client Commercial Director',
    company: 'Acme Corp',
    email: 'customer@dealflow360.demo',
    icon: Crown,
    accentColor: 'from-yellow-500/30 to-amber-600/30 text-yellow-300',
    activeBorder: 'border-yellow-400/80 bg-yellow-500/10 shadow-yellow-500/10',
    badgeBg: 'bg-yellow-100 border-yellow-300 text-yellow-900 font-extrabold',
    badgeColor: 'text-yellow-900',
    duties: [
      'Gold tier enterprise rate card with 15% discount ceiling',
      'Live counter-discount submission that triggers automatic B4 re-approval flows if exceeded',
      'Subscription care plan management, recurring invoices & delivery reconciliation',
    ],
  },
  {
    id: 'cust-platinum',
    module: 'customer',
    tier: 'Platinum',
    tierDiscount: '25% Max Discount',
    label: 'Platinum Tier Customer',
    officialName: 'Carlos Del',
    roleTitle: 'Chief Procurement Officer',
    company: 'Delta LLC',
    email: 'customer.platinum@dealflow360.demo',
    icon: Gem,
    accentColor: 'from-cyan-500/30 to-indigo-600/30 text-cyan-300',
    activeBorder: 'border-cyan-400/80 bg-cyan-500/10 shadow-cyan-500/10',
    badgeBg: 'bg-cyan-100 border-cyan-300 text-cyan-900 font-extrabold',
    badgeColor: 'text-cyan-900',
    duties: [
      'VIP enterprise discount ceiling up to 25% with dedicated executive account rep',
      'Expedited approval escalation directly routed to Sales Manager & Finance Controller',
      'Custom SLA terms, multi-warehouse fulfillment allocation, and Net 15 credit terms',
    ],
  },
];

// ─── Administration & Internal Accounts ──────────────────────────
const ADMIN_ACCOUNTS: DemoAccount[] = [
  {
    id: 'admin',
    module: 'admin',
    label: 'Platform Admin',
    officialName: 'Alex Admin',
    roleTitle: 'Backend Setup & Platform Administrator',
    company: 'DealFlow360 Internal',
    email: 'admin@dealflow360.demo',
    icon: Shield,
    accentColor: 'from-indigo-600/30 to-blue-600/30 text-indigo-300',
    activeBorder: 'border-indigo-400/80 bg-indigo-500/10 shadow-indigo-500/10',
    badgeBg: 'bg-indigo-100 border-indigo-300 text-indigo-900 font-extrabold',
    badgeColor: 'text-indigo-900',
    duties: [
      'Manages backend setup (A1–A7): products, price lists, discount tiers, warehouses, subscription plans',
      'Views platform-wide deal analytics, margin governance, and revenue forecasting',
      'Controls global security, user provisioning, and full system audit logs',
    ],
  },
  {
    id: 'manager',
    module: 'admin',
    label: 'Sales Manager / Approver',
    officialName: 'Mihail Shah',
    roleTitle: 'Sales Operations Manager & Deal Approver',
    company: 'DealFlow360 Sales Leadership',
    email: 'manager@dealflow360.demo',
    icon: Briefcase,
    accentColor: 'from-purple-600/30 to-pink-600/30 text-purple-300',
    activeBorder: 'border-purple-400/80 bg-purple-500/10 shadow-purple-500/10',
    badgeBg: 'bg-purple-100 border-purple-300 text-purple-900 font-extrabold',
    badgeColor: 'text-purple-900',
    duties: [
      'Reviews, approves, or rejects quotations that breach customer tier / category discount thresholds',
      'Monitors deal health dashboard for stalled quotes, delivery slippages, and margin anomalies',
      'Configures multi-tier approval routing chains and rep delegation rules',
    ],
  },
  {
    id: 'sales',
    module: 'admin',
    label: 'Sales Rep',
    officialName: 'Jasmine Rao',
    roleTitle: 'Enterprise Sales Operations Rep',
    company: 'DealFlow360 Sales Team',
    email: 'sales@dealflow360.demo',
    icon: UserCheck,
    accentColor: 'from-amber-600/30 to-orange-600/30 text-amber-300',
    activeBorder: 'border-amber-400/80 bg-amber-500/10 shadow-amber-500/10',
    badgeBg: 'bg-amber-100 border-amber-300 text-amber-900 font-extrabold',
    badgeColor: 'text-amber-900',
    duties: [
      'Builds quotations with live pricing, discount validation guards, and AI upsell suggestions',
      'Receives Telemetry Nudges & Anomaly Alerts from Deal Health Radar and re-engages customers',
      'Tracks approval status, handles negotiation counter-offers, and resubmits adjusted terms',
    ],
  },
  {
    id: 'finance',
    module: 'admin',
    label: 'Finance / Operations User',
    officialName: 'Riya Iyer',
    roleTitle: 'Financial Controller & Operations',
    company: 'DealFlow360 Finance Ops',
    email: 'finance@dealflow360.demo',
    icon: Calculator,
    accentColor: 'from-emerald-600/30 to-teal-600/30 text-emerald-300',
    activeBorder: 'border-emerald-400/80 bg-emerald-500/10 shadow-emerald-500/10',
    badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-900 font-extrabold',
    badgeColor: 'text-emerald-900',
    duties: [
      'Handles second-level approvals for high-risk quotations and margin-diluting discount requests',
      'Manages multi-warehouse fulfillment splits, inventory allocation, and backorders',
      'Reconciles recurring billing cycles, credit notes, payment records, and GAAP audit trails',
    ],
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();

  // Active Main Module: 'customer' (Client Tiers) vs 'admin' (Internal Ops & Setup)
  const [activeModule, setActiveModule] = useState<'customer' | 'admin'>('customer');

  // Sub-tabs inside active module
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'magiclink'>('signin');

  // Form state
  const [email, setEmail] = useState(CUSTOMER_TIER_ACCOUNTS[2].email); // Default to Gold (Acme Corp)
  const [password, setPassword] = useState('demo1234');
  const [name, setName] = useState('');
  const [signupRole, setSignupRole] = useState('SALES_REP');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<DemoAccount>(CUSTOMER_TIER_ACCOUNTS[2]);

  // Handle module switch
  const handleSwitchModule = (module: 'customer' | 'admin') => {
    setActiveModule(module);
    setError('');
    setMagicLinkSent(false);

    if (module === 'customer') {
      const defaultCust = CUSTOMER_TIER_ACCOUNTS[2]; // Gold tier
      setSelectedAccount(defaultCust);
      setEmail(defaultCust.email);
      setPassword('demo1234');
      setAuthMode('signin');
    } else {
      const defaultAdmin = ADMIN_ACCOUNTS[0]; // Admin
      setSelectedAccount(defaultAdmin);
      setEmail(defaultAdmin.email);
      setPassword('demo1234');
      setAuthMode('signin');
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Try real API Login first
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('df360_token', response.data.token);
          localStorage.setItem('df360_user', JSON.stringify(response.data.user));
        }

        // Sync local store
        login(email, password);

        const userRole = response.data.user.role;
        if (userRole === 'CUSTOMER' || activeModule === 'customer') {
          router.push('/portal/quotation');
        } else if (userRole === 'ADMIN' || email === 'admin@dealflow360.demo') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      // 2. Fallback to mock store login if backend endpoint un-reachable
      const localResult = login(email, password);
      if (localResult.success) {
        if (activeModule === 'customer' || email.includes('customer')) {
          router.push('/portal/quotation');
        } else if (email === 'admin@dealflow360.demo') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(response.message || localResult.error || 'Invalid credentials. Demo password is demo1234');
      }
    } catch (err: any) {
      // Fallback
      const localResult = login(email, password);
      if (localResult.success) {
        if (activeModule === 'customer' || email.includes('customer')) {
          router.push('/portal/quotation');
        } else if (email === 'admin@dealflow360.demo') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.signup({
        name: name || 'Demo Staff User',
        email,
        password: password || 'demo1234',
        role: signupRole,
        company: activeModule === 'customer' ? 'Acme Corp' : 'DealFlow360 Internal',
      });

      if (response.success && response.data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('df360_token', response.data.token);
          localStorage.setItem('df360_user', JSON.stringify(response.data.user));
        }

        login(email, password);

        if (response.data.user.role === 'CUSTOMER' || activeModule === 'customer') {
          router.push('/portal/quotation');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(response.message || 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
  const currentAccountList = activeModule === 'customer' ? CUSTOMER_TIER_ACCOUNTS : ADMIN_ACCOUNTS;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-100 text-slate-900">
      {/* ─── Left Hero Showcase (Light Showcase with Pitch Black Typography) ─── */}
      <div className="lg:w-1/2 w-full min-h-[500px] lg:min-h-screen p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden select-none bg-gradient-to-br from-indigo-50/80 via-slate-50 to-purple-50/60 text-slate-900 border-r border-slate-200">
        {/* Subtle Decorative Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-md">
            <img src="/logo.png" alt="DealFlow360 Logo" className="w-10 h-10 rounded-xl object-contain shadow-sm border border-purple-200 bg-purple-50 p-1" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight" style={{ color: '#0f172a' }}>DealFlow360</span>
                <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-purple-600 text-white shadow-sm">
                  Enterprise CPQ
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5" style={{ color: '#475569' }}>B2B Deal Operations & Configuration Platform</p>
            </div>
          </div>
        </div>

        {/* Main Hero Content Showcase */}
        <div className="relative z-10 my-auto py-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-xs font-black text-purple-900 mb-5 shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            <span style={{ color: '#581c87' }}>Dual-Module Architecture: Customer Tiers & Admin Ops</span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-[1.12] mb-4 text-slate-900" style={{ color: '#0f172a' }}>
            AI-Powered B2B Deal & Asset Operations System
          </h1>

          <p className="text-sm lg:text-base text-slate-700 font-bold leading-relaxed max-w-lg mb-8" style={{ color: '#334155' }}>
            Modular multi-tier customer portal for quote negotiation and complete administrative workspace for sales reps, manager approvals, warehouse routing, and GAAP billing.
          </p>

          {/* Module Switcher Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => handleSwitchModule('customer')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 shadow-md ${
                activeModule === 'customer'
                  ? 'bg-purple-700 border-purple-600 text-white shadow-purple-600/30 scale-[1.02]'
                  : 'bg-white border-slate-200 hover:border-purple-300 text-slate-900 shadow-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl border ${activeModule === 'customer' ? 'bg-purple-600 border-purple-400 text-cyan-200' : 'bg-purple-100 border-purple-200 text-purple-700'}`}>
                  <Building className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${activeModule === 'customer' ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 text-slate-900 border-slate-300 font-extrabold'}`}>
                  Customer Module
                </span>
              </div>
              <div className={`text-base font-black mt-3 ${activeModule === 'customer' ? 'text-white' : 'text-slate-900'}`} style={{ color: activeModule === 'customer' ? '#ffffff' : '#0f172a' }}>
                Client Tier Portal
              </div>
              <div className={`text-xs font-bold mt-1 leading-snug ${activeModule === 'customer' ? 'text-purple-100' : 'text-slate-900'}`} style={{ color: activeModule === 'customer' ? '#f3e8ff' : '#0f172a' }}>
                Bronze, Silver, Gold & Platinum tiers with live line-item negotiation
              </div>
            </div>

            <div
              onClick={() => handleSwitchModule('admin')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 shadow-md ${
                activeModule === 'admin'
                  ? 'bg-purple-700 border-purple-600 text-white shadow-purple-600/30 scale-[1.02]'
                  : 'bg-white border-slate-200 hover:border-purple-300 text-slate-900 shadow-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl border ${activeModule === 'admin' ? 'bg-purple-600 border-purple-400 text-purple-200' : 'bg-purple-100 border-purple-200 text-purple-700'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${activeModule === 'admin' ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 text-slate-900 border-slate-300 font-extrabold'}`}>
                  Admin Module
                </span>
              </div>
              <div className={`text-base font-black mt-3 ${activeModule === 'admin' ? 'text-white' : 'text-slate-900'}`} style={{ color: activeModule === 'admin' ? '#ffffff' : '#0f172a' }}>
                Administration & Ops
              </div>
              <div className={`text-xs font-bold mt-1 leading-snug ${activeModule === 'admin' ? 'text-purple-100' : 'text-slate-900'}`} style={{ color: activeModule === 'admin' ? '#f3e8ff' : '#0f172a' }}>
                Admin, Sales Rep, Approver & Finance governance workflows
              </div>
            </div>
          </div>

          {/* 4 Stat Metric Cards (Pure White Cards with Pitch Black Text) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-md text-slate-900">
              <div className="text-xl lg:text-2xl font-black font-mono text-slate-900" style={{ color: '#0f172a' }}>4 Tiers</div>
              <div className="text-[11px] font-extrabold text-slate-900 mt-0.5" style={{ color: '#0f172a' }}>Customer Policies</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-md text-slate-900">
              <div className="text-xl lg:text-2xl font-black font-mono text-cyan-700" style={{ color: '#0e7490' }}>99.9%</div>
              <div className="text-[11px] font-extrabold text-slate-900 mt-0.5" style={{ color: '#0f172a' }}>Platform Uptime</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-md text-slate-900">
              <div className="text-xl lg:text-2xl font-black font-mono text-emerald-700" style={{ color: '#047857' }}>70%</div>
              <div className="text-[11px] font-extrabold text-slate-900 mt-0.5" style={{ color: '#0f172a' }}>Approval Speedup</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-md text-slate-900">
              <div className="text-xl lg:text-2xl font-black font-mono text-amber-700" style={{ color: '#b45309' }}>A1–B9</div>
              <div className="text-[11px] font-extrabold text-slate-900 mt-0.5" style={{ color: '#0f172a' }}>Full Workflow</div>
            </div>
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-900 font-extrabold border-t border-slate-200 pt-4" style={{ color: '#0f172a' }}>
          <span className="flex items-center gap-2 text-slate-900" style={{ color: '#0f172a' }}>
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Multi-Stage Approvals & GAAP Compliant
          </span>
          <span className="flex items-center gap-2 text-slate-900" style={{ color: '#0f172a' }}>
            <span className="w-2 h-2 rounded-full bg-cyan-600 animate-ping inline-block" />
            <Clock className="w-4 h-4 text-cyan-600" /> Real-Time Live Sync
          </span>
        </div>
      </div>

      {/* ─── Right Auth Section (Two Modules: Customer vs Admin - White Theme) ─── */}
      <div className="lg:w-1/2 w-full bg-white border-l border-slate-200 p-6 lg:p-10 flex flex-col justify-center items-center relative z-10 overflow-y-auto">
        <div className="w-full max-w-lg space-y-4">
          {/* ─── PRIMARY TWO-MODULE SWITCHER ─── */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Select Access Module</span>
              <span className="text-[10px] text-purple-600 font-mono font-semibold">Switch between Customer & Admin</span>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleSwitchModule('customer')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeModule === 'customer'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 border border-purple-400/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Building className="w-4 h-4 text-purple-200" />
                <div className="text-left">
                  <div className="leading-tight">Customer Module</div>
                  <div className="text-[10px] font-normal opacity-80">Tier Logins (Bronze–Platinum)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchModule('admin')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeModule === 'admin'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 border border-purple-400/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-200" />
                <div className="text-left">
                  <div className="leading-tight">Administration Module</div>
                  <div className="text-[10px] font-normal opacity-80">Admin, Sales & Operations</div>
                </div>
              </button>
            </div>
          </div>

          {/* Sub-tabs inside Module */}
          <div className="flex items-center justify-between bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setAuthMode('signin');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{activeModule === 'customer' ? 'Customer Sign In' : 'Internal Sign In'}</span>
            </button>

            {activeModule === 'customer' ? (
              <button
                onClick={() => {
                  setAuthMode('magiclink');
                  setError('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'magiclink' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Customer Magic Link</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'signup' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Staff Sign Up</span>
              </button>
            )}
          </div>

          {/* Header */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200"
              >
                {activeModule === 'customer' ? 'Customer Portal Access' : 'Administration & Operations Access'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              {activeModule === 'customer' && authMode === 'signin' && 'Sign In to Customer Tier Portal'}
              {activeModule === 'customer' && authMode === 'magiclink' && 'Instant Customer Magic Link Access'}
              {activeModule === 'admin' && authMode === 'signin' && 'Sign In to Admin / Internal Workspace'}
              {activeModule === 'admin' && authMode === 'signup' && 'Create Internal Staff Account'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {activeModule === 'customer' && authMode === 'signin' && 'Select your customer tier login below to review quotations, negotiate terms, and track order fulfillment.'}
              {activeModule === 'customer' && authMode === 'magiclink' && 'Generate a secure 1-click token to access your company quotation online.'}
              {activeModule === 'admin' && authMode === 'signin' && 'Access CPQ pricing engine, multi-tier approval queue, warehouse fulfillment, and backend configurations.'}
              {activeModule === 'admin' && authMode === 'signup' && 'Register a new official account to join the DealFlow360 operations team.'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          {/* ─── Mode 1: Sign In (Works for both Customer and Admin) ─── */}
          {authMode === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {activeModule === 'customer' ? 'Customer Email' : 'Internal Work Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeModule === 'customer' ? 'customer@dealflow360.demo' : 'admin@dealflow360.demo'}
                    style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-sm transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-sm transition-all font-medium tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-2.5 px-5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer text-xs bg-purple-600 hover:bg-purple-500 shadow-purple-600/30"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {activeModule === 'customer'
                        ? `Sign In as ${selectedAccount.label} (${selectedAccount.company})`
                        : `Sign In to ${selectedAccount.label} Workspace`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ─── Mode 2: Sign Up (Admin / Staff Mode) ─── */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-sm transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@dealflow360.demo"
                  style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-sm transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Official Role</label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-sm transition-all font-medium"
                >
                  <option value="SALES_REP">Sales Rep (Build Quotes, Discounts, Upsells)</option>
                  <option value="SALES_MANAGER">Sales Manager / Approver (Thresholds, Health)</option>
                  <option value="FINANCE">Finance / Operations (2nd Level, Splits, Billing)</option>
                  <option value="ADMIN">Platform Admin (Backend Setup & Analytics)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Enter Workspace</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ─── Mode 3: Magic Link (Customer Portal) ─── */}
          {authMode === 'magiclink' && (
            <div className="space-y-3.5">
              {magicLinkSent ? (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center space-y-2.5">
                  <div className="w-9 h-9 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Magic Link Generated!</h3>
                  <p className="text-xs text-slate-600">
                    Secure 1-click token for <strong>{selectedAccount.company || 'Customer'} Quotations</strong> is active.
                  </p>
                  <button
                    onClick={() => {
                      login(email, 'demo1234');
                      router.push('/portal/quotation');
                    }}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    Open Customer Portal Now →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMagicLink} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@company.com"
                      style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-sm transition-all font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Send Portal Magic Link</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ─── Role / Customer Tier Quick Select Grid ─── */}
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                {activeModule === 'customer' ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span>Select Customer Tier Login</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    <span>Select Official Admin / Staff Persona</span>
                  </>
                )}
              </p>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">1-Click Auto Fill</span>
            </div>

            {/* Persona / Tier Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentAccountList.map((acc) => {
                const isSelected = selectedAccount.id === acc.id;
                const Icon = acc.icon;

                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickSelect(acc)}
                    className={`p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'border-2 border-purple-600 bg-purple-50/80 text-slate-900 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate flex items-center justify-between gap-1 text-slate-900">
                        <span className="truncate">{acc.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {acc.officialName} · <span className="font-semibold text-slate-700">{acc.company}</span>
                      </div>
                      {acc.tierDiscount && (
                        <div className="mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${acc.badgeBg}`}>
                            {acc.tierDiscount}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Selected Role / Customer Tier Responsibilities Box */}
            <div className="p-3 rounded-2xl border space-y-2 bg-purple-50/60 border-purple-200">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-purple-600 text-white">
                    <SelectedIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-none flex items-center gap-1.5">
                      <span>{selectedAccount.label}</span>
                      {selectedAccount.tier && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                          {selectedAccount.tier}
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] text-slate-600">
                      {selectedAccount.officialName} — {selectedAccount.roleTitle} ({selectedAccount.company})
                    </span>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold border border-emerald-300 shrink-0">
                  Ready to Sign In
                </span>
              </div>

              {/* Responsibilities bullet points */}
              <div className="space-y-1 pt-0.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  {activeModule === 'customer'
                    ? 'Customer Portal Privileges & Negotiation Duties:'
                    : 'Role Capabilities & Workflow Duties:'}
                </p>
                {selectedAccount.duties.map((duty, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                    <span className="font-bold mt-0.5 text-purple-600">•</span>
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
