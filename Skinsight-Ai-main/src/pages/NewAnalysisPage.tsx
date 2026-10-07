import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  Cpu,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
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
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  const [showVercelGuide, setShowVercelGuide] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);

  const checkHealth = () => {
    setIsTestingApi(true);
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        const configured = Boolean(data.geminiConfigured);
        setGeminiConfigured(configured);
        setApiTestResult(
          configured
            ? `Connected to ${data.service || 'SkinSight API'}: Gemini Multimodal Engine is active!`
            : `Endpoint reachable (${data.service || 'SkinSight API'}), but GEMINI_API_KEY is not detected.`
        );
      })
      .catch((err) => {
        setGeminiConfigured(false);
        setApiTestResult(`Endpoint error: ${err.message}. If on Vercel, redeploy after pulling the newly created /api functions.`);
      })
      .finally(() => setIsTestingApi(false));
  };

  useEffect(() => {
    checkHealth();
  }, []);

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
            Upload or capture a clear close-up photograph for neural network classification & Grad-CAM visual attention mapping.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-medium">
          <Cpu className="w-4 h-4 text-teal-600" />
          <span>EfficientNet-B0 Backbone</span>
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

      {/* AI Environment Notice if Gemini API key not detected */}
      {geminiConfigured === false && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs space-y-3 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">
                  Notice: Running on Offline Feature Engine (GEMINI_API_KEY unconfigured or serverless pending)
                </p>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  Screenings on this host are currently processed by the offline image feature fallback. To get real-time multimodal Gemini AI classifications with zero static bias on Vercel or localhost, add <code className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/60 rounded font-mono text-[11px]">GEMINI_API_KEY</code> into your environment.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowVercelGuide(!showVercelGuide)}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-200/80 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 transition-colors cursor-pointer"
            >
              <span>Vercel Fix Guide</span>
              {showVercelGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expandable Vercel Configuration Guide */}
          {showVercelGuide && (
            <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 text-slate-700 dark:text-slate-300 space-y-3 animate-in fade-in">
              <h5 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>🚀 3 Steps to Enable Gemini Multimodal AI on Vercel:</span>
              </h5>
              
              <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed">
                <li>
                  <strong>Add Environment Variable in Vercel:</strong> In your <strong>Vercel Project Dashboard</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>:
                  <div className="mt-1 pl-4 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 select-all">
                    Key: GEMINI_API_KEY<br />
                    Value: [Paste your secret key here in Vercel Dashboard, NOT in code]
                  </div>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    ⚠️ <strong>Never paste your secret key directly into .tsx source files</strong> — GitHub Push Protection will immediately block your git push (Error GH013).
                  </span>
                </li>
                <li>
                  <strong>For Local Development:</strong> Put <code className="font-mono text-teal-600">GEMINI_API_KEY="..."</code> inside your local <code className="font-mono text-teal-600">.env</code> file (which is git-ignored and safe).
                </li>
                <li>
                  <strong>Serverless API Routes Ready:</strong> Native Vercel functions are in <code className="font-mono text-teal-600">/api/analyze-skin.ts</code> and <code className="font-mono text-teal-600">/api/health.ts</code>.
                </li>
                <li>
                  <strong>Trigger Redeploy:</strong> In Vercel &rarr; Deployments &rarr; click <strong>Redeploy</strong> to apply the environment variable.
                </li>
              </ol>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <button
                  onClick={checkHealth}
                  disabled={isTestingApi}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-spin' : ''}`} />
                  <span>{isTestingApi ? 'Testing API...' : 'Test /api/health Live'}</span>
                </button>

                {apiTestResult && (
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {apiTestResult}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Uploader & Preview Box */}
      <ImageUploader onStartAnalysis={handleStartAnalysis} isAnalyzing={isAnalyzing} />

      {/* Best Practices Guidance Card */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-2 text-xs">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-teal-600" />
          <span>Photographing Guidelines for Optimal Feature Extraction:</span>
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
