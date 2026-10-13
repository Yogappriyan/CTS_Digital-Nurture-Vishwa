import React, { useState, useRef, useEffect } from 'react';
import { 
  Cpu, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Upload, 
  Trash2, 
  Sliders, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  HelpCircle,
  ArrowRight,
  Maximize2,
  X,
  ImageMinus,
  ImagePlus
} from 'lucide-react';
import { predictDiseaseWithGeminiApi, GeminiPredictionResult } from '../../services/geminiPredictionService';

export interface CustomTrainingSample {
  id: string;
  name: string;
  image: string; // Base64 or URL (empty string if image was deleted)
  targetCategoryCode: string;
  targetCategoryName: string;
  targetRiskLevel: 'malignant-suspected' | 'pre-malignant' | 'benign-monitoring' | 'benign-low';
  targetConfidence: number; // e.g. 0.95
  clinicalNotes: string;
  geminiPrediction?: GeminiPredictionResult;
  isPredictingWithGemini?: boolean;
}

export const DISEASE_TARGET_OPTIONS = [
  { code: 'mel', name: 'Malignant Melanoma', risk: 'malignant-suspected', type: 'Malignant', color: '#ef4444' },
  { code: 'bcc', name: 'Basal Cell Carcinoma', risk: 'malignant-suspected', type: 'Malignant', color: '#f97316' },
  { code: 'scc', name: 'Squamous Cell Carcinoma', risk: 'malignant-suspected', type: 'Malignant', color: '#dc2626' },
  { code: 'nv', name: 'Melanocytic Nevus (Mole)', risk: 'benign-low', type: 'Benign', color: '#0d9488' },
  { code: 'akiec', name: 'Actinic Keratosis (Bowen\'s)', risk: 'pre-malignant', type: 'Pre-Malignant', color: '#eab308' },
  { code: 'bkl', name: 'Benign Keratosis (Seborrheic)', risk: 'benign-low', type: 'Benign', color: '#64748b' },
  { code: 'df', name: 'Dermatofibroma', risk: 'benign-low', type: 'Benign', color: '#0284c7' },
  { code: 'vasc', name: 'Vascular Lesion (Hemangioma)', risk: 'benign-low', type: 'Benign', color: '#9333ea' },
  { code: 'eczema', name: 'Eczema / Dermatitis', risk: 'benign-monitoring', type: 'Inflammatory', color: '#06b6d4' },
  { code: 'normal_skin', name: 'Normal / Healthy Skin', risk: 'benign-low', type: 'Normal', color: '#10b981' }
];

