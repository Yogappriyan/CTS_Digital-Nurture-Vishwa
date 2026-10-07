import React from 'react';
import { AlertCircle, ShieldAlert, X } from 'lucide-react';

interface MedicalDisclaimerBannerProps {
  compact?: boolean;
  dismissible?: boolean;
}

export const MedicalDisclaimerBanner: React.FC<MedicalDisclaimerBannerProps> = ({ 
  compact = false,
  dismissible = false 
}) => {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  if (compact) {
    return (
      <div className="bg-amber-500/10 border-y border-amber-500/20 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 max-w-5xl mx-auto">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Medical Notice:</strong> SkinSight AI provides educational screening assistance only and is <strong>not a medical diagnosis</strong>. Always consult a licensed dermatologist for clinical evaluation.
          </span>
        </div>
        {dismissible && (
          <button 
            onClick={() => setDismissed(true)} 
            className="text-amber-700 dark:text-amber-300 hover:opacity-75"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-100 dark:bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-sm">
          <h4 className="font-semibold text-slate-100 flex items-center gap-2">
            Important Clinical Screening Disclaimer
          </h4>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            This AI-assisted screening platform evaluates photographic surface patterns using deep convolutional neural networks (EfficientNet). It <strong>cannot diagnose skin cancer, melanoma, or any other dermatological pathology</strong>. An automated score should never replace an in-person examination or surgical biopsy by a qualified dermatologist.
          </p>
        </div>
      </div>
    </div>
  );
};
