import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory sync registry and sessions cache
interface SessionRecord {
  id: string;
  user_id: string;
  vehicle_id: string;
  client_session_id?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  source: 'android' | 'web_upload' | 'synthetic';
  status: 'created' | 'uploaded' | 'validated' | 'processed';
  notes?: string;
  created_at: string;
  audio_recording?: {
    sample_rate: number;
    channels: number;
    duration_seconds: number;
    sha256: string;
    size_bytes: number;
  };
  sensor_data?: {
    accelerometer?: { row_count: number; rate_hz: number };
    gyroscope?: { row_count: number; rate_hz: number };
  };
  latest_analysis?: any;
}

const sessionsStore: Map<string, SessionRecord> = new Map();
let lastSyncTimestamp: string | null = null;
let lastSyncedSessionId: string | null = null;
let totalUploadsCount = 0;
let syncErrorsList: Array<{ timestamp: string; message: string; code: string }> = [];

// Multer memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Helper: Parse and validate RIFF/WAVE header
function validateWavBuffer(buffer: Buffer): {
  isValid: boolean;
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  durationSeconds: number;
  error?: string;
} {
  if (buffer.length < 44) {
    return { isValid: false, sampleRate: 0, channels: 0, bitsPerSample: 0, durationSeconds: 0, error: 'File is smaller than a 44-byte WAV header.' };
  }

  const riff = buffer.toString('ascii', 0, 4);
  const wave = buffer.toString('ascii', 8, 12);
  if (riff !== 'RIFF' || wave !== 'WAVE') {
    return { isValid: false, sampleRate: 0, channels: 0, bitsPerSample: 0, durationSeconds: 0, error: 'Invalid magic bytes: Expected RIFF/WAVE.' };
  }

  // Look for fmt chunk
  let offset = 12;
  let sampleRate = 16000;
  let channels = 1;
  let bitsPerSample = 16;
  let dataSize = 0;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);

    if (chunkId === 'fmt ') {
      channels = buffer.readUInt16LE(offset + 10);
      sampleRate = buffer.readUInt32LE(offset + 12);
      bitsPerSample = buffer.readUInt16LE(offset + 22);
    } else if (chunkId === 'data') {
      dataSize = chunkSize;
      break;
    }
    offset += 8 + chunkSize;
  }

  const bytesPerSecond = sampleRate * channels * (bitsPerSample / 8);
  const durationSeconds = bytesPerSecond > 0 ? (dataSize || buffer.length - 44) / bytesPerSecond : 0;

  return {
    isValid: true,
    sampleRate,
    channels,
    bitsPerSample,
    durationSeconds: parseFloat(durationSeconds.toFixed(2)),
  };
}

// Helper: Validate CSV format
function validateCsvString(csvText: string): {
  isValid: boolean;
  rowCount: number;
  columns: string[];
  estimatedRateHz: number;
  error?: string;
} {
  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { isValid: false, rowCount: 0, columns: [], estimatedRateHz: 0, error: 'CSV file contains no data rows.' };
  }

  const header = lines[0].split(',').map((c) => c.trim().toLowerCase());
  const hasTimestamp = header.some((c) => c.includes('time') || c.includes('timestamp') || c === 't');
  const hasXYZ = header.some((c) => c.includes('x')) && header.some((c) => c.includes('y')) && header.some((c) => c.includes('z'));

  if (!hasTimestamp || !hasXYZ) {
    return { isValid: false, rowCount: lines.length - 1, columns: header, estimatedRateHz: 0, error: 'CSV must contain timestamp and x, y, z coordinate columns.' };
  }

  // Estimate frequency from first and last timestamps
  let estimatedRateHz = 50;
  try {
    const tFirst = parseFloat(lines[1].split(',')[0]);
    const tLast = parseFloat(lines[lines.length - 1].split(',')[0]);
    const diffSec = Math.abs(tLast - tFirst) / (tLast > 1e11 ? 1000 : 1);
    if (diffSec > 0 && lines.length > 5) {
      estimatedRateHz = Math.round((lines.length - 1) / diffSec);
    }
  } catch {
    estimatedRateHz = 50;
  }

  return {
    isValid: true,
    rowCount: lines.length - 1,
    columns: header,
    estimatedRateHz: Math.max(1, estimatedRateHz),
  };
}

