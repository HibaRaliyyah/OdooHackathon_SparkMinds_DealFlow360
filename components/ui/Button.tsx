import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    danger: 'btn-danger',
    ghost: 'hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg font-medium',
    md: 'px-4 py-2 text-sm rounded-lg font-medium',
    lg: 'px-5 py-2.5 text-base rounded-xl font-semibold',
  };

  return (
    <button
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
