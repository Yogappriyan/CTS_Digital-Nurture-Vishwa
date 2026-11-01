import React from 'react';
import { ResultCategory } from '../../types';
import { getResultBadgeConfig } from '../../lib/formatters';

interface StatusBadgeProps {
  category?: ResultCategory;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ category, className = '', size = 'md' }) => {
  const config = getResultBadgeConfig(category);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${className}`}
      title={config.description}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      <span>{config.label}</span>
    </span>
  );
};
