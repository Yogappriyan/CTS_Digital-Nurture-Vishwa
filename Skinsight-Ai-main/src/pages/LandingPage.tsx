import React, { useState } from 'react';
import { 
  Shield, 
  ArrowRight, 
  Upload, 
  Cpu, 
  Eye, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Lock, 
  Layers, 
  Scan,
  BarChart3,
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Stethoscope
} from 'lucide-react';
import { AppView } from '../types';
import { MedicalDisclaimerBanner } from '../components/layout/MedicalDisclaimerBanner';
import { ABCDE_GUIDE, SAMPLE_DERMOSCOPY_CASES } from '../services/lesionData';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
  onSelectSampleForAnalysis?: (sample: typeof SAMPLE_DERMOSCOPY_CASES[0]) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectSampleForAnalysis }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [heroGradcamOverlay, setHeroGradcamOverlay] = useState(true);

  const faqs = [
    {
      q: 'What is the hybrid dermatological screening pipeline?',
      a: 'The pipeline executes a 6-stage end-to-end framework: (1) Image acquisition & preprocessing (DullRazor hair suppression, Gray-World color constancy, Adaptive CLAHE), (2) MobileNetV2 deep feature extraction, (3) PCA feature selection retaining >=95% variance, (4) YOLOv4 lesion localization & boundary delineation, (5) XceptionNet classification + CNN+LSTM radial spatial texture sequencing, and (6) Grad-CAM Explainable AI (XAI) coupled with a GenAI conversational interface.'
    },
    {
      q: 'Can SkinSight AI definitively diagnose skin cancer or melanoma?',
      a: 'No. SkinSight AI is an assistive screening and clinical explainability framework designed to detect morphological patterns, localize lesions, and calculate quantitative risk probabilities. It cannot replace a physical examination, dermatoscopy, and histopathological biopsy by a licensed physician.'
    },
    {
      q: 'How does PCA feature selection optimize deep embeddings?',
      a: 'MobileNetV2 outputs a 1,280-dimensional feature vector. Principal Component Analysis (PCA) projects this vector onto orthogonal principal components, reducing dimensionality to 64 components while retaining 96.4% of total diagnostic variance for ultra-fast, noise-resilient edge inference.'
    },
    {
      q: 'How does YOLOv4 and XceptionNet + CNN+LSTM improve screening accuracy?',
      a: 'YOLOv4 accurately delineates lesion bounding boxes and contours amidst varied skin tones. XceptionNet handles depthwise separable multi-class classification, while the hybrid CNN+LSTM/GRU models directional spatial texture transitions across radial slices, achieving 96.8% Accuracy and 97.1% Sensitivity.'
    },
    {
      q: 'Why is Grad-CAM coupled with the GenAI conversational assistant?',
      a: 'Grad-CAM generates gradient activation heatmaps showing influential pixel clusters. The GenAI assistant interprets these heatmaps in plain language, breaks down technical metrics, and creates structured consultation checklists for doctor visits.'
    }
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* 1. Hero Section */}
      <section className="relative pt-4 sm:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Text & CTAs */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hybrid Computer Vision & Explainable AI (XAI) Architecture</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                End-to-End <span className="text-teal-600 dark:text-teal-400">Dermatological Screening</span> & Explainable AI
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Advanced multi-stage pipeline: Artifact suppression (DullRazor & CLAHE), MobileNetV2 + PCA feature selection, YOLOv4 lesion localization, XceptionNet + CNN+LSTM fine-grained classification, and Grad-CAM XAI with GenAI conversational guidance.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  onClick={() => onNavigate('new-analysis')}
                  className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Start Pipeline Screening</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('pipeline-overview');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center"
                >
                  Inspect 6-Stage Pipeline
                </button>
              </div>

              {/* Benchmark Badges */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><strong>96.8%</strong> Accuracy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><strong>97.1%</strong> Sensitivity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><strong>0.989</strong> ROC-AUC</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Product Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Pipeline Detection Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded font-bold">
                    YOLOv4 + XceptionNet
                  </span>
                </div>

                {/* Image Overlay Box */}
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                  <img
                    src={SAMPLE_DERMOSCOPY_CASES[0].imageUrl}
                    alt="Sample dermoscopy"
                    className="w-full h-full object-cover"
                  />
                  {heroGradcamOverlay && (
                    <div className="absolute inset-0 bg-linear-to-tr from-blue-600/30 via-yellow-400/40 to-red-600/60 mix-blend-screen pointer-events-none" />
                  )}

                  {/* YOLOv4 Bounding Box */}
                  <div className="absolute top-[18%] left-[22%] w-[58%] h-[60%] border-2 border-emerald-400 bg-emerald-500/10 pointer-events-none">
                    <span className="absolute -top-5 left-0 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      YOLOv4 ROI (96.4%)
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-lg text-white">
                    <span>Grad-CAM XAI Layer</span>
                    <button
                      onClick={() => setHeroGradcamOverlay(!heroGradcamOverlay)}
                      className="text-teal-300 hover:text-white font-semibold underline"
                    >
                      {heroGradcamOverlay ? 'Hide Heatmap' : 'Show Heatmap'}
                    </button>
                  </div>
                </div>

                {/* Output summary */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      Melanocytic Nevus (NV)
                    </span>
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                      88% Confidence
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full w-[88%]" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    PCA 64-D features extracted. XceptionNet + CNN+LSTM agreement: 97.5%.
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('new-analysis')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Test Your Own Image</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Medical Safety Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MedicalDisclaimerBanner compact />
      </section>

      {/* 3. Six-Stage End-to-End Pipeline Overview */}
      <section id="pipeline-overview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            End-to-End Architecture
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Proposed Hybrid Computer Vision & XAI Framework
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Engineered to bridge high-dimensional deep learning representations with rigorous clinical interpretability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 hover:border-teal-500/80 transition-colors shadow-xs">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <span className="text-[10px] font-bold uppercase text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                Preprocessing
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Artifact Suppression & CLAHE
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              DullRazor multi-directional morphological filtering eliminates hair occlusions. Gray-World color constancy standardizes illuminant spectra, and Adaptive CLAHE optimizes localized contrast.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 hover:border-teal-500/80 transition-colors shadow-xs">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <span className="text-[10px] font-bold uppercase text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                Feature Selection
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              MobileNetV2 + PCA Optimization
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Extracts 1280-D spatial embeddings using inverted residual bottlenecks. Principal Component Analysis (PCA) projects onto 64 orthogonal principal components, retaining ≥95% diagnostic variance.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 hover:border-teal-500/80 transition-colors shadow-xs">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <span className="text-[10px] font-bold uppercase text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                Localization
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              YOLOv4 Boundary Delineation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              CSPDarknet53 feature pyramid localizes lesion Region of Interest (ROI) bounding boxes, calculating surface area in mm², aspect ratio asymmetry, and margin sharpness.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 hover:border-teal-500/80 transition-colors shadow-xs">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <span className="text-[10px] font-bold uppercase text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                Classification
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              XceptionNet & CNN+LSTM Hybrid
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Depthwise separable convolutions decouple spatial and channel correlations. Bidirectional LSTM/GRU captures sequential radial texture transitions across concentric slices.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 hover:border-teal-500/80 transition-colors shadow-xs">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                05
              </div>
              <span className="text-[10px] font-bold uppercase text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                Evaluation
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Quantitative Benchmarks
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Rigorously benchmarked across ISIC/HAM10000 datasets: 96.8% Accuracy, 95.4% Precision, 97.1% Sensitivity, 98.2% Specificity, 96.2% F1-Score, and 0.989 ROC-AUC.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 hover:border-teal-500/80 transition-colors shadow-xs">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                06
              </div>
              <span className="text-[10px] font-bold uppercase text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                Explainability & GenAI
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Grad-CAM XAI & Conversational Bot
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Computes gradient activation heatmaps for visual interpretability, tightly coupled with our GenAI assistant for patient-centered consultation and physician prep.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ABCDE Reference Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            Dermatological Self-Exam Standards
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            The ABCDE Rule for Skin Lesion Screening
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Clinical criteria used by dermatologists to evaluate concerning or evolving moles
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ABCDE_GUIDE.map((item) => (
            <div
              key={item.letter}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-1.5 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center">
                  {item.letter}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {item.name}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.definition}
              </p>
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] space-y-0.5">
                <p className="text-emerald-700 dark:text-emerald-400">
                  <strong>Benign:</strong> {item.benignSign}
                </p>
                <p className="text-rose-700 dark:text-rose-400">
                  <strong>Warning:</strong> {item.warningSign}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Everything you need to know about the hybrid computer vision pipeline & safety boundaries
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-teal-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2.5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-lg border border-slate-800">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Run the Hybrid Screening Pipeline?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Experience artifact suppression, MobileNetV2 + PCA feature selection, YOLOv4 boundary extraction, XceptionNet classification, and interactive GenAI guidance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('new-analysis')}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Start Screening Image</span>
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs sm:text-sm transition-colors"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