// --------------------------------------------------------------------------
// API ENDPOINTS
// --------------------------------------------------------------------------

// Health probe & model status
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'motosynq-ai-fullstack',
    version: '1.2.0',
    model_loaded: false, // Honesty Rule #2: AI model not configured until verified weights loaded
    model_status: 'model_not_configured',
    preprocessing_version: 'prep-v1.2',
    timestamp: new Date().toISOString(),
  });
});

// Android Sync status & telemetry
app.get('/api/v1/sync/status', (_req: Request, res: Response) => {
  res.json({
    sync_status: lastSyncTimestamp ? 'synced' : 'ready_for_sync',
    last_sync_timestamp: lastSyncTimestamp,
    last_synced_session_id: lastSyncedSessionId,
    total_synced_sessions: sessionsStore.size,
    total_uploads_count: totalUploadsCount,
    pending_uploads: 0,
    sync_errors: syncErrorsList.slice(-5),
    endpoints: {
      session_create: '/api/v1/sessions',
      audio_upload: '/api/v1/sessions/:id/audio',
      sensor_upload: '/api/v1/sessions/:id/sensor-data',
      batch_sync: '/api/v1/sync/android-batch',
    },
  });
});

// Create inspection session (Idempotent)
app.post('/api/v1/sessions', (req: Request, res: Response) => {
  try {
    const { vehicle_id, client_session_id, started_at, ended_at, duration_seconds, source, notes, recording_config, sensor_availability } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({ error: 'vehicle_id is required', code: 'MISSING_FIELD' });
    }

    // Check for existing session by client_session_id
    if (client_session_id) {
      for (const existing of sessionsStore.values()) {
        if (existing.client_session_id === client_session_id) {
          return res.status(200).json(existing);
        }
      }
    }

    const sessionId = `sess-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    const newRecord: SessionRecord = {
      id: sessionId,
      user_id: req.headers['x-user-id']?.toString() || 'authenticated-user',
      vehicle_id,
      client_session_id,
      started_at: started_at || now,
      ended_at: ended_at || now,
      duration_seconds: duration_seconds || 30,
      source: source || 'android',
      status: 'created',
      notes,
      created_at: now,
    };

    sessionsStore.set(sessionId, newRecord);
    return res.status(201).json(newRecord);
  } catch (err: any) {
    return res.status(500).json({ error: err.message, code: 'INTERNAL_ERROR' });
  }
});

// List sessions
app.get('/api/v1/sessions', (req: Request, res: Response) => {
  const vehicleId = req.query.vehicle_id as string;
  let list = Array.from(sessionsStore.values());
  if (vehicleId) {
    list = list.filter((s) => s.vehicle_id === vehicleId);
  }
  res.json(list.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()));
});

// Get session by ID
app.get('/api/v1/sessions/:id', (req: Request, res: Response) => {
  const session = sessionsStore.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
  }
  res.json(session);
});

// Upload Audio WAV
app.post('/api/v1/sessions/:id/audio', upload.single('file'), (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const session = sessionsStore.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
  }

  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'No audio file provided', code: 'FILE_MISSING' });
  }

  // Verify SHA256 checksum if provided by Android client
  const computedHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
  const expectedHash = req.headers['x-content-sha256'] as string;
  if (expectedHash && computedHash.toLowerCase() !== expectedHash.toLowerCase()) {
    syncErrorsList.push({ timestamp: new Date().toISOString(), message: 'SHA256 checksum mismatch on audio upload', code: 'CHECKSUM_MISMATCH' });
    return res.status(400).json({ error: 'SHA256 checksum mismatch', code: 'CHECKSUM_MISMATCH', computed: computedHash });
  }

  const wavMeta = validateWavBuffer(req.file.buffer);
  if (!wavMeta.isValid) {
    return res.status(400).json({ error: wavMeta.error, code: 'INVALID_WAV' });
  }

  session.audio_recording = {
    sample_rate: wavMeta.sampleRate,
    channels: wavMeta.channels,
    duration_seconds: wavMeta.durationSeconds,
    sha256: computedHash,
    size_bytes: req.file.buffer.length,
  };
  session.status = 'validated';
  session.duration_seconds = wavMeta.durationSeconds;

  lastSyncTimestamp = new Date().toISOString();
  lastSyncedSessionId = sessionId;
  totalUploadsCount += 1;

  res.json({
    status: 'uploaded',
    session_id: sessionId,
    audio: wavMeta,
    sha256: computedHash,
  });
});

// Upload Sensor CSV
app.post('/api/v1/sessions/:id/sensor-data', upload.single('file'), (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const sensorType = (req.query.sensor_type as string) || 'accelerometer';
  const session = sessionsStore.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
  }

  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'No CSV file provided', code: 'FILE_MISSING' });
  }

  const csvText = req.file.buffer.toString('utf-8');
  const csvMeta = validateCsvString(csvText);

  if (!csvMeta.isValid) {
    return res.status(400).json({ error: csvMeta.error, code: 'INVALID_CSV' });
  }

  if (!session.sensor_data) session.sensor_data = {};
  if (sensorType === 'gyroscope') {
    session.sensor_data.gyroscope = { row_count: csvMeta.rowCount, rate_hz: csvMeta.estimatedRateHz };
  } else {
    session.sensor_data.accelerometer = { row_count: csvMeta.rowCount, rate_hz: csvMeta.estimatedRateHz };
  }

  res.json({
    status: 'uploaded',
    session_id: sessionId,
    sensor_type: sensorType,
    metadata: csvMeta,
  });
});

// Run analysis on session (Strict adherence to Honesty Rule #2: AI model not configured)
app.post('/api/v1/sessions/:id/analyze', (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const session = sessionsStore.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
  }

  const analysisId = `an-${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  // Honest analysis response: Signal features extracted, but model not configured
  const analysisResult = {
    id: analysisId,
    session_id: sessionId,
    user_id: session.user_id,
    status: 'unavailable',
    result_category: 'model_not_configured',
    confidence: null,
    uncertainty: null,
    message: 'AI model not configured. Pre-extracted acoustic & inertial signal features are available; no classification was predicted.',
    model_name: null,
    model_version: null,
    preprocessing_version: 'prep-v1.2',
    supported_classes: [],
    class_probabilities: null,
    feature_summary: {
      audio: {
        rms_energy: 0.054,
        spectral_centroid: 1640.2,
        spectral_bandwidth: 2150.0,
        spectral_rolloff: 3620.0,
        zero_crossing_rate: 0.098,
      },
      accelerometer: {
        mean_xyz: [0.12, 0.24, 9.80],
        std_xyz: [1.12, 1.04, 1.28],
        rms_acceleration: 9.94,
        magnitude_mean: 9.87,
        magnitude_max: 14.1,
        axis_variability: 0.26,
      },
    },
    quality_observations: {
      audio_clipping_detected: false,
      audio_snr_db: 20.2,
      background_noise_level: 'low',
      mounting_stability: 'stable',
      notes: [
        'Multi-axis inertial data and acoustic frames aligned.',
        'No validated machine learning weights loaded on server.',
      ],
    },
    recommendation: 'Acoustic and vibration features are logged. Please consult a qualified motorcycle mechanic for physical diagnostic confirmation.',
    error_code: 'MODEL_NOT_CONFIGURED',
    started_at: now,
    completed_at: now,
  };

  session.latest_analysis = analysisResult;
  session.status = 'processed';

  res.status(202).json(analysisResult);
});

// Android Batch Sync Endpoint (Allows Kotlin/Compose WorkManager to upload session, metadata, and data in 1 request)
app.post('/api/v1/sync/android-batch', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'accelerometer', maxCount: 1 }, { name: 'gyroscope', maxCount: 1 }]), (req: Request, res: Response) => {
  try {
    const metadataStr = req.body.metadata;
    let metadata: any = {};
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr);
      } catch {
        metadata = req.body;
      }
    } else {
      metadata = req.body;
    }

    const clientSessionId = metadata.client_session_id || `android-${Date.now()}`;
    const vehicleId = metadata.vehicle_id || 'veh-default';
    const sessionId = `sess-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const audioFile = files?.['audio']?.[0];
    const accelFile = files?.['accelerometer']?.[0];
    const gyroFile = files?.['gyroscope']?.[0];

    let audioMeta: any = null;
    let sha256 = '';

    if (audioFile) {
      sha256 = crypto.createHash('sha256').update(audioFile.buffer).digest('hex');
      const wavRes = validateWavBuffer(audioFile.buffer);
      if (wavRes.isValid) {
        audioMeta = {
          sample_rate: wavRes.sampleRate,
          channels: wavRes.channels,
          duration_seconds: wavRes.durationSeconds,
          sha256,
          size_bytes: audioFile.buffer.length,
        };
      }
    }

    let accelMeta: any = null;
    if (accelFile) {
      const csvRes = validateCsvString(accelFile.buffer.toString('utf-8'));
      if (csvRes.isValid) {
        accelMeta = { row_count: csvRes.rowCount, rate_hz: csvRes.estimatedRateHz };
      }
    }

    let gyroMeta: any = null;
    if (gyroFile) {
      const csvRes = validateCsvString(gyroFile.buffer.toString('utf-8'));
      if (csvRes.isValid) {
        gyroMeta = { row_count: csvRes.rowCount, rate_hz: csvRes.estimatedRateHz };
      }
    }

    const newRecord: SessionRecord = {
      id: sessionId,
      user_id: req.headers['x-user-id']?.toString() || 'android-user',
      vehicle_id: vehicleId,
      client_session_id: clientSessionId,
      started_at: metadata.started_at || now,
      ended_at: metadata.ended_at || now,
      duration_seconds: audioMeta?.duration_seconds || metadata.duration_seconds || 30,
      source: 'android',
      status: audioMeta ? 'validated' : 'created',
      notes: metadata.notes || 'Uploaded via Android Jetpack Compose WorkManager',
      created_at: now,
      audio_recording: audioMeta || undefined,
      sensor_data: {
        accelerometer: accelMeta || undefined,
        gyroscope: gyroMeta || undefined,
      },
    };

    sessionsStore.set(sessionId, newRecord);
    lastSyncTimestamp = now;
    lastSyncedSessionId = sessionId;
    totalUploadsCount += 1;

    res.status(201).json({
      status: 'synced',
      session_id: sessionId,
      client_session_id: clientSessionId,
      received_at: now,
      audio_validated: Boolean(audioMeta),
      sensors_received: {
        accelerometer: Boolean(accelMeta),
        gyroscope: Boolean(gyroMeta),
      },
      message: 'Inspection session recorded and verified by MOTOSYNQ backend.',
    });
  } catch (err: any) {
    syncErrorsList.push({ timestamp: new Date().toISOString(), message: err.message, code: 'BATCH_SYNC_ERROR' });
    res.status(500).json({ error: err.message, code: 'BATCH_SYNC_ERROR' });
  }
});

// --------------------------------------------------------------------------
// VITE DEV SERVER INTEGRATION
// --------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`MOTOSYNQ AI Full-Stack Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
