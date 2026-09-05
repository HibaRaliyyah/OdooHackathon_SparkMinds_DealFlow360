'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  showLabel?: boolean;
}

export function BackButton({ href, label = 'Back', className = '', showLabel = true }: BackButtonProps) {
  const router = useRouter();

  const buttonContent = (
    <button
      onClick={() => (!href ? router.back() : undefined)}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 ${className}`}
      title="Go back to previous screen"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      {showLabel && <span>{label}</span>}
    </button>
  );

  if (href) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  return buttonContent;
}
