import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  MessageSquare, 
  RotateCcw,
  Sparkles, 
  AlertTriangle, 
  CheckCircle2,
  Info,
  Cpu, 
  Layers,
  UploadCloud,
  AlertCircle,
  Download
} from 'lucide-react';
import { generateSkinAnalysisPDF } from '../utils/pdfReportGenerator';
import { AnalysisResult, AppView, UserProfile } from '../types';
import { ConfidenceMeter } from '../components/analysis/ConfidenceMeter';
import { ProbabilityDistribution } from '../components/analysis/ProbabilityDistribution';
import { GradCAMViewer } from '../components/analysis/GradCAMViewer';
import { InterpretationCard } from '../components/analysis/InterpretationCard';
import { HybridPipelineViewer } from '../components/analysis/HybridPipelineViewer';
import { MedicalDisclaimerBanner } from '../components/layout/MedicalDisclaimerBanner';
import { NearbySkincareModal } from '../components/modals/NearbySkincareModal';

interface AnalysisResultPageProps {
  analysis: AnalysisResult;
  user: UserProfile;
  onBack: () => void;
  onNavigate: (view: AppView) => void;
  onOpenAssistant: (initialPrompt?: string) => void;
  onViewReport: (analysis: AnalysisResult) => void;
}

export const AnalysisResultPage: React.FC<AnalysisResultPageProps> = ({
  analysis,
  user,
  onBack,
  onNavigate,
  onOpenAssistant,
  onViewReport
}) => {
  const [isFindDoctorOpen, setIsFindDoctorOpen] = useState(false);
  const { prediction, gradcam, probabilities, imageMetadata, modelInfo, visualFindings, abcdeAssessment } = analysis;

  const isUnwanted = prediction.categoryCode === 'unwanted_non_skin' || prediction.isSkinOrMedical === false;
  const isNormalSkin = prediction.categoryCode === 'normal_skin' || prediction.isNormalHealthySkin === true;
  const isHighRisk = prediction.riskLevel === 'malignant-suspected' || prediction.riskLevel === 'pre-malignant';

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-0.5">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 transition-colors mb-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              AI Dermatological Screening Result
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-bold">
              {analysis.id}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Analyzed {new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {modelInfo.architecture}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenAssistant()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Ask AI Assistant</span>
          </button>

          {!isUnwanted && (
            <>
              <button
                onClick={() => onViewReport(analysis)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Clinical Report</span>
              </button>

              <button
                onClick={() => generateSkinAnalysisPDF(analysis)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Download Summary Report PDF for Healthcare Provider"
              >
                <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Download PDF</span>
              </button>
            </>
          )}

          <button
            onClick={() => onNavigate('new-analysis')}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Screening</span>
          </button>
        </div>
      </div>

      {/* Non-Dermatological / Unwanted Image Advisory Alert */}
      {isUnwanted && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Non-Dermatological Image Detected
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {prediction.rejectionReason || 'The uploaded photograph does not appear to show a human skin surface, rash, or skin lesion. For accurate consultation, please upload a clear, focused photograph of an infected, abnormal, or concerning skin area.'}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-amber-200 dark:border-amber-800/40 flex items-center gap-3">
            <button
              onClick={() => onNavigate('new-analysis')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Infected or Skin Lesion Photo</span>
            </button>
            <button
              onClick={() => onOpenAssistant('Why was my uploaded image flagged as non-dermatological?')}
              className="px-3 py-2 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Ask AI Assistant
            </button>
          </div>
        </div>
      )}

      {/* Normal Healthy Skin Positive Confirmation */}
      {isNormalSkin && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/50 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-300 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Normal Healthy Skin Field
            </h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              The AI model inspected this image and found no suspicious pigmented lesions, signs of malignancy, or active cutaneous infections.
            </p>
          </div>
        </div>
      )}

      {/* Medical Safety Disclaimer Strip */}
      <MedicalDisclaimerBanner compact />

      {/* AI Engine Source Indicator & Notice */}
      {prediction.aiEngineStatus && prediction.aiEngineStatus !== 'gemini_active' && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Notice: Computed via {prediction.aiModelUsed || 'Local Feature Heuristic Engine'}
            </p>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
              {prediction.aiNotice || 'GEMINI_API_KEY is not configured in your localhost or server environment. To unlock real-time multimodal Gemini AI vision classifications, add your GEMINI_API_KEY to your environment.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Prediction Summary Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left / Center Info */}
          <div className="md:col-span-8 space-y-2.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Primary Classification Output
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isUnwanted
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : isHighRisk
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {prediction.categoryCode.toUpperCase()} • {prediction.riskLevel.replace('-', ' ').toUpperCase()}
              </span>
              {prediction.aiEngineStatus === 'gemini_active' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {prediction.aiModelUsed || 'Gemini Vision'}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Offline Fallback Heuristic
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {prediction.categoryName}
            </h2>

            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              {prediction.clinicalName}
            </p>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              {prediction.summary}
            </p>

            {/* Real-time visual findings if available */}
            {visualFindings && visualFindings.length > 0 && (
              <div className="pt-2 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Observed Visual Characteristics:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-600 dark:text-slate-300">
                  {visualFindings.map((finding, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Circular Confidence Gauge */}
          <div className="md:col-span-4 flex justify-center md:justify-end border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-5">
            <ConfidenceMeter
              confidence={prediction.confidence}
              confidenceLabel={prediction.confidenceLabel}
              riskLevel={prediction.riskLevel}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* ABCDE Feature Breakdown Card (if applicable) */}
      {abcdeAssessment && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>ABCDE Morphological Feature Assessment</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">A • Asymmetry</span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-tight">{abcdeAssessment.asymmetry}</p>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">B • Border</span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-tight">{abcdeAssessment.border}</p>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">C • Color</span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-tight">{abcdeAssessment.color}</p>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">D • Diameter</span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-tight">{abcdeAssessment.diameter}</p>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">E • Evolution</span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-tight">{abcdeAssessment.evolution}</p>
            </div>
          </div>
        </div>
      )}

      {/* End-to-End Hybrid Computer Vision Pipeline Inspector */}
      <HybridPipelineViewer 
        analysis={analysis} 
        onOpenAssistantWithPrompt={(prompt) => onOpenAssistant(prompt)}
      />

      {/* Grid: Probability Distribution & Grad-CAM Explainability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Multi-Class Probability Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <ProbabilityDistribution probabilities={probabilities} />

          {/* Pipeline Specifications Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h4 className="font-bold text-slate-900 dark:text-slate-100">
                Pipeline Specifications
              </h4>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              <p><span className="text-slate-400">Vision Model:</span> Gemini 3.7 Flash Multimodal</p>
              <p><span className="text-slate-400">Backbone:</span> MobileNetV2 (1280-D)</p>
              <p><span className="text-slate-400">Feature Selection:</span> PCA (64-D, 96.4% Var)</p>
              <p><span className="text-slate-400">Detector:</span> YOLOv4 CSPDarknet53 SPP</p>
              <p><span className="text-slate-400">Classifier:</span> XceptionNet + CNN+LSTM Hybrid</p>
              <p><span className="text-slate-400">Inference Latency:</span> {modelInfo.inferenceTimeMs} ms</p>
            </div>
          </div>
        </div>

        {/* Explainable Grad-CAM Heatmap Viewer */}
        <div className="lg:col-span-7">
          <GradCAMViewer
            originalImageUrl={analysis.imageUrl}
            gradcam={gradcam}
            categoryName={prediction.categoryName}
          />
        </div>
      </div>

      {/* Clinical Interpretation & Recommended Actions Card */}
      <InterpretationCard
        analysis={analysis}
        onOpenAssistant={() => onOpenAssistant(`Explain the findings for ${prediction.categoryName} and what actions I should take.`)}
        onOpenFindDoctor={() => setIsFindDoctorOpen(true)}
      />

      {/* Nearby Skincare & Dermatology Centers (Google Maps) Modal */}
      <NearbySkincareModal
        isOpen={isFindDoctorOpen}
        onClose={() => setIsFindDoctorOpen(false)}
        initialLesionType={prediction.categoryName}
      />
    </div>
  );
};
