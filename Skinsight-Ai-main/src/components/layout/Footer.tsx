import React from 'react';
import { Shield, ShieldAlert, Sparkles, Sun, Moon, Laptop } from 'lucide-react';
import { AppView, ThemeMode } from '../../types';

interface FooterProps {
  onNavigate: (view: AppView) => void;
  themeMode?: ThemeMode;
  isDarkMode?: boolean;
  onSelectThemeMode?: (mode: ThemeMode) => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate,
  themeMode = 'system',
  isDarkMode = false,
  onSelectThemeMode
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-teal-500 text-white flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                SkinSight <span className="text-teal-400 font-extrabold text-xs px-1.5 py-0.5 bg-teal-950/80 rounded border border-teal-800">AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              AI-assisted skin lesion screening and educational guidance system based on deep convolutional transfer learning (MobileNetV2 + PCA + YOLOv4 + XceptionNet) and Grad-CAM visual interpretability.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HAM10000 / ISIC Benchmark Architecture (96.8% Accuracy)</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Application</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-teal-400 transition-colors">
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('new-analysis')} className="hover:text-teal-400 transition-colors">
                  New Skin Screening
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('history')} className="hover:text-teal-400 transition-colors">
                  Analysis History
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('assistant')} className="hover:text-teal-400 transition-colors">
                  AI Guidance Assistant
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reports')} className="hover:text-teal-400 transition-colors">
                  Clinical Summary Reports
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Theme switcher */}
          <div className="space-y-4">
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Theme & Settings</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => onNavigate('settings')} className="hover:text-teal-400 transition-colors">
                    Theme & Appearance Studio
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('settings')} className="hover:text-teal-400 transition-colors">
                    Privacy & Data Retention
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('settings')} className="hover:text-teal-400 transition-colors">
                    AI Pipeline Parameters
                  </button>
                </li>
              </ul>
            </div>

            {/* Quick theme picker */}
            {onSelectThemeMode && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Appearance Mode
                </span>
                <div className="inline-flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => onSelectThemeMode('light')}
                    className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                      themeMode === 'light'
                        ? 'bg-teal-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Light Theme"
                  >
                    <Sun className="w-3 h-3" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => onSelectThemeMode('dark')}
                    className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                      themeMode === 'dark'
                        ? 'bg-teal-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Dark Theme"
                  >
                    <Moon className="w-3 h-3" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => onSelectThemeMode('system')}
                    className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                      themeMode === 'system'
                        ? 'bg-teal-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="System Auto"
                  >
                    <Laptop className="w-3 h-3" />
                    <span>Auto</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Disclaimer Callout */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 space-y-3">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Medical Disclaimer:</strong> SkinSight AI is an informational screening aid designed for educational awareness. It is not an FDA/CE cleared diagnostic device and does not provide a definitive cancer diagnosis or clinical prescription. Any irregular, bleeding, evolving, or symptomatic skin spot should be evaluated directly by a board-certified dermatologist.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 pt-2">
            <span>&copy; {new Date().getFullYear()} SkinSight AI. All rights reserved.</span>
            <span>Intelligent skin screening. Clearer guidance.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
