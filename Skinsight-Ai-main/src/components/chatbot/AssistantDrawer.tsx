import React from 'react';
import { X, Maximize2, Minimize2, MessageSquare } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { ChatView } from './ChatView';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  analysisContext?: AnalysisResult | null;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  analysisContext
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity pointer-events-auto"
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-auto transition-all duration-300 ${
          isExpanded ? 'w-full max-w-2xl' : 'w-full max-w-md'
        }`}
      >
        <div className="w-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                DermaAssist Assistant
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Minimize drawer' : 'Expand drawer'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ChatView analysisContext={analysisContext} fullScreen={true} />
          </div>
        </div>
      </div>
    </div>
  );
};
