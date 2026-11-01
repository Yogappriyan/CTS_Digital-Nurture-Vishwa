import { ResultCategory } from '../types';

export function formatDate(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatDuration(seconds?: number | null): string {
  if (seconds === undefined || seconds === null) return '0s';
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}m ${rem}s`;
}

export function getResultBadgeConfig(category?: ResultCategory): {
  label: string;
  bg: string;
  text: string;
  border: string;
  dotColor: string;
  description: string;
} {
  switch (category) {
    case 'normal_pattern':
      return {
        label: 'Normal Pattern',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dotColor: 'bg-emerald-400',
        description: 'Screening pattern matches validated baseline idle acoustics.',
      };
    case 'abnormal_pattern':
      return {
        label: 'Abnormal Pattern',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dotColor: 'bg-amber-400',
        description: 'Acoustic/inertial deviations observed. Mechanic verification advised.',
      };
    case 'inconclusive':
      return {
        label: 'Inconclusive',
        bg: 'bg-sky-500/10',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        dotColor: 'bg-sky-400',
        description: 'High uncertainty or ambient noise. Repeat inspection recommended.',
      };
    case 'unsuitable_recording':
      return {
        label: 'Unsuitable Recording',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        dotColor: 'bg-rose-400',
        description: 'Clipping, distortion, or severe motion artifacts detected.',
      };
    case 'model_not_configured':
    default:
      return {
        label: 'AI Model Not Configured',
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        dotColor: 'bg-slate-400',
        description: 'Model artifact not loaded. Feature summaries and waveform visible; no prediction made.',
      };
  }
}
