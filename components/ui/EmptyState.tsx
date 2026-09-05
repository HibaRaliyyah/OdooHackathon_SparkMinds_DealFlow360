import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-card)]/50">
      {icon && <div className="p-4 rounded-2xl bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo-light)] mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-tertiary)] max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[var(--bg-card-hover)] rounded-lg ${className}`} />;
}
