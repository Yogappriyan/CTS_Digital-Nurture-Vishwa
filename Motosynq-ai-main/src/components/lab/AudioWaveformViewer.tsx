import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, AlertTriangle } from 'lucide-react';
import { formatDuration } from '../../lib/formatters';

interface AudioWaveformViewerProps {
  audioBuffer?: AudioBuffer | null;
  audioUrl?: string | null;
  durationSeconds?: number;
  sampleRate?: number;
}

export const AudioWaveformViewer: React.FC<AudioWaveformViewerProps> = ({
  audioBuffer,
  audioUrl,
  durationSeconds = 30,
  sampleRate = 16000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [hasClipping, setHasClipping] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    let channelData: Float32Array;
    if (audioBuffer) {
      channelData = audioBuffer.getChannelData(0);
    } else {
      // Procedural synthetic display for preview when decoded buffer is loading
      channelData = new Float32Array(width * 20);
      for (let i = 0; i < channelData.length; i++) {
        const t = i / 100;
        channelData[i] =
          (Math.sin(t * 0.4) * 0.3 + Math.sin(t * 1.8) * 0.2 + (Math.random() - 0.5) * 0.15);
      }
    }

    const step = Math.ceil(channelData.length / width);
    const amp = height / 2;
    let clippingDetected = false;

    ctx.fillStyle = '#22D3EE';
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = channelData[x * step + j] || 0;
        if (datum < min) min = datum;
        if (datum > max) max = datum;
        if (Math.abs(datum) >= 0.98) clippingDetected = true;
      }

      const yTop = (1 + min) * amp;
      const yBottom = (1 + max) * amp;
      ctx.fillRect(x, yTop, 1, Math.max(1, yBottom - yTop));
    }
    setHasClipping(clippingDetected);

    // Playback head line
    if (durationSeconds > 0) {
      const playX = (playbackTime / durationSeconds) * width;
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, height);
      ctx.stroke();
    }
  }, [audioBuffer, playbackTime, zoomLevel, durationSeconds]);

  // Audio playback controls
  const togglePlay = () => {
    if (!audioBuffer) {
      // Mock playback time toggle if no buffer
      setIsPlaying(!isPlaying);
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;

    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        pauseTimeRef.current = ctx.currentTime - startTimeRef.current;
      }
      setIsPlaying(false);
    } else {
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      const offset = pauseTimeRef.current % audioBuffer.duration;
      source.start(0, offset);
      startTimeRef.current = ctx.currentTime - offset;
      sourceNodeRef.current = source;
      setIsPlaying(true);

      source.onended = () => {
        setIsPlaying(false);
        pauseTimeRef.current = 0;
        setPlaybackTime(0);
      };
    }
  };

  useEffect(() => {
    let anim: number;
    if (isPlaying) {
      const updateTime = () => {
        if (audioContextRef.current) {
          const cur = audioContextRef.current.currentTime - startTimeRef.current;
          setPlaybackTime(Math.min(durationSeconds, Math.max(0, cur)));
        } else {
          setPlaybackTime((p) => (p >= durationSeconds ? 0 : p + 0.1));
        }
        anim = requestAnimationFrame(updateTime);
      };
      anim = requestAnimationFrame(updateTime);
    }
    return () => cancelAnimationFrame(anim);
  }, [isPlaying, durationSeconds]);

  return (
    <div className="bg-[#0E1522] border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">Acoustic Signal Waveform</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {sampleRate} Hz • 16-bit PCM
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasClipping && (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Clipping Markers Detected
            </span>
          )}
          <span className="text-xs font-mono text-cyan-400 font-semibold">
            {formatDuration(playbackTime)} / {formatDuration(durationSeconds)}
          </span>
        </div>
      </div>

      {/* Canvas Waveform */}
      <div className="relative w-full h-32 bg-[#090E17] rounded-lg overflow-hidden border border-slate-800/80">
        <canvas
          ref={canvasRef}
          width={800}
          height={128}
          className="w-full h-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            setPlaybackTime(clickPos * durationSeconds);
            pauseTimeRef.current = clickPos * durationSeconds;
          }}
        />
        {/* Subtle zero decibel axis */}
        <div className="absolute top-1 left-2 text-[9px] font-mono text-slate-500 select-none">+1.0</div>
        <div className="absolute bottom-1 left-2 text-[9px] font-mono text-slate-500 select-none">-1.0</div>
      </div>

      {/* Waveform Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] font-bold text-xs transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? 'Pause' : 'Play Audio'}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setPlaybackTime(0);
              pauseTimeRef.current = 0;
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Reset to beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span>Zoom:</span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            -
          </button>
          <span className="font-mono">{zoomLevel}x</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(4, z + 0.5))}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
