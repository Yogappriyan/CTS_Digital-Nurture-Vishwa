import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  Sparkles,
  Info,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { analyzeImageQuality } from '../../services/gradcamEngine';
import { ImageMetadata } from '../../types';
import { SAMPLE_DERMOSCOPY_CASES } from '../../services/lesionData';

interface ImageUploaderProps {
  onStartAnalysis: (imageSource: File | string, title?: string, presetCategoryCode?: string) => void;
  isAnalyzing: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onStartAnalysis, isAnalyzing }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [presetCategory, setPresetCategory] = useState<string | undefined>(undefined);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Camera capture states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processSelectedImage = async (fileOrUrl: File | string, presetCode?: string) => {
    setIsValidating(true);
    setValidationError(null);
    try {
      const result = await analyzeImageQuality(fileOrUrl);
      setPreviewUrl(result.dataUrl);
      setMetadata(result.metadata);
      setPresetCategory(presetCode);

      if (typeof fileOrUrl !== 'string') {
        setSelectedFile(fileOrUrl);
        setCustomTitle(fileOrUrl.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      } else {
        setSelectedFile(null);
      }
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to process the selected image.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
        setValidationError('Please upload a valid image file (JPG, PNG, or WEBP).');
        return;
      }
      processSelectedImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
        setValidationError('Please upload a valid image file (JPG, PNG, or WEBP).');
        return;
      }
      processSelectedImage(file);
    }
  };

  const handlePresetSelect = (preset: typeof SAMPLE_DERMOSCOPY_CASES[0]) => {
    setCustomTitle(preset.title);
    processSelectedImage(preset.imageUrl, preset.categoryCode);
  };

  const startCamera = async () => {
    try {
      setValidationError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      setValidationError('Could not access camera. Please check camera permissions or upload an image file.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      stopCamera();
      processSelectedImage(dataUrl);
      setCustomTitle(`Camera Capture ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMetadata(null);
    setPresetCategory(undefined);
    setCustomTitle('');
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLaunchAnalysis = () => {
    if (!previewUrl || !acknowledged) return;
    onStartAnalysis(selectedFile || previewUrl, customTitle || 'Skin Lesion Analysis', presetCategory);
  };

  return (
    <div className="space-y-6">
      {/* Upload or Preview Box */}
      {!previewUrl && !isCameraActive && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-150 ${
              isDragging
                ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/30 ring-4 ring-teal-500/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-teal-500/80 bg-white dark:bg-slate-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner">
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Drop your skin image here, or <span className="text-teal-600 dark:text-teal-400 underline underline-offset-2">browse files</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports JPG, PNG, and WEBP. Recommended size: 500×500px or larger.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCamera();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Use Device Camera</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preset Dermoscopy Test Dataset */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Or Test With Verified Dermoscopy Benchmark Samples
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">ISIC Archive / HAM10000 Cases</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SAMPLE_DERMOSCOPY_CASES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="group relative text-left bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 hover:border-teal-500 dark:hover:border-teal-400 transition-all hover:shadow-sm"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 mb-2">
                    <img
                      src={preset.imageUrl}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {preset.title.split('(')[0]}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      ISIC: {preset.categoryCode.toUpperCase()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camera Live Stream View */}
      {isCameraActive && (
        <div className="bg-slate-950 rounded-2xl p-4 text-center space-y-4 border border-slate-800">
          <div className="relative aspect-video max-h-[380px] mx-auto overflow-hidden rounded-xl bg-black flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-dashed border-teal-400/50 rounded-xl pointer-events-none m-6 flex items-center justify-center">
              <span className="text-xs font-medium text-teal-300 bg-slate-950/80 px-3 py-1 rounded-full backdrop-blur">
                Center lesion in frame under good light
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={capturePhoto}
              className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md hover:bg-teal-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Photo</span>
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Validation / Error Message */}
      {validationError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-xl flex items-start gap-3 text-rose-800 dark:text-rose-300 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="font-semibold">Image Validation Notice</p>
            <p className="text-xs mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      {/* Validated Image Preview & Pre-Screening Summary */}
      {previewUrl && metadata && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Image Ready for Screening
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Image Box */}
            <div className="md:col-span-5 space-y-2">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Uploaded skin lesion"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 backdrop-blur text-[11px] text-white font-mono rounded">
                  {metadata.dimensions.width} × {metadata.dimensions.height}
                </div>
              </div>
              <p className="text-[11px] text-center text-slate-500">
                Target resolution normalized to 224×224 tensor for EfficientNet
              </p>
            </div>

            {/* Right: Quality Assessment & Options */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lesion Label / Note (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Left Forearm Spot (August 2026)"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Quality Meters */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Image Quality Assessment
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    metadata.qualityScore === 'Excellent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    metadata.qualityScore === 'Good' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' :
                    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {metadata.qualityScore} Quality
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500">Sharpness</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{metadata.sharpnessScore}%</p>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500">Contrast</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{metadata.contrastScore}%</p>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500">Illumination</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{metadata.brightnessScore}%</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Image clarity and focus appear suitable for neural network feature extraction.</span>
                </p>
              </div>

              {/* Mandatory Medical Acknowledgment Checkbox */}
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-amber-400 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                    I understand that SkinSight AI is an <strong>AI-assisted screening tool</strong> and <strong>not a medical diagnosis</strong>. I agree to consult a licensed dermatologist for any clinical evaluation or treatment decisions.
                  </span>
                </label>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={!acknowledged || isAnalyzing}
                onClick={handleLaunchAnalysis}
                className={`w-full py-3 px-6 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  acknowledged && !isAnalyzing
                    ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer ring-2 ring-teal-600/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Start AI Analysis</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
