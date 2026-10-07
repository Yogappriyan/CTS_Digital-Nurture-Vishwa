import React from 'react';
import { CheckCircle2, Loader2, ShieldCheck, Sparkles, Cpu } from 'lucide-react';

interface AnalysisProgressModalProps {
  currentStep: number;
  stepMessage: string;
}

const STEPS = [
  { id: 1, name: 'Image Validation', desc: 'Resolution, focus & lighting validation' },
  { id: 2, name: 'Preprocessing', desc: 'RGB normalization & 224×224 tensor transformation' },
  { id: 3, name: 'Feature Extraction', desc: 'EfficientNet deep convolutional feature maps' },
  { id: 4, name: 'Classification', desc: 'Softmax probability evaluation across 7 ISIC categories' },
  { id: 5, name: 'Explainability Map', desc: 'Grad-CAM gradient backpropagation & heat localization' },
  { id: 6, name: 'Clinical Synthesis', desc: 'Formatting screening metrics & guidance summary' }
];

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({ currentStep, stepMessage }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-6 text-left">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 animate-pulse">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Analyzing Skin Lesion...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              EfficientNet-B0 Inference Engine
            </p>
          </div>
        </div>

        {/* Current status bar */}
        <div className="p-3 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-spin shrink-0" />
          <span className="text-xs font-medium text-teal-900 dark:text-teal-200 truncate">
            {stepMessage || 'Processing computational neural network steps...'}
          </span>
        </div>

        {/* Pipeline Step List */}
        <div className="space-y-2.5">
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div
                key={step.id}
                className={`p-2.5 rounded-lg flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-slate-100 dark:bg-slate-800 border border-teal-500/40 shadow-xs'
                    : isCompleted
                    ? 'bg-slate-50/50 dark:bg-slate-800/20 opacity-85'
                    : 'opacity-40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                        {step.id}
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-semibold ${isCurrent ? 'text-teal-600 dark:text-teal-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {step.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {step.desc}
                    </p>
                  </div>
                </div>
                {isCompleted && (
                  <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold ml-2">
                    DONE
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          Please keep this window open while the analysis completes.
        </p>
      </div>
    </div>
  );
};
