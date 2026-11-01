import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  onClick,
  hoverEffect = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#12171F] border border-slate-800/80 rounded-xl p-3.5 sm:p-5 shadow-sm transition-all duration-150 ${
        hoverEffect ? 'hover:border-slate-700 hover:bg-[#161D27] cursor-pointer' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2.5 sm:mb-4 pb-2 sm:pb-3 border-b border-slate-800/60">
          <div className="min-w-0">
            {typeof title === 'string' ? (
              <h3 className="text-sm sm:text-base font-semibold text-slate-100 tracking-tight truncate">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate sm:whitespace-normal">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
