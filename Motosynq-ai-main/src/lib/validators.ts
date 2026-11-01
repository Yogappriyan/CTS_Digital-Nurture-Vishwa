import { z } from 'zod';

export interface WavMetadata {
  isValid: boolean;
  formatTag?: number;
  channels?: number;
  sampleRate?: number;
  bitsPerSample?: number;
  byteRate?: number;
  durationSeconds?: number;
  fileSizeBytes?: number;
  error?: string;
  warnings: string[];
}

export interface CsvValidationResult {
  isValid: boolean;
  rowCount: number;
  estimatedRateHz?: number;
  durationSeconds?: number;
  hasMonotonicTimestamps: boolean;
  missingValuesCount: number;
  columns: string[];
  sampleRows: { timestamp: number; x: number; y: number; z: number }[];
  error?: string;
  warnings: string[];
}

export const SessionJsonSchema = z.object({
  session_id: z.string().min(1, 'Session ID required'),
  vehicle_id: z.string().min(1, 'Vehicle ID required'),
  started_at: z.string().datetime().or(z.string()),
  ended_at: z.string().datetime().or(z.string()),
  duration_seconds: z.number().positive(),
  audio_sample_rate: z.number().int().positive().optional(),
  audio_channels: z.number().int().positive().optional(),
  sensor_availability: z.object({
    audio: z.boolean(),
    accelerometer: z.boolean(),
    gyroscope: z.boolean(),
  }).optional(),
  recording_configuration: z.record(z.string(), z.any()).optional(),
  device_info: z.record(z.string(), z.any()).optional(),
  notes: z.string().optional(),
});

