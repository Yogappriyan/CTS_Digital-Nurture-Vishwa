export type Vehicle = {
  id: string;
  user_id: string;
  nickname: string;
  make: string;
  model: string;
  year: number;
  registration_identifier?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type SessionSource = 'android' | 'web_upload';
export type SessionStatus = 'created' | 'uploading' | 'uploaded' | 'validated' | 'processing' | 'processed' | 'failed';

export type InspectionSession = {
  id: string;
  user_id: string;
  vehicle_id: string;
  client_session_id?: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  source: SessionSource;
  recording_config?: {
    audio_sample_rate?: number;
    audio_channels?: number;
    sensor_rate_hz?: number;
    device_model?: string;
    mount_position?: string;
  };
  sensor_availability?: {
    audio: boolean;
    accelerometer: boolean;
    gyroscope: boolean;
  };
  status: SessionStatus;
  notes?: string | null;
  created_at?: string;
  // Joined fields for display
  vehicle?: Vehicle;
  latest_analysis?: AnalysisResult;
  audio_recording?: AudioRecording;
  sensor_recordings?: SensorRecording[];
};

export type AudioRecording = {
  id: string;
  session_id: string;
  user_id: string;
  storage_path: string;
  sample_rate: number;
  channels: number;
  duration_seconds: number;
  size_bytes: number;
  sha256: string;
  input_device_info?: Record<string, any>;
  created_at: string;
};

export type SensorRecording = {
  id: string;
  session_id: string;
  user_id: string;
  sensor_type: 'accelerometer' | 'gyroscope';
  storage_path: string;
  sample_count: number;
  nominal_rate_hz: number;
  size_bytes: number;
  sha256: string;
  created_at: string;
};

export type ResultCategory =
  | 'normal_pattern'
  | 'abnormal_pattern'
  | 'inconclusive'
  | 'unsuitable_recording'
  | 'model_not_configured';

export type AnalysisStatus = 'queued' | 'running' | 'completed' | 'failed' | 'unavailable';

export type FeatureSummary = {
  audio?: {
    rms_energy?: number;
    spectral_centroid?: number;
    spectral_bandwidth?: number;
    spectral_rolloff?: number;
    zero_crossing_rate?: number;
    mfcc_means?: number[];
  };
  accelerometer?: {
    mean_xyz?: [number, number, number];
    std_xyz?: [number, number, number];
    rms_acceleration?: number;
    magnitude_mean?: number;
    magnitude_max?: number;
    axis_variability?: number;
  };
  gyroscope?: {
    mean_xyz?: [number, number, number];
    std_xyz?: [number, number, number];
    magnitude_mean?: number;
    magnitude_max?: number;
  };
};

export type AnalysisResult = {
  id: string;
  session_id: string;
  user_id: string;
  status: AnalysisStatus;
  result_category: ResultCategory;
  confidence?: number | null;
  uncertainty?: {
    entropy?: number;
    margin?: number;
    description?: string;
  } | null;
  supported_classes: string[];
  class_probabilities?: Record<string, number> | null;
  model_name?: string | null;
  model_version?: string | null;
  preprocessing_version?: string | null;
  feature_summary?: FeatureSummary | null;
  quality_observations?: {
    audio_clipping_detected?: boolean;
    audio_snr_db?: number;
    background_noise_level?: 'low' | 'moderate' | 'high';
    sensor_dropout_count?: number;
    mounting_stability?: 'stable' | 'vibrating_unconstrained' | 'loose' | 'unknown';
    notes?: string[];
  } | null;
  recommendation?: string | null;
  error_code?: string | null;
  started_at: string;
  completed_at?: string | null;
};

export type MechanicConfirmation = {
  id: string;
  user_id: string;
  vehicle_id: string;
  session_id?: string | null;
  component: 'engine' | 'chain_sprocket' | 'wheel_bearing' | 'exhaust' | 'valves' | 'other';
  diagnosis_text: string;
  mechanic_name: string;
  workshop_name?: string;
  confirmed_on: string;
  created_at: string;
};

export type MaintenanceEvent = {
  id: string;
  user_id: string;
  vehicle_id: string;
  event_date: string;
  event_type: 'routine_service' | 'oil_change' | 'chain_adjustment' | 'valve_clearance' | 'tire_replacement' | 'inspection' | 'repair' | 'other';
  description: string;
  mileage_km?: number | null;
  performed_by: string;
  mechanic_notes?: string | null;
  created_at: string;
};

export type SharedReport = {
  id: string;
  user_id: string;
  session_id: string;
  token_hash: string;
  token?: string; // transient when generated
  expires_at?: string | null;
  revoked_at?: string | null;
  options: {
    hide_registration?: boolean;
    hide_audio?: boolean;
    include_sensor_graphs?: boolean;
  };
  view_count: number;
  last_viewed_at?: string | null;
  created_at: string;
  session?: InspectionSession;
};

export type ComponentStatus = 'normal_pattern' | 'attention_recommended' | 'unknown';

export type DigitalTwinComponentId = 'engine' | 'chain_sprocket' | 'wheel_bearing' | 'exhaust';

export type SyncState = 'idle' | 'syncing' | 'synced' | 'pending' | 'error';

export interface AndroidSyncTelemetry {
  syncState: SyncState;
  lastSyncTime: string | null;
  lastSyncedSessionId: string | null;
  pendingUploadsCount: number;
  totalSyncedCount: number;
  syncErrors: Array<{ timestamp: string; message: string; code: string }>;
  isServerReachable: boolean;
}
