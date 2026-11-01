import React from 'react';

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  trend?: string;
  badge?: React.ReactNode;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  hint,
  icon,
  badge,
  className = '',
}) => {
  return (
    <div className={`bg-[#12171F] border border-slate-800/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-1.5 text-slate-400">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">{label}</span>
        {icon && <div className="text-slate-400 shrink-0">{icon}</div>}
      </div>
      <div className="mt-1.5 sm:mt-2 flex items-baseline justify-between gap-2">
        <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">{value}</div>
        {badge}
      </div>
      {hint && <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 sm:mt-1.5 leading-snug truncate sm:whitespace-normal">{hint}</p>}
    </div>
  );
};
