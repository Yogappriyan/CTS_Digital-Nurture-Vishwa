import React from 'react';
import { ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { RiskLevel } from '../../types';

interface ConfidenceMeterProps {
  confidence: number; // 0.0 to 1.0
  confidenceLabel: 'High' | 'Moderate' | 'Low';
  riskLevel: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  confidenceLabel,
  riskLevel,
  size = 'md'
}) => {
  const percentage = Math.round(confidence * 100);

  // SVG Gauge calculations
  const dimension = size === 'lg' ? 140 : size === 'sm' ? 80 : 110;
  const strokeWidth = size === 'lg' ? 10 : size === 'sm' ? 7 : 9;
  const radius = (dimension - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Determine stroke color
  const strokeColor = 
    riskLevel === 'malignant-suspected' ? '#ef4444' :
    riskLevel === 'pre-malignant' ? '#f59e0b' :
    percentage >= 80 ? '#0d9488' : '#0284c7';

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center">
        <svg
          width={dimension}
          height={dimension}
          className="transform -rotate-90"
        >
          {/* Track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Value Ring */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-xl'} font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-mono`}>
            {percentage}%
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400">
            Confidence
          </span>
        </div>
      </div>

      <div className="mt-2.5 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: strokeColor }}
          />
          <span>{confidenceLabel} Model Confidence</span>
        </div>

        {percentage < 70 && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 max-w-xs leading-tight mt-1">
            Low confidence result: The model is uncertain. Do not rely on this score without clinical verification.
          </p>
        )}
      </div>
    </div>
  );
};
