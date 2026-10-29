import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose';
  trend?: string | { value: string; positive: boolean };
  trendType?: 'positive' | 'negative' | 'warning' | 'neutral';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'indigo',
  trend,
  trendType = 'neutral',
}) => {
  const iconVariants = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  // Normalize trend prop
  let trendText = '';
  let trendPositive = trendType === 'positive';
  if (typeof trend === 'string') {
    trendText = trend;
  } else if (trend) {
    trendText = trend.value;
    trendPositive = trend.positive;
  }

  const trendColor = trendType === 'positive' ? 'text-emerald-400' :
                     trendType === 'negative' || trendType === 'warning' ? 'text-amber-400' :
                     'text-slate-400';

  return (
    <div className="dark-card p-5 dark-card-hover flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
          <div className="text-2xl font-bold text-white mt-1.5 tracking-tight">{value}</div>
        </div>
        <div className={`p-3 rounded-xl border ${iconVariants[variant]} transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(subtitle || trendText) && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          {subtitle && <span>{subtitle}</span>}
          {trendText && (
            <span className={`font-medium ${trendColor}`}>
              {trendText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
