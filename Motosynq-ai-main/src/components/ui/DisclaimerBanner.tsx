import React from 'react';
import { AlertTriangle, Info, Wrench } from 'lucide-react';

interface DisclaimerBannerProps {
  type?: 'screening' | 'sensor_note' | 'mechanic_separation';
  className?: string;
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  type = 'screening',
  className = '',
  compact = false,
}) => {
  if (type === 'sensor_note') {
    return (
      <div className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/60 text-slate-300 text-xs leading-relaxed ${className}`}>
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-cyan-300">Sensor Mounting Note:</span> Smartphone motion sensors measure the phone's physical motion, not engine vibration directly. Rigid vs. damp mounting position significantly affects signal amplitude and frequency response.
        </div>
      </div>
    );
  }

  if (type === 'mechanic_separation') {
    return (
      <div className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-amber-500/20 text-slate-300 text-xs leading-relaxed ${className}`}>
        <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300">Observation vs. Diagnosis:</span> All AI pattern classifications are statistical screening observations. Only certified technicians and physical workshop measurements provide confirmed mechanical diagnoses.
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-200/90 text-[11px] sm:text-xs leading-snug sm:leading-relaxed ${className}`}>
      <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-amber-300">AI-Assisted Screening Tool:</span> MOTOSYNQ AI evaluates acoustic and motion patterns for screening purposes only. It does <strong>NOT</strong> replace a qualified motorcycle mechanic, and no output is a confirmed mechanical diagnosis.
      </div>
    </div>
  );
};
