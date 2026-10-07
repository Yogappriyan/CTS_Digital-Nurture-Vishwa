export interface PipelineAnalysisOutput {
  image_valid: boolean;
  lesion_detected: boolean;
  predicted_class: string;
  confidence: number;
  top_predictions: {
    class: string;
    probability: number;
  }[];
  visual_findings: string[];
  model_used: string;
  dataset_reference: string;
  model_status: 'connected' | 'prototype_dataset_assisted' | 'no_trained_model';
  detection_performed?: boolean;
  classification_performed?: boolean;
  bounding_box?: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
  segmentation_mask_available?: boolean;
  debug_transparency?: {
    dataset_name: string;
    supported_classes: string[];
    detection_model: string;
    classification_model: string;
    feature_dimensions: number;
    processing_pipeline: string[];
  };
}

export type SupportedDatasetKey = 'ISIC_2016' | 'ISIC_2017' | 'ISIC_2018_HAM10000' | 'CUSTOM_DATASET';

export interface DatasetSpecification {
  id: SupportedDatasetKey | string;
  name: string;
  year?: number;
  description: string;
  supportedClasses: {
    key: string;
    label: string;
    clinicalName: string;
    riskTier: RiskLevel;
  }[];
  tasksSupported: ('lesion_detection' | 'segmentation_masks' | 'classification')[];
  defaultDetectionModel?: string;
  defaultClassificationModel?: string;
}

export type RiskLevel = 'benign-low' | 'benign-monitoring' | 'pre-malignant' | 'malignant-suspected' | 'uncertain';

export interface SkinCategoryInfo {
  code: string;
  name: string;
  clinicalName: string;
  shortCode: string;
  categoryType: 'Benign' | 'Pre-Malignant' | 'Malignant' | 'Vascular' | 'Infectious/Inflammatory' | 'Normal' | 'Invalid';
  riskLevel: RiskLevel;
  description: string;
  whatItMeans: string;
  whatItDoesNotMean: string;
  clinicalCharacteristics: string[];
  recommendedNextSteps: string[];
}

export interface ProbabilityBreakdown {
  categoryCode: string;
  name: string;
  clinicalName: string;
  probability: number; // 0.0 to 1.0
  percentage: number;  // 0 to 100
  color: string;
}

export interface GradCAMData {
  heatmapUrl: string;
  overlayUrl: string;
  colormap: 'jet' | 'turbo' | 'thermal' | 'hotspot';
  attentionIntensity: number; // 0 to 1
  attentionCenter: { x: number; y: number; radius: number };
  attentionSummary: string;
  technicalDetails: string;
}

export interface ImageMetadata {
  fileName: string;
  fileSize: string;
  dimensions: { width: number; height: number };
  format: string;
  qualityScore: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  brightnessScore: number;
  contrastScore: number;
  sharpnessScore: number;
}

export interface PreprocessingStage {
  artifactSuppression: {
    method: 'DullRazor Digital Hair & Artifact Removal';
    hairsDetected: number;
    artifactMaskRatio: number;
    status: 'Suppressed & Inpainted' | 'Clean Field';
  };
  colorNormalization: {
    method: 'Gray-World Color Constancy (Shades-of-Gray)';
    illuminantRGB: [number, number, number];
    status: 'Normalized';
  };
  illuminationCorrection: {
    method: 'Adaptive CLAHE (Contrast Limited Adaptive Histogram Equalization)';
    clipLimit: number;
    tileGridSize: string;
    contrastGain: string;
  };
}

export interface FeatureExtractionStage {
  backbone: 'MobileNetV2 (Inverted Residual Bottleneck)';
  rawFeatureDimensions: number; // e.g. 1280
  pcaFeatureSelection: {
    method: 'Principal Component Analysis (PCA)';
    selectedComponents: number; // e.g. 64
    varianceRetained: number; // e.g. 96.4 (%)
    topComponents: { pc: string; varianceExplained: number; cumulativeVariance: number }[];
  };
}

