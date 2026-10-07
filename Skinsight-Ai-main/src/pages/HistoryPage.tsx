import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  FileText, 
  MessageSquare, 
  PlusCircle, 
  Clock, 
  AlertCircle,
  Download,
  CheckCircle2
} from 'lucide-react';
import { AnalysisResult, AppView } from '../types';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';

interface HistoryPageProps {
  analyses: AnalysisResult[];
  onNavigate: (view: AppView) => void;
  onSelectAnalysis: (id: string) => void;
  onOpenAssistantWithAnalysis: (analysis: AnalysisResult) => void;
  onViewReport: (analysis: AnalysisResult) => void;
  onDeleteAnalysis: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  analyses,
  onNavigate,
  onSelectAnalysis,
  onOpenAssistantWithAnalysis,
  onViewReport,
  onDeleteAnalysis,
  onClearAll
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'high' | 'moderate' | 'review'>('all');
  const [targetToDelete, setTargetToDelete] = useState<AnalysisResult | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  const filteredAnalyses = analyses.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prediction.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prediction.categoryCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'high') return item.prediction.confidence >= 0.8;
    if (filterType === 'moderate') return item.prediction.confidence < 0.8;
    if (filterType === 'review') {
      return item.prediction.riskLevel === 'malignant-suspected' || item.prediction.riskLevel === 'pre-malignant';
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      {/* Clear All Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={() => {
          onClearAll();
          setIsClearAllModalOpen(false);
        }}
        isClearAll
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Skin Analysis History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review past screenings, Grad-CAM attention maps, and clinical reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {analyses.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
            >
              Clear History
            </button>
          )}

          <button
            onClick={() => onNavigate('new-analysis')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by lesion name or category (e.g. Nevus, BCC, Melanoma)..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All ({analyses.length})
          </button>
          <button
            onClick={() => setFilterType('high')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'high'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            High Confidence (≥80%)
          </button>
          <button
            onClick={() => setFilterType('moderate')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'moderate'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Moderate/Low (&lt;80%)
          </button>
          <button
            onClick={() => setFilterType('review')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'review'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Requires Review
          </button>
        </div>
      </div>

      {/* History Grid */}
      {filteredAnalyses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No analyses found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No records matched "${searchQuery}". Try clearing filters or search terms.`
              : 'You haven’t performed any skin screenings yet. Upload your first image to begin.'}
          </p>
          <button
            onClick={() => onNavigate('new-analysis')}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold mt-2 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start Skin Screening</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnalyses.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-teal-500/60 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Header */}
                <div
                  onClick={() => onSelectAnalysis(item.id)}
                  className="relative aspect-16/9 bg-slate-950 cursor-pointer overflow-hidden group"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur rounded text-[10px] font-mono font-bold text-white">
                    {(item.prediction.confidence * 100).toFixed(0)}% Conf
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur rounded text-[10px] font-bold text-teal-400">
                    ISIC: {item.prediction.categoryCode.toUpperCase()}
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      item.status === 'Requires Review' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectAnalysis(item.id)}
                    className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-teal-600 cursor-pointer truncate"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {item.prediction.categoryName}
                  </p>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.prediction.summary}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onSelectAnalysis(item.id)}
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAssistantWithAnalysis(item);
                    }}
                    className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Ask AI Assistant"
                    aria-label="Ask AI Assistant about this analysis"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewReport(item);
                    }}
                    className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Clinical Report"
                    aria-label="View Clinical Report"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetToDelete(item);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Delete record"
                    aria-label="Delete this screening record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