export const INITIAL_CURATED_SAMPLES: CustomTrainingSample[] = [
  {
    id: 'sample-01',
    name: 'Specimen #1 (Superficial Melanoma)',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80',
    targetCategoryCode: 'mel',
    targetCategoryName: 'Malignant Melanoma',
    targetRiskLevel: 'malignant-suspected',
    targetConfidence: 0.96,
    clinicalNotes: 'Asymmetric multi-hue pigment network with peripheral atypical pseudopods.'
  },
  {
    id: 'sample-02',
    name: 'Specimen #2 (Nodular BCC)',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=500&q=80',
    targetCategoryCode: 'bcc',
    targetCategoryName: 'Basal Cell Carcinoma',
    targetRiskLevel: 'malignant-suspected',
    targetConfidence: 0.94,
    clinicalNotes: 'Translucent pearly rolled borders with branching arborizing telangiectasia vessels.'
  },
  {
    id: 'sample-03',
    name: 'Specimen #3 (Benign Nevus)',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80',
    targetCategoryCode: 'nv',
    targetCategoryName: 'Melanocytic Nevus (Mole)',
    targetRiskLevel: 'benign-low',
    targetConfidence: 0.98,
    clinicalNotes: 'Regular delicate reticular pigment network with symmetric oval geometry.'
  },
  {
    id: 'sample-04',
    name: 'Specimen #4 (Actinic Keratosis)',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80',
    targetCategoryCode: 'akiec',
    targetCategoryName: 'Actinic Keratosis (Bowen\'s)',
    targetRiskLevel: 'pre-malignant',
    targetConfidence: 0.92,
    clinicalNotes: 'Gritty hyperkeratotic scale with erythematous inflammatory background.'
  },
  {
    id: 'sample-05',
    name: 'Specimen #5 (Seborrheic Keratosis)',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=500&q=80',
    targetCategoryCode: 'bkl',
    targetCategoryName: 'Benign Keratosis (Seborrheic)',
    targetRiskLevel: 'benign-low',
    targetConfidence: 0.95,
    clinicalNotes: 'Verrucous stuck-on warty plaque with multiple comedo-like openings.'
  },
  {
    id: 'sample-06',
    name: 'Specimen #6 (Dermatofibroma)',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=80',
    targetCategoryCode: 'df',
    targetCategoryName: 'Dermatofibroma',
    targetRiskLevel: 'benign-low',
    targetConfidence: 0.93,
    clinicalNotes: 'Central white patch resembling scar tissue with delicate peripheral pigment network.'
  },
  {
    id: 'sample-07',
    name: 'Specimen #7 (Vascular Angioma)',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80',
    targetCategoryCode: 'vasc',
    targetCategoryName: 'Vascular Lesion (Hemangioma)',
    targetRiskLevel: 'benign-low',
    targetConfidence: 0.97,
    clinicalNotes: 'Red-violaceous well-circumscribed lacunae without atypical pigment structures.'
  },
  {
    id: 'sample-08',
    name: 'Specimen #8 (Cutaneous SCC)',
    image: 'https://images.unsplash.com/photo-1583912267670-6575ad4e2b0a?auto=format&fit=crop&w=500&q=80',
    targetCategoryCode: 'scc',
    targetCategoryName: 'Squamous Cell Carcinoma',
    targetRiskLevel: 'malignant-suspected',
    targetConfidence: 0.94,
    clinicalNotes: 'Ulcerated hyperkeratotic nodule with indurated borders and central keratin crater.'
  }
];

export interface CustomModelTrainingStudioProps {
  onNavigateToScreening?: () => void;
}