export interface LocalizationStage {
  model: 'YOLOv4 (CSPDarknet53 Feature Pyramid)';
  boundingBox: {
    ymin: number; // 0-1
    xmin: number; // 0-1
    ymax: number; // 0-1
    xmax: number; // 0-1
  };
  roiBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  detectionConfidence: number; // 0-1
  aspectRatio: number;
  estimatedAreaMm2: number;
  iouScore: number;
  boundaryMarginScore: 'Sharp & Circumscribed' | 'Irregular / Notched' | 'Diffuse / Scalloped';
}

export interface ClassificationEngineStage {
  fineGrainedModel: 'XceptionNet (Depthwise Separable Convolutions)';
  recurrentHybrid: 'CNN + Bidirectional LSTM / GRU';
  spatialTextureFeatures: {
    radialSlicesAnalyzed: number;
    gradientEntropy: number;
    directionalTextureScore: number;
  };
  ensembleAgreement: number; // percentage, e.g. 97.5%
}

export interface BenchmarkMetrics {
  accuracy: number;     // e.g. 96.8 (%)
  precision: number;    // e.g. 95.4 (%)
  recallSensitivity: number; // e.g. 97.1 (%)
  specificity: number;  // e.g. 98.2 (%)
  f1Score: number;      // e.g. 96.2 (%)
  rocAuc: number;       // e.g. 0.989
  benchmarkDataset: string;
}

export interface HybridPipelineDetails {
  preprocessing: PreprocessingStage;
  featureExtraction: FeatureExtractionStage;
  localization: LocalizationStage;
  classificationEngine: ClassificationEngineStage;
  benchmarks: BenchmarkMetrics;
}

export interface ModelInfo {
  architecture: string;
  version: string;
  dataset: string;
  inputSize: string;
  inferenceTimeMs: number;
  evaluationNotice: string;
  pipelineFramework: string;
}

export interface AbcdeAssessment {
  asymmetry: string;
  border: string;
  color: string;
  diameter: string;
  evolution: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  title: string;
  imageUrl: string;
  imageMetadata: ImageMetadata;
  prediction: {
    categoryCode: string;
    categoryName: string;
    clinicalName: string;
    confidence: number; // 0.0 to 1.0
    confidenceLabel: 'High' | 'Moderate' | 'Low';
    riskLevel: RiskLevel;
    summary: string;
    interpretation: string;
    whatItDoesNotMean: string;
    recommendedActions: string[];
    isSkinOrMedical?: boolean;
    isNormalHealthySkin?: boolean;
    rejectionReason?: string;
    nonSkinDescription?: string;
    aiEngineStatus?: 'gemini_active' | 'missing_api_key_heuristic' | 'fallback_offline';
    aiModelUsed?: string;
    aiNotice?: string;
  };
  probabilities: ProbabilityBreakdown[];
  gradcam: GradCAMData;
  pipelineDetails?: HybridPipelineDetails;
  modelInfo: ModelInfo;
  status: 'Completed' | 'Requires Review' | 'Low Confidence' | 'Invalid Image';
  patientNotes?: string;
  isDemoSample?: boolean;
  visualFindings?: string[];
  abcdeAssessment?: AbcdeAssessment;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  imageUrl?: string;
  analysisContextId?: string;
  suggestedQuestions?: string[];
  feedback?: 'like' | 'dislike';
  pipelineStageRef?: 'preprocessing' | 'pca' | 'yolo' | 'xception' | 'benchmarks' | 'gradcam' | 'clinical';
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  isAdmin?: boolean;
  isAnonymous?: boolean;
  joinedDate: string;
  preferences: {
    theme: ThemeMode;
    modelArchitecture: 'MobileNetV2 + PCA + XceptionNet' | 'EfficientNet-B0' | 'ResNet50-Derm';
    gradcamColormap: 'jet' | 'turbo' | 'thermal' | 'hotspot';
    emailAlerts: boolean;
    highRiskAlerts: boolean;
    compactView: boolean;
  };
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedAnalysisId?: string;
}

export type AppView = 
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'new-analysis'
  | 'analysis-result'
  | 'history'
  | 'reports'
  | 'assistant'
  | 'train-evaluate'
  | 'profile'
  | 'settings';
