import React from 'react';
import { Database } from 'lucide-react';

interface SampleDataBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const SampleDataBadge: React.FC<SampleDataBadgeProps> = ({ className = '', size = 'sm' }) => {
  const isSmall = size === 'sm';
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-semibold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${className}`}
      title="This content is illustrative sample data. VITE_ENABLE_DEMO_DATA=true"
    >
      <Database className={isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      Sample data
    </span>
  );
};
