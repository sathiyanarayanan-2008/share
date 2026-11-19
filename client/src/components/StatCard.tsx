import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'teal' | 'navy' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'teal',
}) => {
  const glowStyles = {
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    teal: 'border-teal-500/30 text-teal-400 bg-teal-500/10',
    navy: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  }[variant];

  return (
    <div className="card-3d rounded-xl p-5 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white mt-1 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${glowStyles} transition-transform group-hover:scale-110 duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500/0 via-teal-500/40 to-emerald-500/0" />
    </div>
  );
};
