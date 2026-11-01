import React from 'react';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', showWordmark = true, size = 'md' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Emblem: Motorcycle Rim / Brake Disc fused with Audio Frequency Waves */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]">
          {/* Outer Wheel Tire/Rim */}
          <circle cx="32" cy="32" r="28" stroke="#334155" strokeWidth="4" />
          <circle cx="32" cy="32" r="23" stroke="#22D3EE" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />
          
          {/* Inner Hub / Rotor */}
          <circle cx="32" cy="32" r="8" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
          
          {/* Frequency Wave Spokes radiating through hub */}
          {/* Center wave bars */}
          <path d="M32 14 V50" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M26 18 V46" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M38 18 V46" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M20 23 V41" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
          <path d="M44 23 V41" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 28 V36" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M50 28 V36" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Center axle dot */}
          <circle cx="32" cy="32" r="3" fill="#22D3EE" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-bold tracking-tight text-white ${textSizes[size]}`}>
              MOTO<span className="text-cyan-400">SYNQ</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              AI
            </span>
          </div>
          <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium mt-1">
            Condition Monitoring
          </span>
        </div>
      )}
    </div>
  );
};
