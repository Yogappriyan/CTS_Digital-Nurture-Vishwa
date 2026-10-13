import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import { ImageUploader } from '../components/upload/ImageUploader';
import { AnalysisProgressModal } from '../components/analysis/AnalysisProgressModal';
import { MedicalDisclaimerBanner } from '../components/layout/MedicalDisclaimerBanner';
import { runSkinScreeningAnalysis } from '../services/aiService';
import { AnalysisResult } from '../types';

interface NewAnalysisPageProps {
  onBack: () => void;
  onAnalysisCompleted: (result: AnalysisResult) => void;
}

export const NewAnalysisPage: React.FC<NewAnalysisPageProps> = ({
  onBack,
  onAnalysisCompleted
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepMessage, setStepMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartAnalysis = async (
    imageSource: File | string,
    title?: string,
    presetCategoryCode?: string
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setCurrentStep(1);
    setStepMessage('Initializing screening pipeline...');

    try {
      const result = await runSkinScreeningAnalysis(imageSource, {
        title,
        targetCategoryCode: presetCategoryCode,
        onProgress: (step, msg) => {
          setCurrentStep(step);
          setStepMessage(msg);
        }
      });

      // Small pause to let user see final completed state
      setTimeout(() => {
        setIsAnalyzing(false);
        onAnalysisCompleted(result);
      }, 500);
    } catch (err: any) {
      setErrorMessage(`Screening analysis encountered an issue: ${err?.message || 'Please try again.'}`);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-0.5">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            New Skin Lesion Screening
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload or capture a clear close-up photograph for automated dermatological screening & visual attention mapping.
          </p>
        </div>
      </div>

      {/* Inline Error Notice if needed */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Medical Safety Disclaimer Strip */}
      <MedicalDisclaimerBanner compact />

      {/* Image Uploader & Preview Box */}
      <ImageUploader onStartAnalysis={handleStartAnalysis} isAnalyzing={isAnalyzing} />

      {/* Best Practices Guidance Card */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-2 text-xs">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-teal-600" />
          <span>Photographing Guidelines for Optimal Screening:</span>
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
            <span>Ensure ample direct lighting without harsh reflections or deep cast shadows.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
            <span>Position camera 10–15cm away and tap to focus squarely on the lesion center.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
            <span>Gently part any hair obscuring the border edges of the spot.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
            <span>Avoid digital zoom blur; use the native lens resolution where possible.</span>
          </li>
        </ul>
      </div>

      {/* Multi-Step Animated Progress Modal */}
      {isAnalyzing && (
        <AnalysisProgressModal currentStep={currentStep} stepMessage={stepMessage} />
      )}
    </div>
  );
};
