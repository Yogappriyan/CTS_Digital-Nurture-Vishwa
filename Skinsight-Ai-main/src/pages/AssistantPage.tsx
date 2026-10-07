import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  FileText, 
  Info,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { AnalysisResult, UserProfile } from '../types';
import { ChatView } from '../components/chatbot/ChatView';
import { ABCDE_GUIDE } from '../services/lesionData';

interface AssistantPageProps {
  analyses: AnalysisResult[];
  activeAnalysis?: AnalysisResult | null;
  user: UserProfile;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  analyses,
  activeAnalysis,
  user
}) => {
  const [selectedContextId, setSelectedContextId] = useState<string>(
    activeAnalysis?.id || (analyses[0]?.id ?? '')
  );

  const currentAnalysis = analyses.find(a => a.id === selectedContextId) || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <span>DermaAssist AI Assistant</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
              YOLO + CNN Research Layer
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Interprets the YOLO lesion detection + CNN/Xception classification pipeline in clear, honest, non-alarming language.
          </p>
        </div>

        {/* Context Selector */}
        {analyses.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Screening Context:</span>
            <select
              value={selectedContextId}
              onChange={(e) => setSelectedContextId(e.target.value)}
              className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">General Dermatological Mode (No Image)</option>
              {analyses.map(a => (
                <option key={a.id} value={a.id}>
                  {a.title} — {a.prediction.categoryCode.toUpperCase()} ({(a.prediction.confidence * 100).toFixed(0)}%)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chat Window */}
        <div className="lg:col-span-8">
          <ChatView analysisContext={currentAnalysis} fullScreen={false} />
        </div>

        {/* Right: Reference & Active Context Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Context Preview */}
          {currentAnalysis ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Active Lesion Context
              </span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-200 dark:border-slate-800">
                  <img
                    src={currentAnalysis.imageUrl}
                    alt={currentAnalysis.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {currentAnalysis.prediction.categoryName}
                  </h4>
                  <p className="text-[11px] text-teal-600 dark:text-teal-400 font-mono font-semibold">
                    {(currentAnalysis.prediction.confidence * 100).toFixed(0)}% Confidence
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2">
                {currentAnalysis.prediction.summary}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-500 text-center">
              No specific lesion selected. Chatbot is in general dermatological educational mode.
            </div>
          )}

          {/* Quick ABCDE Reference Accordion */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-teal-600" />
              <span>ABCDE Reference Summary</span>
            </h4>
            <div className="space-y-2">
              {ABCDE_GUIDE.slice(0, 3).map(item => (
                <div key={item.letter} className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <span className="font-bold text-teal-600 dark:text-teal-400">{item.letter} - {item.name}:</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.definition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Card */}
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
            <h5 className="font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Medical Assistant Scope</span>
            </h5>
            <p className="leading-relaxed">
              The assistant explains neural predictions, confidence metrics, and doctor inquiry checklists. It never declares clinical cancer diagnoses or prescribes medicine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
