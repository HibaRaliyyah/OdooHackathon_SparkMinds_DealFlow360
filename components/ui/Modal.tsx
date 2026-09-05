'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'md' }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`modal-content bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl w-full ${widthClasses[maxWidth]} overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
            {subtitle && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
