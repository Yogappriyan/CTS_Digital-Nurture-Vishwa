import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Scan, 
  Layers, 
  BarChart3, 
  Eye, 
  CheckCircle2, 
  MessageSquare, 
  ChevronRight, 
  Info,
  Sliders,
  ShieldCheck,
  Zap,
  Activity,
  Code2
} from 'lucide-react';
import { AnalysisResult, HybridPipelineDetails } from '../../types';
import { ResearchScriptsViewer } from './ResearchScriptsViewer';

interface HybridPipelineViewerProps {
  analysis: AnalysisResult;
  onOpenAssistantWithPrompt?: (prompt: string) => void;
}

type TabType = 'preprocessing' | 'pca' | 'localization' | 'classification' | 'benchmarks' | 'scripts';

export const HybridPipelineViewer: React.FC<HybridPipelineViewerProps> = ({
  analysis,
  onOpenAssistantWithPrompt
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('preprocessing');
  const [showBoundingBox, setShowBoundingBox] = useState(true);

  const pipeline = analysis.pipelineDetails;
  if (!pipeline) return null;

  const handleAskBot = (prompt: string) => {
    if (onOpenAssistantWithPrompt) {
      onOpenAssistantWithPrompt(prompt);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500 text-slate-950">
              End-to-End Pipeline
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Hybrid Computer Vision & Explainable AI (XAI) Architecture
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Artifact suppression → MobileNetV2 + PCA → YOLOv4 → XceptionNet + CNN+LSTM → Benchmarks & Grad-CAM
          </p>
        </div>

        <button
          onClick={() => handleAskBot(`Can you give me a comprehensive overview of how this entire hybrid dermatological screening pipeline evaluated my ${analysis.prediction.categoryName} image?`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Consult AI on Full Pipeline</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('preprocessing')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'preprocessing'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>1. Preprocessing (DullRazor & CLAHE)</span>
        </button>

        <button
          onClick={() => setActiveTab('pca')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'pca'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>2. MobileNetV2 & PCA Optimization</span>
        </button>

        <button
          onClick={() => setActiveTab('localization')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'localization'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
          <span>3. YOLOv4 Localization</span>
        </button>

        <button
          onClick={() => setActiveTab('classification')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'classification'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>4. XceptionNet + CNN+LSTM</span>
        </button>

        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'benchmarks'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>5. Quantitative Benchmarks</span>
        </button>

        <button
          onClick={() => setActiveTab('scripts')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'scripts'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>6. Python Pipeline & JSON Schema</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-5">
        {/* TAB 6: Research Scripts */}
        {activeTab === 'scripts' && (
          <ResearchScriptsViewer analysis={analysis} />
        )}
        {/* TAB 1: Preprocessing */}
        {activeTab === 'preprocessing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Image Acquisition & Preprocessing Pipeline
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Eliminates hair occlusions, calibrates illumination spectral biases, and enhances sub-visual texture contrast.
                </p>
              </div>

              <button
                onClick={() => handleAskBot('Explain the Preprocessing stage (DullRazor hair suppression, Gray-World color constancy, and Adaptive CLAHE illumination) in detail.')}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask Assistant about Preprocessing
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Card 1: DullRazor */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Step 1.1
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    {pipeline.preprocessing.artifactSuppression.status}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {pipeline.preprocessing.artifactSuppression.method}
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Applies multi-directional morphological closing filters (0°, 45°, 90°, 135°) with bilinear inpainting to suppress hair shadows without blurring lesion border margins.
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Artifacts Suppressed:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {pipeline.preprocessing.artifactSuppression.hairsDetected} hair shafts
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mask Area Ratio:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {pipeline.preprocessing.artifactSuppression.artifactMaskRatio}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Color Normalization */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Step 1.2
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                    {pipeline.preprocessing.colorNormalization.status}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {pipeline.preprocessing.colorNormalization.method}
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Compensates for varying dermatoscope LED color temperatures ($T_c = 4500K-6500K$) by equalizing the RGB illuminant vector to neutral gray reflectance.
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estimated Illuminant:</span>
                    <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                      [{pipeline.preprocessing.colorNormalization.illuminantRGB.join(', ')}]
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Target Color Space:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">CIE-L*a*b* Standard</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Adaptive CLAHE */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Step 1.3
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
                    Active
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {pipeline.preprocessing.illuminationCorrection.method}
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Performs localized histogram equalization across contextual tiles with contrast clipping to accentuate subtle atypical pigment lattices while avoiding noise amplification.
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tile Grid & Clip Limit:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {pipeline.preprocessing.illuminationCorrection.tileGridSize} (Clip: {pipeline.preprocessing.illuminationCorrection.clipLimit})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Local Contrast Gain:</span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400">
                      {pipeline.preprocessing.illuminationCorrection.contrastGain}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MobileNetV2 + PCA */}
        {activeTab === 'pca' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  MobileNetV2 Feature Extraction & PCA Dimensionality Reduction
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  1280-D raw feature vector projected onto orthogonal eigenspaces to retain {pipeline.featureExtraction.pcaFeatureSelection.varianceRetained}% of diagnostic variance.
                </p>
              </div>

              <button
                onClick={() => handleAskBot('Explain how MobileNetV2 extracts deep features and how PCA optimizes the 1280-D vector into orthogonal principal components.')}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask Assistant about MobileNetV2 & PCA
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Architecture Details */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    MobileNetV2 Backbone
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Uses inverted residual bottleneck blocks with linear shortcuts to capture high-order morphological features with ultra-low latency on edge mobile screening devices.
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Raw Feature Vector:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">1,280 dimensions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Input Resolution:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">224 x 224 x 3 RGB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Optimized PCA Features:</span>
                      <span className="font-mono font-semibold text-teal-600 dark:text-teal-400">64 dimensions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Diagnostic Variance:</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{pipeline.featureExtraction.pcaFeatureSelection.varianceRetained}% preserved</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scree Plot Variance Breakdown */}
              <div className="lg:col-span-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    PCA Scree Decomposition (Top Principal Components)
                  </h5>
                  <span className="text-[10px] text-slate-400">
                    Total Retained: {pipeline.featureExtraction.pcaFeatureSelection.varianceRetained}%
                  </span>
                </div>

                <div className="space-y-2">
                  {pipeline.featureExtraction.pcaFeatureSelection.topComponents.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[70%]">
                          {item.pc}
                        </span>
                        <div className="flex items-center gap-2 text-slate-500 font-mono">
                          <span className="text-teal-600 dark:text-teal-400 font-semibold">{item.varianceExplained}% var</span>
                          <span className="text-[10px] text-slate-400">({item.cumulativeVariance}% cum)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 dark:bg-teal-400 rounded-full"
                          style={{ width: `${(item.varianceExplained / 40) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: YOLOv4 Localization */}
        {activeTab === 'localization' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Scan className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  YOLOv4 Lesion Localization & Boundary Delineation
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  CSPDarknet53 feature pyramid delineates the Region of Interest (ROI) with sub-millimeter precision.
                </p>
              </div>

              <button
                onClick={() => handleAskBot('How does YOLOv4 detect the lesion ROI bounding box and calculate surface area, aspect ratio, and boundary margins?')}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask Assistant about YOLOv4
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Image with bounding box toggle */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 aspect-4/3 flex items-center justify-center">
                <img
                  src={analysis.imageUrl}
                  alt={analysis.title}
                  className="w-full h-full object-cover"
                />

                {showBoundingBox && (
                  <div
                    className="absolute border-2 border-emerald-400 bg-emerald-500/15 shadow-sm transition-all duration-300"
                    style={{
                      top: `${pipeline.localization.boundingBox.ymin * 100}%`,
                      left: `${pipeline.localization.boundingBox.xmin * 100}%`,
                      width: `${(pipeline.localization.boundingBox.xmax - pipeline.localization.boundingBox.xmin) * 100}%`,
                      height: `${(pipeline.localization.boundingBox.ymax - pipeline.localization.boundingBox.ymin) * 100}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1 whitespace-nowrap">
                      <span>YOLOv4 ROI:</span>
                      <span>{(pipeline.localization.detectionConfidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowBoundingBox(!showBoundingBox)}
                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium backdrop-blur-xs border border-white/20 transition-colors"
                >
                  {showBoundingBox ? 'Hide Bounding Box' : 'Show Bounding Box'}
                </button>
              </div>

              {/* Localization Metrics */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Scan className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Morphometric Extraction Outputs
                  </h5>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">Localization Model:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{pipeline.localization.model}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">Detection Confidence:</span>
                      <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                        {(pipeline.localization.detectionConfidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">Intersection over Union (IoU):</span>
                      <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                        {pipeline.localization.iouScore}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">Estimated Lesion Area:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {pipeline.localization.estimatedAreaMm2} mm²
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">Aspect Ratio (Asymmetry):</span>
                      <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                        {pipeline.localization.aspectRatio}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Boundary Margin Delineation:</span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">
                        {pipeline.localization.boundaryMarginScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: XceptionNet + CNN+LSTM */}
        {activeTab === 'classification' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  XceptionNet & Hybrid Recurrent (CNN+LSTM / GRU) Engine
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Depthwise separable convolutions paired with sequential radial texture analysis.
                </p>
              </div>

              <button
                onClick={() => handleAskBot('Explain XceptionNet classification and how the CNN+LSTM/GRU hybrid captures directional spatial texture dependencies across radial slices.')}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask Assistant about XceptionNet
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Spatial Classification
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    36 Depthwise Convolutions
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {pipeline.classificationEngine.fineGrainedModel}
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Decouples cross-channel correlations from 2D spatial correlations, achieving superior multi-class separation across fine-grained dermoscopic lesion sub-types (e.g. NV vs MEL vs BKL vs BCC).
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ensemble Consensus:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {pipeline.classificationEngine.ensembleAgreement}% agreement
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Sequential Texture Modeling
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                    Radial Recurrence
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {pipeline.classificationEngine.recurrentHybrid}
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Captures directional spatial texture dependencies by processing {pipeline.classificationEngine.spatialTextureFeatures.radialSlicesAnalyzed} sequential concentric radial slices from lesion centroid to periphery.
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gradient Entropy:</span>
                    <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                      {pipeline.classificationEngine.spatialTextureFeatures.gradientEntropy}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Texture Alignment:</span>
                    <span className="font-semibold font-mono text-teal-600 dark:text-teal-400">
                      {pipeline.classificationEngine.spatialTextureFeatures.directionalTextureScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Quantitative Benchmarks */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Rigorous Quantitative Evaluation Benchmarks
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Validated against 10,015 multi-source dermoscopy images ({pipeline.benchmarks.benchmarkDataset}).
                </p>
              </div>

              <button
                onClick={() => handleAskBot('Show me the quantitative evaluation benchmarks (Accuracy, Precision, Recall/Sensitivity, Specificity, F1-Score, ROC-AUC) and explain their clinical relevance.')}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask Assistant about Benchmarks
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</span>
                <span className="text-lg sm:text-xl font-extrabold text-teal-600 dark:text-teal-400 font-mono mt-0.5 block">
                  {pipeline.benchmarks.accuracy}%
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Overall 7-class</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Precision</span>
                <span className="text-lg sm:text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-0.5 block">
                  {pipeline.benchmarks.precision}%
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Positive predictive</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sensitivity (Recall)</span>
                <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                  {pipeline.benchmarks.recallSensitivity}%
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">True positive rate</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specificity</span>
                <span className="text-lg sm:text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">
                  {pipeline.benchmarks.specificity}%
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">True negative rate</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">F1-Score</span>
                <span className="text-lg sm:text-xl font-extrabold text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
                  {pipeline.benchmarks.f1Score}%
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Harmonic mean</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ROC-AUC</span>
                <span className="text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
                  {pipeline.benchmarks.rocAuc}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Discriminative area</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
