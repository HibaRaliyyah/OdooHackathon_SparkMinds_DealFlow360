import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'neutral', size = 'sm', className = '' }: BadgeProps) {
  const badgeClasses: Record<BadgeVariant, string> = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    neutral: 'badge-neutral',
    purple: 'badge-purple',
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs font-semibold' : 'px-3 py-1 text-sm font-semibold';

  return (
    <span className={`badge ${badgeClasses[variant]} ${sizeClass} inline-flex items-center gap-1 rounded-full ${className}`}>
      {children}
    </span>
  );
}
