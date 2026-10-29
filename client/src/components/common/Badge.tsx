import React from 'react';

type BadgeVariant = 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate'
  | 'success' | 'danger' | 'info' | 'warning' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
}) => {
  // Normalize aliases
  const normalized: Record<string, string> = {
    success: 'emerald',
    danger: 'rose',
    info: 'indigo',
    warning: 'amber',
    neutral: 'slate',
  };
  const v = (normalized[variant] || variant) as 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';

  const variantStyles: Record<string, string> = {
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantStyles[v]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
