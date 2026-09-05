import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ children, className = '', title, subtitle, headerAction, footer }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>}
            {subtitle && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && <div className="px-6 py-3 bg-[var(--bg-card-hover)] border-t border-[var(--border-subtle)] rounded-b-2xl">{footer}</div>}
    </div>
  );
}
