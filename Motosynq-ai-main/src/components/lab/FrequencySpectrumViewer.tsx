import React, { useEffect, useRef, useState } from 'react';
import { BarChart2, Layers } from 'lucide-react';

interface FrequencySpectrumViewerProps {
  spectralCentroid?: number;
  spectralBandwidth?: number;
  spectralRolloff?: number;
}

export const FrequencySpectrumViewer: React.FC<FrequencySpectrumViewerProps> = ({
  spectralCentroid = 1540,
  spectralBandwidth = 2050,
  spectralRolloff = 3400,
}) => {
  const [activeTab, setActiveTab] = useState<'spectrum' | 'spectrogram'>('spectrum');
  const [isLogScale, setIsLogScale] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw simulated or computed FFT / Spectrogram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (activeTab === 'spectrum') {
      // Frequency Magnitude Curve
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const numBins = 128;
      for (let i = 0; i < numBins; i++) {
        const x = (i / numBins) * width;
        // Peak near engine fundamental + harmonics (idle ~ 20 Hz fundamental, mechanical harmonics at 200-2500 Hz)
        const freq = (i / numBins) * 8000;
        const normFreq = isLogScale ? Math.log10(1 + freq) / Math.log10(8001) : freq / 8000;
        const normX = normFreq * width;

        const peak1 = Math.exp(-Math.pow((freq - 450) / 180, 2)) * 0.7;
        const peak2 = Math.exp(-Math.pow((freq - 1200) / 320, 2)) * 0.85;
        const peak3 = Math.exp(-Math.pow((freq - 2400) / 450, 2)) * 0.5;
        const noise = (Math.sin(i * 1.5) * 0.05 + 0.05);

        const mag = Math.min(0.95, peak1 + peak2 + peak3 + noise);
        const y = height - mag * (height - 20) - 10;

        if (i === 0) ctx.moveTo(normX, y);
        else ctx.lineTo(normX, y);
      }
      ctx.stroke();

      // Spectral Centroid Marker
      const centroidFreq = spectralCentroid;
      const centroidNorm = isLogScale
        ? Math.log10(1 + centroidFreq) / Math.log10(8001)
        : centroidFreq / 8000;
      const centroidX = centroidNorm * width;

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(centroidX, 0);
      ctx.lineTo(centroidX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#F59E0B';
      ctx.font = '10px monospace';
      ctx.fillText(`Centroid: ${Math.round(centroidFreq)} Hz`, centroidX + 6, 20);
    } else {
      // Spectrogram color map (STFT time vs frequency)
      const numCols = 80;
      const numRows = 32;
      const colW = width / numCols;
      const rowH = height / numRows;

      for (let c = 0; c < numCols; c++) {
        for (let r = 0; r < numRows; r++) {
          const freqRatio = (numRows - r) / numRows;
          const heat = Math.sin(c * 0.2 + r * 0.15) * 0.4 + (1 - freqRatio) * 0.5;
          const intensity = Math.max(0, Math.min(1, heat));

          // Plasma / Viridis gradient
          const red = Math.floor(intensity * 34);
          const green = Math.floor(intensity * 211);
          const blue = Math.floor(238 * intensity);

          ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          ctx.fillRect(c * colW, r * rowH, colW + 0.5, rowH + 0.5);
        }
      }
    }
  }, [activeTab, isLogScale, spectralCentroid]);

  return (
    <div className="bg-[#0E1522] border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">
            {activeTab === 'spectrum' ? 'Frequency Magnitude Spectrum (FFT)' : 'STFT Spectrogram Preview'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md bg-slate-900 border border-slate-800 p-0.5 text-[11px]">
            <button
              onClick={() => setActiveTab('spectrum')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeTab === 'spectrum' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              Spectrum
            </button>
            <button
              onClick={() => setActiveTab('spectrogram')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeTab === 'spectrogram' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              Spectrogram
            </button>
          </div>

          {activeTab === 'spectrum' && (
            <button
              onClick={() => setIsLogScale(!isLogScale)}
              className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                isLogScale ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isLogScale ? 'Log Scale' : 'Linear'}
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full h-36 bg-[#090E17] rounded-lg overflow-hidden border border-slate-800/80">
        <canvas ref={canvasRef} width={800} height={144} className="w-full h-full" />
        <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">8,000 Hz</div>
        <div className="absolute bottom-1 left-2 text-[9px] font-mono text-slate-500">0 Hz</div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#121824] p-2.5 rounded-lg border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 block">Centroid</span>
          <span className="font-mono text-cyan-300 font-semibold">{Math.round(spectralCentroid)} Hz</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Bandwidth</span>
          <span className="font-mono text-slate-300">{Math.round(spectralBandwidth)} Hz</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Roll-off (85%)</span>
          <span className="font-mono text-slate-300">{Math.round(spectralRolloff)} Hz</span>
        </div>
      </div>
    </div>
  );
};
