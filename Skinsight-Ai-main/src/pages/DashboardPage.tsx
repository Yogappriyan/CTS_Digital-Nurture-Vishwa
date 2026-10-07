import React, { useState } from 'react';
import { 
  PlusCircle, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  BarChart3, 
  Eye, 
  MessageSquare, 
  FileText, 
  Trash2, 
  ArrowRight,
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';
import { AnalysisResult, AppView, UserProfile } from '../types';
import { MedicalDisclaimerBanner } from '../components/layout/MedicalDisclaimerBanner';
import { ABCDE_GUIDE } from '../services/lesionData';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { isUserAdmin } from '../services/firebase';

interface DashboardPageProps {
  user: UserProfile;
  analyses: AnalysisResult[];
  onNavigate: (view: AppView) => void;
  onSelectAnalysis: (id: string) => void;
  onOpenAssistantWithAnalysis: (analysis: AnalysisResult) => void;
  onDeleteAnalysis: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  analyses,
  onNavigate,
  onSelectAnalysis,
  onOpenAssistantWithAnalysis,
  onDeleteAnalysis
}) => {
  const [targetToDelete, setTargetToDelete] = useState<AnalysisResult | null>(null);
  const totalCount = analyses.length;
  const latestAnalysis = analyses[0] || null;
  const avgConfidence = totalCount > 0
    ? Math.round((analyses.reduce((acc, curr) => acc + curr.prediction.confidence, 0) / totalCount) * 100)
    : 0;

  const requiresReviewCount = analyses.filter(
    a => a.prediction.riskLevel === 'malignant-suspected' || a.prediction.riskLevel === 'pre-malignant'
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(targetToDelete)}
        onClose={() => setTargetToDelete(null)}
        onConfirm={() => {
          if (targetToDelete) {
            onDeleteAnalysis(targetToDelete.id);
            setTargetToDelete(null);
          }
        }}
        targetAnalysis={targetToDelete}
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Good day, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your AI-assisted skin screening activity and explore explainable insights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isUserAdmin(user) && (
            <button
              onClick={() => onNavigate('train-evaluate')}
              className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>Admin: Train & Evaluate</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('new-analysis')}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Skin Analysis</span>
          </button>
        </div>
      </div>

      {/* Medical disclaimer strip */}
      <MedicalDisclaimerBanner compact dismissible />

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Analyses</span>
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {totalCount}
            </span>
            <span className="text-[11px] text-slate-400">records</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Stored locally in browser session
          </p>
        </div>

        {/* Latest Prediction */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Latest Prediction</span>
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 truncate block">
              {latestAnalysis ? latestAnalysis.prediction.categoryName : 'No analysis yet'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {latestAnalysis ? `Confidence: ${(latestAnalysis.prediction.confidence * 100).toFixed(0)}%` : 'Ready to start'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {latestAnalysis ? `ISIC: ${latestAnalysis.prediction.categoryCode.toUpperCase()}` : 'Upload image to begin'}
          </p>
        </div>

        {/* Average Confidence */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Confidence</span>
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {avgConfidence}%
            </span>
            <span className="text-[11px] text-slate-400">across dataset</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Based on Softmax probability
          </p>
        </div>

        {/* Clinical Review Flags */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Flagged For Review</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {requiresReviewCount}
            </span>
            <span className="text-[11px] text-slate-400">lesions</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Atypical / Pre-malignant patterns
          </p>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent Skin Analyses
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your recent dermoscopic screenings and visual attention maps
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {analyses.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-slate-500">No skin analyses recorded yet.</p>
            <button
              onClick={() => onNavigate('new-analysis')}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold"
            >
              Start First Screening
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Lesion Image</th>
                  <th className="py-3 px-3">Title & Date</th>
                  <th className="py-3 px-3">Prediction</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analyses.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Image Thumbnail */}
                    <td className="py-3 px-3">
                      <div
                        onClick={() => onSelectAnalysis(item.id)}
                        className="w-12 h-12 rounded-lg overflow-hidden bg-slate-950 cursor-pointer border border-slate-200 dark:border-slate-800 hover:opacity-90"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Title & Date */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onSelectAnalysis(item.id)}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 text-left block truncate max-w-[200px]"
                      >
                        {item.title}
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Prediction */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.prediction.categoryName}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {item.prediction.categoryCode.toUpperCase()}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {(item.prediction.confidence * 100).toFixed(0)}%
                        </span>
                        <div className="w-14 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-teal-600 rounded-full"
                            style={{ width: `${item.prediction.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        item.status === 'Requires Review' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAnalysis(item.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View analysis details"
                          aria-label="View analysis details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAssistantWithAnalysis(item);
                          }}
                          className="p-1.5 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors cursor-pointer"
                          title="Ask AI Assistant"
                          aria-label="Ask AI Assistant about this analysis"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTargetToDelete(item);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete record"
                          aria-label="Delete this screening record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick ABCDE Reference banner */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Quick Reference: The ABCDE Skin Check Standard
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">American Academy of Dermatology</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ABCDE_GUIDE.map((item) => (
            <div key={item.letter} className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
              <span className="font-bold text-teal-600 dark:text-teal-400">{item.letter} — {item.name}:</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{item.definition}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