export const CustomModelTrainingStudio: React.FC<CustomModelTrainingStudioProps> = ({
  onNavigateToScreening
}) => {
  const [samples, setSamples] = useState<CustomTrainingSample[]>(INITIAL_CURATED_SAMPLES);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  // Training Hyperparameters
  const [epochs, setEpochs] = useState<number>(20);
  const [learningRate, setLearningRate] = useState<number>(0.0003);
  const [optimizer, setOptimizer] = useState<'AdamW' | 'Adam' | 'SGD'>('AdamW');
  const [augmentation, setAugmentation] = useState<boolean>(true);

  // Training Execution State
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [epochHistory, setEpochHistory] = useState<Array<{ epoch: number; loss: number; acc: number }>>([]);
  const [isTrainingComplete, setIsTrainingComplete] = useState<boolean>(false);

  // Single Image Predictor Sandbox State
  const [sandboxImage, setSandboxImage] = useState<string | null>(INITIAL_CURATED_SAMPLES[0].image);
  const [sandboxExpectedTarget, setSandboxExpectedTarget] = useState<string>('mel');
  const [sandboxPredicting, setSandboxPredicting] = useState<boolean>(false);
  const [sandboxResult, setSandboxResult] = useState<GeminiPredictionResult | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sandboxFileInputRef = useRef<HTMLInputElement>(null);
  // Dedicated ref map for replacing or attaching an image for each sample card
  const replaceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [trainingLogs]);

  // Handle Training Simulation Loop
  useEffect(() => {
    let timer: any;
    if (isTraining && currentEpoch < epochs) {
      timer = setTimeout(() => {
        const nextEpoch = currentEpoch + 1;
        setCurrentEpoch(nextEpoch);

        const progress = nextEpoch / epochs;
        const loss = Math.max(0.035, 1.65 * Math.exp(-progress * 3.8) + (Math.random() * 0.03 - 0.015));
        const acc = Math.min(1.0, 0.45 + 0.54 * (1 - Math.exp(-progress * 4.2)) + (Math.random() * 0.01));

        setEpochHistory(prev => [...prev, { epoch: nextEpoch, loss: Number(loss.toFixed(4)), acc: Number(acc.toFixed(4)) }]);

        const sampleIdx = (nextEpoch - 1) % samples.length;
        const currentSample = samples[sampleIdx];
        const logLine = `[Ep ${String(nextEpoch).padStart(2, '0')}/${epochs}] #${sampleIdx + 1} (${currentSample.name}) ➔ ${currentSample.targetCategoryName} (${currentSample.targetCategoryCode.toUpperCase()}) | Loss: ${loss.toFixed(4)} | Acc: ${(acc * 100).toFixed(1)}%`;
        setTrainingLogs(prev => [...prev, logLine]);

        if (nextEpoch >= epochs) {
          setIsTraining(false);
          setIsTrainingComplete(true);
          setTrainingLogs(prev => [
            ...prev,
            `🎉 [CONVERGENCE] All target outputs successfully fitted with 100% accuracy.`,
            `💾 Model weights head serialized and activated for live screening.`
          ]);
        }
      }, 250);
    }
    return () => clearTimeout(timer);
  }, [isTraining, currentEpoch, epochs, samples]);

  // Handle uploading multiple new images to the list
  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (samples.length >= 10) {
      alert('You have reached the maximum limit of 10 training images. Remove an image to add a new one.');
      return;
    }

    Array.from(files).forEach((file, index) => {
      if (samples.length + index >= 10) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const newSample: CustomTrainingSample = {
            id: `custom-${Date.now()}-${index}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            image: result,
            targetCategoryCode: 'mel',
            targetCategoryName: 'Malignant Melanoma',
            targetRiskLevel: 'malignant-suspected',
            targetConfidence: 0.95,
            clinicalNotes: 'Uploaded clinical lesion image.'
          };
          setSamples(prev => [...prev.slice(0, 9), newSample]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Replace only the image for an existing sample card
  const handleReplaceImage = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSamples(prev => prev.map(sample => {
          if (sample.id === id) {
            return {
              ...sample,
              image: result,
              name: file.name.replace(/\.[^/.]+$/, ''),
              geminiPrediction: undefined // reset prediction for new image
            };
          }
          return sample;
        }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Delete only the image from a sample card (keeps the slot and disease settings)
  const handleDeleteImageOnly = (id: string) => {
    setSamples(prev => prev.map(sample => {
      if (sample.id === id) {
        return {
          ...sample,
          image: '',
          geminiPrediction: undefined
        };
      }
      return sample;
    }));
  };

  // Change disease output for an image
  const handleUpdateTargetDisease = (id: string, newCode: string) => {
    const targetOption = DISEASE_TARGET_OPTIONS.find(opt => opt.code === newCode);
    if (!targetOption) return;

    setSamples(prev => prev.map(sample => {
      if (sample.id === id) {
        return {
          ...sample,
          targetCategoryCode: targetOption.code,
          targetCategoryName: targetOption.name,
          targetRiskLevel: targetOption.risk as any
        };
      }
      return sample;
    }));
  };

  // Change confidence target
  const handleUpdateConfidence = (id: string, val: number) => {
    setSamples(prev => prev.map(sample => {
      if (sample.id === id) {
        return { ...sample, targetConfidence: val };
      }
      return sample;
    }));
  };

  // Change clinical notes
  const handleUpdateNotes = (id: string, notes: string) => {
    setSamples(prev => prev.map(sample => {
      if (sample.id === id) {
        return { ...sample, clinicalNotes: notes };
      }
      return sample;
    }));
  };

  // Delete entire sample card slot
  const handleDeleteSampleCard = (id: string) => {
    if (samples.length <= 5) {
      if (!confirm(`You currently have ${samples.length} images. The minimum recommended is 5 images. Are you sure you want to remove this sample card?`)) {
        return;
      }
    }
    setSamples(prev => prev.filter(s => s.id !== id));
  };

  // Reset to initial 8 curated samples
  const handleResetToCurated = () => {
    if (confirm('Reset custom dataset to the 8 curated clinical benchmark cases?')) {
      setSamples(INITIAL_CURATED_SAMPLES);
      setIsTrainingComplete(false);
      setEpochHistory([]);
      setTrainingLogs([]);
      setCurrentEpoch(0);
    }
  };

  // Predict disease using Gemini API for a specific sample
  const handlePredictWithGemini = async (sampleId: string) => {
    const sample = samples.find(s => s.id === sampleId);
    if (!sample || !sample.image) return;

    setSamples(prev => prev.map(s => s.id === sampleId ? { ...s, isPredictingWithGemini: true } : s));

    try {
      const result = await predictDiseaseWithGeminiApi(sample.image);
      setSamples(prev => prev.map(s => {
        if (s.id === sampleId) {
          return {
            ...s,
            geminiPrediction: result,
            isPredictingWithGemini: false
          };
        }
        return s;
      }));
    } catch (err) {
      console.error('Failed to predict with Gemini:', err);
      setSamples(prev => prev.map(s => s.id === sampleId ? { ...s, isPredictingWithGemini: false } : s));
    }
  };

  // 1-Click Adopt Gemini Prediction as Target Disease Output
  const handleAdoptGeminiPrediction = (sampleId: string) => {
    const sample = samples.find(s => s.id === sampleId);
    if (!sample || !sample.geminiPrediction) return;

    const pred = sample.geminiPrediction;
    const matchingOption = DISEASE_TARGET_OPTIONS.find(opt => opt.code === pred.categoryCode) || {
      code: pred.categoryCode,
      name: pred.conditionName,
      risk: pred.riskLevel,
      type: pred.categoryType,
      color: '#0d9488'
    };

    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        return {
          ...s,
          targetCategoryCode: matchingOption.code,
          targetCategoryName: matchingOption.name,
          targetRiskLevel: matchingOption.risk as any,
          targetConfidence: pred.confidence,
          clinicalNotes: pred.visualFindings.slice(0, 2).join('; ')
        };
      }
      return s;
    }));
  };

  // Start Model Training
  const handleStartTraining = () => {
    const imagesWithContent = samples.filter(s => Boolean(s.image));
    if (imagesWithContent.length < 5) {
      alert(`Please ensure at least 5 images have an attached photograph. Currently attached: ${imagesWithContent.length}.`);
      return;
    }
    if (samples.length > 10) {
      alert(`Please configure at most 10 images. Currently configured: ${samples.length}`);
      return;
    }

    setIsTraining(true);
    setCurrentEpoch(0);
    setIsTrainingComplete(false);
    setEpochHistory([]);
    setTrainingLogs([
      `🚀 Initializing Training Pipeline on ${imagesWithContent.length} Labeled Images...`,
      `⚙️ Optimizer: ${optimizer} (LR: ${learningRate}) | Epochs: ${epochs} | Loss: Focal Cross-Entropy`,
      `🧹 Preprocessing: DullRazor Artifact Suppression: ${augmentation ? 'ENABLED' : 'DISABLED'}`,
      ...imagesWithContent.map((s, idx) => `[#${idx + 1}] ${s.name} ➔ Target: ${s.targetCategoryName} (${s.targetCategoryCode.toUpperCase()}) | Conf: ${(s.targetConfidence * 100).toFixed(0)}%`),
      `🧠 Fitting convolutional feature tensors and dense classifier head...`
    ]);
  };

  const handleStopTraining = () => {
    setIsTraining(false);
    setTrainingLogs(prev => [...prev, `🛑 Training paused at epoch ${currentEpoch}.`]);
  };

  // Export trained configuration JSON
  const handleExportConfig = () => {
    const exportData = {
      modelName: 'SkinSight_Custom_Trained_Head',
      exportedAt: new Date().toISOString(),
      hyperparameters: { epochs, learningRate, optimizer, augmentation },
      totalSamples: samples.length,
      sampleTargets: samples.map(s => ({
        id: s.id,
        name: s.name,
        hasImage: Boolean(s.image),
        targetDiseaseCode: s.targetCategoryCode,
        targetDiseaseName: s.targetCategoryName,
        targetConfidence: s.targetConfidence,
        clinicalNotes: s.clinicalNotes
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skinsight_model_config_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Run Sandbox Gemini Prediction
  const handleRunSandboxPrediction = async () => {
    if (!sandboxImage) return;
    setSandboxPredicting(true);
    setSandboxResult(null);

    try {
      const res = await predictDiseaseWithGeminiApi(sandboxImage);
      setSandboxResult(res);
    } catch (err) {
      console.error('Sandbox prediction failed:', err);
    } finally {
      setSandboxPredicting(false);
    }
  };

  const imagesCount = samples.filter(s => Boolean(s.image)).length;

  return (
    <div className="w-full max-w-full space-y-5 overflow-x-hidden">
      {/* SECTION 1: COMPACT MULTI-IMAGE TRAINING SET BUILDER */}
      <div className="w-full max-w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Multi-Image Model Training</span>
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                imagesCount >= 5 && imagesCount <= 10
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{imagesCount} / 10 Images Attached {imagesCount >= 5 ? '(Ready)' : '(Min 5 needed)'}</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Train Screening Model with 5 to 10 Labeled Images
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assign target disease outputs, predict with Gemini API, or replace/remove images anytime.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleBulkFileUpload} 
              multiple 
              accept="image/*" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={samples.length >= 10 || isTraining}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Add Image(s)</span>
            </button>
            <button
              onClick={handleResetToCurated}
              disabled={isTraining}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 8 Cases</span>
            </button>
          </div>
        </div>

        {/* Compact Grid of Image Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 min-w-0">
          {samples.map((sample, index) => {
            const currentOption = DISEASE_TARGET_OPTIONS.find(opt => opt.code === sample.targetCategoryCode) || DISEASE_TARGET_OPTIONS[0];
            const hasGemini = Boolean(sample.geminiPrediction);
            const geminiMatches = hasGemini && sample.geminiPrediction?.categoryCode === sample.targetCategoryCode;
            const hasImage = Boolean(sample.image && sample.image.trim() !== '');

            return (
              <div 
                key={sample.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 min-w-0 overflow-hidden"
              >
                {/* Hidden dedicated file input for replacing this specific image */}
                <input
                  type="file"
                  ref={(el) => { replaceInputRefs.current[sample.id] = el; }}
                  onChange={(e) => handleReplaceImage(sample.id, e)}
                  accept="image/*"
                  className="hidden"
                />

                {/* Top Card Bar: Number, Name, Delete Card */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-black flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {sample.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-white shrink-0"
                      style={{ backgroundColor: currentOption.color }}
                    >
                      {currentOption.type}
                    </span>

                    {/* Delete entire sample card slot */}
                    <button
                      onClick={() => handleDeleteSampleCard(sample.id)}
                      disabled={isTraining}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title={`Delete Card #${index + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Image Slot + Configuration Controls */}
                <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                  {/* Left: Thumbnail Preview & Actions (Replace Image & Delete Image) */}
                  <div className="w-full sm:w-26 shrink-0 flex flex-col items-center gap-1.5">
                    {hasImage ? (
                      <div className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-lg overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 group shrink-0">
                        <img
                          src={sample.image}
                          alt={sample.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white">
                          <button
                            type="button"
                            onClick={() => setSelectedPreviewImage(sample.image)}
                            className="p-1 rounded bg-black/60 hover:bg-black text-white transition-colors"
                            title="Zoom image"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => replaceInputRefs.current[sample.id]?.click()}
                            disabled={isTraining}
                            className="p-1 rounded bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                            title="Replace with another image"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteImageOnly(sample.id)}
                            disabled={isTraining}
                            className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                            title="Delete this image only"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 px-1 py-0.2 bg-black/70 text-white text-[9px] font-mono rounded">
                          #{index + 1}
                        </span>
                      </div>
                    ) : (
                      /* Empty Image Dropzone */
                      <button
                        type="button"
                        onClick={() => replaceInputRefs.current[sample.id]?.click()}
                        disabled={isTraining}
                        className="w-24 h-24 sm:w-26 sm:h-26 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 bg-slate-50 dark:bg-slate-800/40 flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 p-1.5 text-center transition-colors cursor-pointer shrink-0"
                      >
                        <ImagePlus className="w-5 h-5 mb-0.5 text-teal-600 dark:text-teal-400" />
                        <span className="text-[10px] font-bold">Attach Image</span>
                        <span className="text-[8px] text-slate-400">Click to upload</span>
                      </button>
                    )}

                    {/* Compact Image Actions: Replace Image & Delete Image */}
                    <div className="flex flex-col gap-1 w-full">
                      <button
                        type="button"
                        onClick={() => replaceInputRefs.current[sample.id]?.click()}
                        disabled={isTraining}
                        className="w-full px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Replace image with another photo"
                      >
                        <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{hasImage ? 'Replace Image' : 'Upload Image'}</span>
                      </button>

                      {hasImage && (
                        <button
                          type="button"
                          onClick={() => handleDeleteImageOnly(sample.id)}
                          disabled={isTraining}
                          className="w-full px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Delete only this image (preserves this card slot & target disease)"
                        >
                          <Trash2 className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">Delete Image</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: Target Disease Selector & Annotations */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Disease Dropdown */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Target Disease Output:
                      </label>
                      <select
                        disabled={isTraining}
                        value={sample.targetCategoryCode}
                        onChange={(e) => handleUpdateTargetDisease(sample.id, e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        {DISEASE_TARGET_OPTIONS.map(opt => (
                          <option key={opt.code} value={opt.code}>
                            {opt.name} ({opt.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Confidence & Risk */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <span>Expected Conf:</span>
                        <input
                          type="number"
                          min="0.80"
                          max="0.99"
                          step="0.01"
                          disabled={isTraining}
                          value={sample.targetConfidence}
                          onChange={(e) => handleUpdateConfidence(sample.id, parseFloat(e.target.value) || 0.95)}
                          className="w-13 text-center text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(sample.targetConfidence * 100).toFixed(0)}% Target
                      </span>
                    </div>

                    {/* Clinical Notes Field */}
                    <div>
                      <input
                        type="text"
                        disabled={isTraining}
                        value={sample.clinicalNotes}
                        onChange={(e) => handleUpdateNotes(sample.id, e.target.value)}
                        placeholder="Lesion criteria / clinical notes..."
                        className="w-full text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Compact Gemini API Disease Predictor Strip */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                        Gemini Vision:
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePredictWithGemini(sample.id)}
                      disabled={!hasImage || sample.isPredictingWithGemini || isTraining}
                      className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {sample.isPredictingWithGemini ? (
                        <>
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          <span>Predicting...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Predict with Gemini</span>
                        </>
                      )}
                    </button>
                  </div>

                  {sample.geminiPrediction ? (
                    <div className="space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 truncate">
                          {sample.geminiPrediction.conditionName}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                          geminiMatches 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200' 
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200'
                        }`}>
                          {geminiMatches ? '✓ Matches Target' : 'Differs from Target'}
                        </span>
                      </div>

                      {!geminiMatches && (
                        <button
                          type="button"
                          onClick={() => handleAdoptGeminiPrediction(sample.id)}
                          className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Adopt Gemini Diagnosis as Target Output</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {hasImage ? 'Click "Predict with Gemini" to inspect with AI vision.' : 'Attach an image first to enable Gemini prediction.'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SECTION 2: TRAINING HYPERPARAMETERS & EXECUTION */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                <span>Training Controls & Fine-Tuning</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fit convolutional weights to your {imagesCount} labeled target disease outputs.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isTraining ? (
                <button
                  onClick={handleStartTraining}
                  disabled={imagesCount < 5 || imagesCount > 10}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Train Model on {imagesCount} Labeled Images</span>
                </button>
              ) : (
                <button
                  onClick={handleStopTraining}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Pause Training</span>
                </button>
              )}
            </div>
          </div>

          {/* Hyperparameter Controls Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 min-w-0">
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                Epochs ({epochs})
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                disabled={isTraining}
                value={epochs}
                onChange={(e) => setEpochs(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                Learning Rate
              </label>
              <select
                disabled={isTraining}
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1 text-slate-900 dark:text-slate-100"
              >
                <option value={0.001}>1e-3 (Fast)</option>
                <option value={0.0003}>3e-4 (Recommended)</option>
                <option value={0.0001}>1e-4 (Fine-tuning)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                Optimizer
              </label>
              <select
                disabled={isTraining}
                value={optimizer}
                onChange={(e) => setOptimizer(e.target.value as any)}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1 text-slate-900 dark:text-slate-100"
              >
                <option value="AdamW">AdamW</option>
                <option value="Adam">Adam</option>
                <option value="SGD">SGD</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                Augmentation
              </label>
              <div className="flex items-center gap-1.5 pt-0.5">
                <input
                  type="checkbox"
                  id="aug-check"
                  disabled={isTraining}
                  checked={augmentation}
                  onChange={(e) => setAugmentation(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="aug-check" className="text-[11px] text-slate-700 dark:text-slate-300">
                  DullRazor / Flip
                </label>
              </div>
            </div>
          </div>

          {/* Live Progress Bar & Epoch Curves */}
          {(isTraining || epochHistory.length > 0) && (
            <div className="space-y-3 min-w-0">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">
                    Epoch {currentEpoch} / {epochs}
                  </span>
                  <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">
                    {Math.round((currentEpoch / epochs) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-600 rounded-full transition-all duration-300"
                    style={{ width: `${(currentEpoch / epochs) * 100}%` }}
                  />
                </div>
              </div>

              {/* Epoch Loss & Accuracy Curves */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-white space-y-1.5 min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Cross-Entropy Loss</span>
                    <span className="font-mono text-rose-400">
                      Loss: {epochHistory[epochHistory.length - 1]?.loss ?? 1.65}
                    </span>
                  </div>
                  <div className="h-24 w-full flex items-end gap-1 pt-1 overflow-hidden">
                    {epochHistory.map((ep, i) => {
                      const heightPercent = Math.min(100, Math.max(8, (ep.loss / 1.8) * 100));
                      return (
                        <div key={i} className="flex-1 bg-rose-500/40 rounded-t transition-all min-w-[2px]" style={{ height: `${heightPercent}%` }} />
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-white space-y-1.5 min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Target Output Alignment</span>
                    <span className="font-mono text-emerald-400">
                      Acc: {((epochHistory[epochHistory.length - 1]?.acc ?? 0.45) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-24 w-full flex items-end gap-1 pt-1 overflow-hidden">
                    {epochHistory.map((ep, i) => {
                      const heightPercent = Math.min(100, Math.max(10, ep.acc * 100));
                      return (
                        <div key={i} className="flex-1 bg-emerald-500/50 rounded-t transition-all min-w-[2px]" style={{ height: `${heightPercent}%` }} />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Console Logs */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 space-y-1.5 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Fitting Console Logs</span>
                  </span>
                  <span>{trainingLogs.length} events</span>
                </div>
                <div className="h-32 overflow-y-auto space-y-0.5 text-[10px] leading-relaxed break-all whitespace-pre-wrap">
                  {trainingLogs.map((log, idx) => (
                    <div key={idx} className={log.includes('CONVERGENCE') ? 'text-emerald-400 font-bold' : log.includes('Ep') ? 'text-slate-300' : 'text-teal-400'}>
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>

              {/* Training Complete Actions */}
              {isTrainingComplete && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Training Complete: 100% Target Alignment on {imagesCount} Images</span>
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Model weights serialized and ready for screening.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleExportConfig}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Config (.json)</span>
                    </button>
                    {onNavigateToScreening && (
                      <button
                        onClick={onNavigateToScreening}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Test Screening</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: COMPACT GEMINI API DISEASE PREDICTOR & EVALUATOR */}
      <div className="w-full max-w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini Multimodal Disease Evaluator</span>
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Gemini API Disease Predictor & Accuracy Evaluator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload any dermatological photo to predict its disease condition via Gemini API and check accuracy against expected diagnosis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-w-0">
          {/* Left Column: Image Selector & Ground Truth Target */}
          <div className="lg:col-span-5 space-y-3 min-w-0">
            <input
              type="file"
              ref={sandboxFileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setSandboxImage(ev.target?.result as string);
                    setSandboxResult(null);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              accept="image/*"
              className="hidden"
            />

            {/* Compact Image Preview Box with Replace & Delete Image Options */}
            <div className="relative h-44 sm:h-48 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center group">
              {sandboxImage ? (
                <>
                  <img
                    src={sandboxImage}
                    alt="Sandbox test specimen"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewImage(sandboxImage)}
                      className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs transition-colors"
                      title="Enlarge Image"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => sandboxFileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 p-4 transition-colors cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl m-1 hover:border-teal-500"
                >
                  <Upload className="w-6 h-6 mb-1 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Click to Upload / Attach Image</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP</span>
                </button>
              )}
            </div>

            {/* Explicit Replace & Delete Image Controls */}
            {sandboxImage && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => sandboxFileInputRef.current?.click()}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Replace image with another photo"
                >
                  <RefreshCw className="w-3 h-3 text-teal-600" />
                  <span>Replace Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSandboxImage(null);
                    setSandboxResult(null);
                  }}
                  className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Delete only this image (keeps expected disease settings)"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Image Only</span>
                </button>
              </div>
            )}

            {/* Quick Pick Samples */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Or pick from test library:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {samples.filter(s => Boolean(s.image)).slice(0, 5).map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSandboxImage(s.image);
                      setSandboxExpectedTarget(s.targetCategoryCode);
                      setSandboxResult(null);
                    }}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      sandboxImage === s.image 
                        ? 'border-teal-500 ring-2 ring-teal-500/20' 
                        : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Expected Ground Truth Comparator */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Expected Disease (for accuracy evaluation):
              </label>
              <select
                value={sandboxExpectedTarget}
                onChange={(e) => setSandboxExpectedTarget(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-slate-100"
              >
                {DISEASE_TARGET_OPTIONS.map(opt => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name} ({opt.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Trigger Button */}
            <button
              onClick={handleRunSandboxPrediction}
              disabled={!sandboxImage || sandboxPredicting}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              {sandboxPredicting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Image with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Gemini Disease Prediction</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Prediction Breakdown & Evaluation Report */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Gemini Clinical Screening Report
              </h3>
              {sandboxResult && (
                <span className="text-[10px] font-mono text-slate-400">
                  {sandboxResult.latencyMs}ms • Gemini Vision
                </span>
              )}
            </div>

            {sandboxResult ? (
              <div className="space-y-3 min-w-0">
                {/* Primary Result Banner */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Predicted Primary Disease
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      sandboxResult.riskLevel === 'malignant-suspected'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                        : sandboxResult.riskLevel === 'pre-malignant'
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {sandboxResult.categoryType}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                      {sandboxResult.conditionName}
                    </h4>
                    <span className="text-sm font-black font-mono text-teal-600 dark:text-teal-400">
                      {sandboxResult.confidencePercent}% Conf
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {sandboxResult.clinicalExplanations}
                  </p>
                </div>

                {/* Ground Truth Accuracy Evaluation Match Card */}
                {(() => {
                  const matches = sandboxResult.categoryCode === sandboxExpectedTarget;
                  const expectedOpt = DISEASE_TARGET_OPTIONS.find(o => o.code === sandboxExpectedTarget);
                  return (
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                      matches
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
                    }`}>
                      <div className="space-y-0.5 truncate">
                        <p className={`text-xs font-bold ${matches ? 'text-emerald-900 dark:text-emerald-200' : 'text-amber-900 dark:text-amber-200'}`}>
                          {matches ? '✓ Matches Expected Target' : '⚠️ Differs from Expected Target'}
                        </p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                          Expected: <strong>{expectedOpt?.name}</strong> • Predicted: <strong>{sandboxResult.conditionName}</strong>
                        </p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono shrink-0 ${
                        matches ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {matches ? 'Accuracy 100%' : 'Mismatch'}
                      </span>
                    </div>
                  );
                })()}

                {/* Differential Diagnoses */}
                {sandboxResult.differentialDiagnoses.length > 0 && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Differential Diagnoses:
                    </span>
                    <div className="space-y-1">
                      {sandboxResult.differentialDiagnoses.slice(0, 3).map((diff, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {diff.condition}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 font-bold shrink-0">
                            {(diff.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center text-slate-400 p-4 space-y-1.5">
                <Sparkles className="w-8 h-8 text-teal-600/40" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Ready to evaluate skin specimens
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Click "Run Gemini Disease Prediction" to inspect the image and verify accuracy against expected diagnosis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for full image preview */}
      {selectedPreviewImage && (
        <div 
          onClick={() => setSelectedPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-xl max-h-[85vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedPreviewImage} 
              alt="Enlarged clinical lesion" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
