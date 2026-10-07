import React from 'react';
import { 
  Printer, 
  ShieldAlert, 
  ArrowLeft, 
  Cpu, 
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Scan,
  Layers,
  BarChart3
} from 'lucide-react';
import { AnalysisResult, UserProfile } from '../../types';

interface ClinicalReportViewProps {
  analysis: AnalysisResult;
  user: UserProfile;
  onBack: () => void;
  onOpenAssistant: () => void;
}

export const ClinicalReportView: React.FC<ClinicalReportViewProps> = ({
  analysis,
  user,
  onBack,
  onOpenAssistant
}) => {
  const handlePrint = () => {
    window.print();
  };

  const { prediction, gradcam, probabilities, imageMetadata, modelInfo, pipelineDetails } = analysis;

  return (
    <div className="space-y-4 max-w-4xl mx-auto py-2">
      {/* Top action toolbar (hidden on print) */}
      <div className="flex items-center justify-between no-print bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Screening</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAssistant}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Consult Assistant</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Formal Clinical Report Paper Container */}
      <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md space-y-6 font-sans">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl font-black tracking-tight text-slate-900">
                SkinSight <span className="text-teal-700">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-300">
                Clinical Screening Summary
              </span>
            </div>
            <p className="text-xs text-slate-600">
              End-to-End Hybrid Computer Vision & Explainable AI (XAI) Report
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5 text-slate-600 font-mono">
            <p><strong>Report ID:</strong> {analysis.id}</p>
            <p><strong>Date:</strong> {new Date(analysis.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Framework:</strong> MobileNetV2 + PCA + YOLOv4 + XceptionNet</p>
          </div>
        </div>

        {/* Patient & Examination Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Patient / User</span>
            <p className="font-bold text-slate-900">{user.name}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Target Title</span>
            <p className="font-bold text-slate-900 truncate">{analysis.title}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Image Shape</span>
            <p className="font-bold text-slate-900 font-mono">{imageMetadata.dimensions.width} × {imageMetadata.dimensions.height} ({imageMetadata.format})</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Status</span>
            <p className="font-bold text-teal-800">{analysis.status}</p>
          </div>
        </div>

        {/* Primary Classification Result */}
        <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Primary Classification Output
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                {prediction.categoryName}
              </h2>
              <p className="text-xs font-medium text-slate-700">
                {prediction.clinicalName} ({prediction.riskLevel.toUpperCase()})
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500">Confidence</span>
                <p className="text-xl font-black text-slate-900 font-mono">
                  {(prediction.confidence * 100).toFixed(1)}%
                </p>
                <span className="text-[9px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                  {prediction.confidenceLabel} Confidence
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed pt-2 border-t border-slate-200">
            {prediction.summary}
          </p>
        </div>

        {/* Hybrid Pipeline Technical Verification */}
        {pipelineDetails && (
          <div className="space-y-2.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-teal-700" />
              Hybrid Computer Vision Pipeline Specifications
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">1. Preprocessing</span>
                <p className="font-semibold text-slate-800">DullRazor & CLAHE</p>
                <p className="text-slate-500 text-[10px]">{pipelineDetails.preprocessing.artifactSuppression.hairsDetected} hairs suppressed, {pipelineDetails.preprocessing.illuminationCorrection.contrastGain}</p>
              </div>

              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">2. MobileNetV2 + PCA</span>
                <p className="font-semibold text-slate-800">64-D PCA Features</p>
                <p className="text-slate-500 text-[10px]">{pipelineDetails.featureExtraction.pcaFeatureSelection.varianceRetained}% variance retained (1280-D vector)</p>
              </div>

              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">3. YOLOv4 Localization</span>
                <p className="font-semibold text-slate-800">ROI Detected ({(pipelineDetails.localization.detectionConfidence * 100).toFixed(1)}%)</p>
                <p className="text-slate-500 text-[10px]">Area: {pipelineDetails.localization.estimatedAreaMm2} mm² • Margin: {pipelineDetails.localization.boundaryMarginScore}</p>
              </div>

              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">4. XceptionNet + CNN+LSTM</span>
                <p className="font-semibold text-slate-800">Sequential Spatial Modeling</p>
                <p className="text-slate-500 text-[10px]">{pipelineDetails.classificationEngine.ensembleAgreement}% agreement • 16 radial slices</p>
              </div>
            </div>

            {/* Benchmark row */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-600 gap-2">
              <span><strong>Benchmarked Metrics:</strong></span>
              <span>Acc: <strong>{pipelineDetails.benchmarks.accuracy}%</strong></span>
              <span>Prec: <strong>{pipelineDetails.benchmarks.precision}%</strong></span>
              <span>Sens: <strong>{pipelineDetails.benchmarks.recallSensitivity}%</strong></span>
              <span>Spec: <strong>{pipelineDetails.benchmarks.specificity}%</strong></span>
              <span>F1: <strong>{pipelineDetails.benchmarks.f1Score}%</strong></span>
              <span>ROC-AUC: <strong>{pipelineDetails.benchmarks.rocAuc}</strong></span>
            </div>
          </div>
        )}

        {/* Visual Inspection & Explainability */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Dermoscopic Imagery & Grad-CAM Visual Attention
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-700">Figure 1A: Original Lesion</span>
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={analysis.imageUrl}
                  alt="Original lesion"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-700">Figure 1B: Grad-CAM Activation Map</span>
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={gradcam.overlayUrl || analysis.imageUrl}
                  alt="Grad-CAM Overlay"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 italic">
            <strong>Grad-CAM Finding:</strong> {gradcam.attentionSummary}
          </p>
        </div>

        {/* Probability Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Multi-Class Probability Distribution (ISIC / HAM10000)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border-b border-slate-200">Category</th>
                  <th className="p-2 border-b border-slate-200">Classification</th>
                  <th className="p-2 border-b border-slate-200 text-right">Probability</th>
                  <th className="p-2 border-b border-slate-200 w-1/3">Bar Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {probabilities.map((p, idx) => (
                  <tr key={p.categoryCode} className={idx === 0 ? 'bg-teal-50/50 font-semibold' : ''}>
                    <td className="p-2 font-mono">{p.categoryCode.toUpperCase()}</td>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2 text-right font-mono">{p.percentage}%</td>
                    <td className="p-2">
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${idx === 0 ? 'bg-teal-700' : 'bg-slate-500'}`}
                          style={{ width: `${Math.max(2, p.percentage)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommended Questions for Physician */}
        <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <h4 className="font-bold text-slate-900">Suggested Questions for Clinical Consultation</h4>
          <ul className="list-disc list-inside space-y-0.5 text-slate-700">
            <li>Does this lesion require full in-person physical dermatoscopy or dermoscopic epiluminescence?</li>
            <li>Are there atypical structural patterns (e.g. pigment variegation, regression, or atypical network) warranting biopsy?</li>
            <li>Should this spot be mapped with sequential digital photography at 3-month intervals?</li>
          </ul>
        </div>

        {/* Mandatory Safety Notice & Sign-off Block */}
        <div className="pt-3 border-t-2 border-slate-900 space-y-3">
          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2 text-xs text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Medical Disclaimer:</strong> This report is generated by an automated AI screening model (MobileNetV2 + PCA + YOLOv4 + XceptionNet & CNN+LSTM hybrid architecture). It is intended strictly for screening triage and patient education. <strong>It does NOT establish a medical diagnosis or replace physical histopathological biopsy.</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-3 text-xs">
            <div className="border-t border-slate-300 pt-1.5">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Patient / User Acknowledgment</span>
              <p className="mt-3 font-mono text-[11px] text-slate-700">Electronically verified by user</p>
            </div>
            <div className="border-t border-slate-300 pt-1.5">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Reviewing Clinician Sign-off</span>
              <p className="mt-3 font-mono text-[11px] text-slate-400">Date: ______________ &nbsp; Sig: __________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