export async function validateWavFile(file: File, maxSizeBytes: number = 50 * 1024 * 1024): Promise<WavMetadata> {
  const warnings: string[] = [];

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      fileSizeBytes: file.size,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed size of ${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB.`,
      warnings,
    };
  }

  if (file.size < 44) {
    return {
      isValid: false,
      fileSizeBytes: file.size,
      error: 'File is smaller than a standard WAV 44-byte header. File is corrupted or empty.',
      warnings,
    };
  }

  try {
    const buffer = await file.slice(0, 100).arrayBuffer();
    const view = new DataView(buffer);

    // Read RIFF
    const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
    if (riff !== 'RIFF') {
      return {
        isValid: false,
        fileSizeBytes: file.size,
        error: `Invalid RIFF container header: expected 'RIFF', got '${riff}'. Not a valid WAV file.`,
        warnings,
      };
    }

    // Read WAVE
    const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
    if (wave !== 'WAVE') {
      return {
        isValid: false,
        fileSizeBytes: file.size,
        error: `Invalid WAV identifier: expected 'WAVE', got '${wave}'.`,
        warnings,
      };
    }

    // Check fmt chunk
    let offset = 12;
    let fmtFound = false;
    let formatTag = 1;
    let channels = 1;
    let sampleRate = 16000;
    let byteRate = 32000;
    let bitsPerSample = 16;

    while (offset < buffer.byteLength - 8) {
      const chunkId = String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3)
      );
      const chunkSize = view.getUint32(offset + 4, true);

      if (chunkId === 'fmt ') {
        fmtFound = true;
        formatTag = view.getUint16(offset + 8, true);
        channels = view.getUint16(offset + 10, true);
        sampleRate = view.getUint32(offset + 12, true);
        byteRate = view.getUint32(offset + 16, true);
        bitsPerSample = view.getUint16(offset + 22, true);
        break;
      }
      offset += 8 + chunkSize;
    }

    if (!fmtFound) {
      return {
        isValid: false,
        fileSizeBytes: file.size,
        error: 'Missing WAV "fmt " subchunk in header.',
        warnings,
      };
    }

    // PCM is format 1, IEEE float is 3
    if (formatTag !== 1 && formatTag !== 3) {
      warnings.push(`Non-PCM compression format detected (Format tag ${formatTag}). Standard 16-bit PCM is recommended.`);
    }

    if (bitsPerSample !== 16) {
      warnings.push(`Bit depth is ${bitsPerSample}-bit. 16-bit PCM is standard for acoustic screening.`);
    }

    if (channels !== 1) {
      warnings.push(`Audio has ${channels} channels. Mono (1 channel) is recommended for motorcycle acoustic analysis.`);
    }

    if (sampleRate !== 16000 && sampleRate !== 44100 && sampleRate !== 48000) {
      warnings.push(`Non-standard sample rate (${sampleRate} Hz). 16 kHz or 44.1/48 kHz recommended.`);
    }

    const bytesPerSec = (sampleRate * channels * bitsPerSample) / 8;
    const durationSeconds = bytesPerSec > 0 ? file.size / bytesPerSec : 0;

    if (durationSeconds < 3.0) {
      return {
        isValid: false,
        formatTag,
        channels,
        sampleRate,
        bitsPerSample,
        byteRate,
        durationSeconds,
        fileSizeBytes: file.size,
        error: `Recording duration (${durationSeconds.toFixed(1)}s) is shorter than minimum required 3 seconds for inspection.`,
        warnings,
      };
    }

    if (durationSeconds > 300.0) {
      return {
        isValid: false,
        formatTag,
        channels,
        sampleRate,
        bitsPerSample,
        byteRate,
        durationSeconds,
        fileSizeBytes: file.size,
        error: `Recording duration (${durationSeconds.toFixed(1)}s) exceeds maximum allowed 300 seconds (5 minutes).`,
        warnings,
      };
    }

    return {
      isValid: true,
      formatTag,
      channels,
      sampleRate,
      bitsPerSample,
      byteRate,
      durationSeconds,
      fileSizeBytes: file.size,
      warnings,
    };
  } catch (err: any) {
    return {
      isValid: false,
      fileSizeBytes: file.size,
      error: `Failed to parse WAV header: ${err?.message || 'Corrupted file'}`,
      warnings,
    };
  }
}

export async function validateSensorCsv(file: File, maxSizeBytes: number = 20 * 1024 * 1024): Promise<CsvValidationResult> {
  const warnings: string[] = [];

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      rowCount: 0,
      hasMonotonicTimestamps: false,
      missingValuesCount: 0,
      columns: [],
      sampleRows: [],
      error: `CSV size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed size of ${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB.`,
      warnings,
    };
  }

  try {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    if (lines.length < 2) {
      return {
        isValid: false,
        rowCount: 0,
        hasMonotonicTimestamps: false,
        missingValuesCount: 0,
        columns: [],
        sampleRows: [],
        error: 'CSV file is empty or missing data rows.',
        warnings,
      };
    }

    const header = lines[0].toLowerCase().split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const requiredCols = ['timestamp', 'x', 'y', 'z'];
    const missingCols = requiredCols.filter(req => !header.includes(req));

    if (missingCols.length > 0) {
      return {
        isValid: false,
        rowCount: lines.length - 1,
        hasMonotonicTimestamps: false,
        missingValuesCount: 0,
        columns: header,
        sampleRows: [],
        error: `Missing required CSV column(s): ${missingCols.join(', ')}. Expected headers: timestamp,x,y,z`,
        warnings,
      };
    }

    const tIdx = header.indexOf('timestamp');
    const xIdx = header.indexOf('x');
    const yIdx = header.indexOf('y');
    const zIdx = header.indexOf('z');

    let prevTimestamp = -Infinity;
    let isMonotonic = true;
    let missingCount = 0;
    const sampleRows: { timestamp: number; x: number; y: number; z: number }[] = [];

    const dataLines = lines.slice(1);
    for (let i = 0; i < dataLines.length; i++) {
      const cols = dataLines[i].split(',').map(c => c.trim());
      const t = parseFloat(cols[tIdx]);
      const x = parseFloat(cols[xIdx]);
      const y = parseFloat(cols[yIdx]);
      const z = parseFloat(cols[zIdx]);

      if (isNaN(t) || isNaN(x) || isNaN(y) || isNaN(z)) {
        missingCount++;
        continue;
      }

      if (t < prevTimestamp) {
        isMonotonic = false;
      }
      prevTimestamp = t;

      if (sampleRows.length < 500) {
        sampleRows.push({ timestamp: t, x, y, z });
      }
    }

    if (dataLines.length - missingCount < 10) {
      return {
        isValid: false,
        rowCount: dataLines.length,
        hasMonotonicTimestamps: isMonotonic,
        missingValuesCount: missingCount,
        columns: header,
        sampleRows,
        error: 'Too few valid numeric data rows in CSV (< 10 samples).',
        warnings,
      };
    }

    if (!isMonotonic) {
      warnings.push('Timestamps in CSV are not strictly monotonically increasing.');
    }

    if (missingCount > 0) {
      warnings.push(`${missingCount} rows contained non-numeric or missing values.`);
    }

    const firstTime = sampleRows[0].timestamp;
    const lastTime = sampleRows[sampleRows.length - 1].timestamp;
    const diff = lastTime - firstTime;
    let durationSeconds = diff;
    if (diff > 1000000) {
      // Milliseconds or Nanoseconds
      durationSeconds = diff > 1e11 ? diff / 1e9 : diff / 1000;
    }
    const estimatedRateHz = durationSeconds > 0 ? (dataLines.length / durationSeconds) : 50;

    return {
      isValid: true,
      rowCount: dataLines.length,
      hasMonotonicTimestamps: isMonotonic,
      missingValuesCount: missingCount,
      columns: header,
      sampleRows,
      durationSeconds,
      estimatedRateHz: Math.round(estimatedRateHz),
      warnings,
    };
  } catch (err: any) {
    return {
      isValid: false,
      rowCount: 0,
      hasMonotonicTimestamps: false,
      missingValuesCount: 0,
      columns: [],
      sampleRows: [],
      error: `Failed to parse sensor CSV: ${err?.message || 'Corrupted text file'}`,
      warnings,
    };
  }
}
