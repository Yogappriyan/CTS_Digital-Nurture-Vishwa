import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  Calendar,
  AlertCircle,
  MessageSquarePlus,
  MapPin,
  Star,
  ExternalLink,
  Download,
  FileText,
  Loader2
} from 'lucide-react';
import { AnalysisResult } from '../../types';
import { generateSkinAnalysisPDF } from '../../utils/pdfReportGenerator';

interface InterpretationCardProps {
  analysis: AnalysisResult;
  onOpenAssistant: () => void;
  onOpenFindDoctor: () => void;
}

export const InterpretationCard: React.FC<InterpretationCardProps> = ({
  analysis,
  onOpenAssistant,
  onOpenFindDoctor
}) => {
  const { prediction } = analysis;
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateSkinAnalysisPDF(analysis);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Unable to generate PDF report at this time. Please try again.');
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 800);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Clinical Guidance & Result Interpretation
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Understanding what this screening result indicates and appropriate next actions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Section 1: What this result means */}
        <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/40 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-semibold text-xs uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>What the AI Screening Means</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {prediction.interpretation}
          </p>
        </div>

        {/* Section 2: What it does NOT mean */}
        <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold text-xs uppercase tracking-wider">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>What It Does NOT Mean</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {prediction.whatItDoesNotMean}
          </p>
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>Recommended Next Steps</span>
        </h4>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {prediction.recommendedActions.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action triggers */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenAssistant}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Ask AI Assistant</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Generate & download summary report as PDF to share with a healthcare professional"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
            ) : (
              <Download className="w-4 h-4 text-teal-400" />
            )}
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Summary'}</span>
          </button>
        </div>

        <button
          onClick={onOpenFindDoctor}
          className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-amber-300" />
          <span>Find Nearby High-Rated Skin Care Centers</span>
          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
        </button>
      </div>
    </div>
  );
};
