import React, { useState } from 'react';
import { 
  Eye, 
  Maximize2, 
  Layers, 
  Sliders, 
  Info, 
  Sparkles, 
  X,
  SplitSquareVertical,
  Palette
} from 'lucide-react';
import { GradCAMData } from '../../types';

interface GradCAMViewerProps {
  originalImageUrl: string;
  gradcam: GradCAMData;
  categoryName: string;
  onColormapChange?: (map: 'jet' | 'turbo' | 'thermal' | 'hotspot') => void;
}

export const GradCAMViewer: React.FC<GradCAMViewerProps> = ({
  originalImageUrl,
  gradcam,
  categoryName,
  onColormapChange
}) => {
  const [viewMode, setViewMode] = useState<'overlay' | 'split'>('overlay');
  const [overlayOpacity, setOverlayOpacity] = useState(65);
  const [selectedColormap, setSelectedColormap] = useState<'jet' | 'turbo' | 'thermal' | 'hotspot'>(
    gradcam.colormap || 'jet'
  );
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  const handleColormapSelect = (map: 'jet' | 'turbo' | 'thermal' | 'hotspot') => {
    setSelectedColormap(map);
    if (onColormapChange) onColormapChange(map);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-md">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Why did the AI predict this? (Grad-CAM)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual explainability map highlighting regions that influenced the classification
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switch */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('overlay')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'overlay'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Overlay</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>

          <button
            onClick={() => setIsFullscreenModalOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Inspect full screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Display */}
      {viewMode === 'overlay' ? (
        <div className="relative aspect-square sm:aspect-4/3 max-h-[380px] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          {/* Original Base Image */}
          <img
            src={originalImageUrl}
            alt="Original skin lesion"
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* Grad-CAM Heatmap Layer with variable opacity */}
          {gradcam.heatmapUrl ? (
            <img
              src={gradcam.heatmapUrl}
              alt="Grad-CAM Heatmap"
              className="absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-150 pointer-events-none"
              style={{ opacity: overlayOpacity / 100 }}
            />
          ) : (
            <img
              src={gradcam.overlayUrl}
              alt="Grad-CAM Overlay"
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-150 pointer-events-none"
              style={{ opacity: overlayOpacity / 100 }}
            />
          )}

          {/* Center Indicator Target */}
          <div
            className="absolute border border-white/60 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ring-2 ring-teal-400/40"
            style={{
              left: `${gradcam.attentionCenter.x}%`,
              top: `${gradcam.attentionCenter.y}%`,
              width: `${gradcam.attentionCenter.radius * 2}%`,
              height: `${gradcam.attentionCenter.radius * 2}%`
            }}
          />

          {/* Top badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur rounded text-[11px] font-medium text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Grad-CAM Activation: {overlayOpacity}%</span>
          </div>
        </div>
      ) : (
        /* Side by Side Split View */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              1. Original Dermoscopy Image
            </p>
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
              <img
                src={originalImageUrl}
                alt="Original"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              2. Neural Attention Heatmap (Grad-CAM)
            </p>
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
              <img
                src={gradcam.overlayUrl || originalImageUrl}
                alt="Attention Map"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Opacity Slider & Colormap Selector (for overlay mode) */}
      {viewMode === 'overlay' && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-600" />
              <span>Heatmap Blend Opacity</span>
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {overlayOpacity}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0% (Original Image)</span>
            <span>50% (Blended)</span>
            <span>100% (Full Heatmap)</span>
          </div>
        </div>
      )}

      {/* Heatmap Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Attention Scale:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Low</span>
            <div className="w-28 sm:w-36 h-2.5 rounded-full bg-linear-to-r from-blue-600 via-yellow-400 to-red-600 shadow-inner" />
            <span className="text-[10px] text-slate-400">High</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 font-mono">
          Layer: conv_head (EfficientNet)
        </span>
      </div>

      {/* Description */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1 text-xs">
        <p className="font-semibold text-slate-800 dark:text-slate-200">
          Morphological Focus Summary
        </p>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {gradcam.attentionSummary}
        </p>
        <p className="text-[11px] text-slate-400 italic pt-1">
          Note: The Grad-CAM heatmap is an algorithmic visual interpretability aid showing pixels that contributed to the mathematical score, not a clinical surgical margin or depth assessment.
        </p>
      </div>

      {/* Fullscreen Inspection Modal */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white">
                  High-Resolution Grad-CAM Inspection
                </h4>
                <p className="text-xs text-slate-400">
                  Target: {categoryName} — Neural Attention Map
                </p>
              </div>
              <button
                onClick={() => setIsFullscreenModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-300">Original Dermatoscopic View</span>
                <div className="aspect-square rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                  <img src={originalImageUrl} alt="Original" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-300">Grad-CAM Overlay Response</span>
                <div className="aspect-square rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                  <img src={gradcam.overlayUrl || originalImageUrl} alt="Grad-CAM" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="text-slate-200 font-semibold">{gradcam.technicalDetails}</p>
              <p>{gradcam.attentionSummary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
