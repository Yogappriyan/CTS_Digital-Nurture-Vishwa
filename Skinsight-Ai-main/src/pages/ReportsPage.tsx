import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Eye, 
  Calendar, 
  Cpu, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Download
} from 'lucide-react';
import { AnalysisResult, AppView, UserProfile } from '../types';
import { ClinicalReportView } from '../components/reports/ClinicalReportView';

interface ReportsPageProps {
  analyses: AnalysisResult[];
  user: UserProfile;
  onNavigate: (view: AppView) => void;
  onOpenAssistantWithAnalysis: (analysis: AnalysisResult) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  analyses,
  user,
  onNavigate,
  onOpenAssistantWithAnalysis
}) => {
  const [selectedReportAnalysis, setSelectedReportAnalysis] = useState<AnalysisResult | null>(
    analyses[0] || null
  );

  if (selectedReportAnalysis) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <ClinicalReportView
          analysis={selectedReportAnalysis}
          user={user}
          onBack={() => setSelectedReportAnalysis(null)}
          onOpenAssistant={() => onOpenAssistantWithAnalysis(selectedReportAnalysis)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Clinical Summary Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Printable PDF-ready clinical screening documents with Grad-CAM imagery and probability distributions.
          </p>
        </div>

        <button
          onClick={() => onNavigate('new-analysis')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors"
        >
          Generate New Report
        </button>
      </div>

      {analyses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No screening reports available
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Perform your first skin lesion analysis to generate a formal summary report.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {analyses.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-teal-500/80 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                    {item.id}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-200 dark:border-slate-800">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      {item.prediction.categoryName}
                    </p>
                    <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {(item.prediction.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedReportAnalysis(item)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View & Print Full Report</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
