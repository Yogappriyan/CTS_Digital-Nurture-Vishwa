import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-3.5 sm:p-8 text-center rounded-xl border border-dashed border-slate-800 bg-[#0F1520]/50 ${className}`}>
      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-2 sm:mb-3.5 shrink-0">
        <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-slate-400" />
      </div>
      <h4 className="text-xs sm:text-sm font-semibold text-slate-200">{title}</h4>
      <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm mt-0.5 sm:mt-1 leading-snug sm:leading-relaxed">{description}</p>

      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5 sm:mt-4">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] text-[11px] sm:text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
