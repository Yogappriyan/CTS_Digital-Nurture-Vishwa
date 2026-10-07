import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { ProbabilityBreakdown } from '../../types';

interface ProbabilityDistributionProps {
  probabilities: ProbabilityBreakdown[];
}

export const ProbabilityDistribution: React.FC<ProbabilityDistributionProps> = ({ probabilities }) => {
  const [showAll, setShowAll] = useState(false);

  const displayedList = showAll ? probabilities : probabilities.slice(0, 4);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Multi-Class Probability Breakdown
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Softmax output distribution across 7 ISIC skin lesion categories
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
          ∑ = 100%
        </span>
      </div>

      <div className="space-y-3 pt-1">
        {displayedList.map((item, index) => {
          const isTop = index === 0;
          return (
            <div key={item.categoryCode} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    ({item.categoryCode.toUpperCase()})
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {item.percentage}%
                </span>
              </div>

              {/* Progress bar track */}
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isTop ? 'bg-teal-600 dark:bg-teal-500' : 'bg-slate-400 dark:bg-slate-600'
                  }`}
                  style={{ width: `${Math.max(2, item.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {probabilities.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 pt-1"
        >
          {showAll ? (
            <>
              <span>Show top 4 categories</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Show all 7 classes</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p>
          Probability reflects mathematical network confidence among the 7 trained categories, not personal cancer risk or disease incidence.
        </p>
      </div>
    </div>
  );
};
