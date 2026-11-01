import React, { useState } from 'react';
import { DisclaimerBanner } from '../ui/DisclaimerBanner';
import { Activity, Compass } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface SensorGraphViewerProps {
  sensorType: 'accelerometer' | 'gyroscope';
  sampleData?: { timestamp: number; x: number; y: number; z: number }[];
  nominalRateHz?: number;
}

export const SensorGraphViewer: React.FC<SensorGraphViewerProps> = ({
  sensorType,
  sampleData,
  nominalRateHz = 50,
}) => {
  const [showMagnitude, setShowMagnitude] = useState(true);

  // Generate synthetic representative points if no raw data is loaded
  const chartData = (sampleData && sampleData.length > 0)
    ? sampleData.slice(0, 100).map((pt, idx) => {
        const mag = Math.sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z);
        return {
          time: `${(idx / nominalRateHz).toFixed(1)}s`,
          x: Number(pt.x.toFixed(2)),
          y: Number(pt.y.toFixed(2)),
          z: Number(pt.z.toFixed(2)),
          mag: Number(mag.toFixed(2)),
        };
      })
    : Array.from({ length: 60 }).map((_, idx) => {
        const t = idx * 0.05;
        const x = Math.sin(t * 8) * 0.8 + 0.1;
        const y = Math.cos(t * 6) * 0.7 + 0.2;
        const z = 9.8 + Math.sin(t * 12) * 1.2;
        const mag = Math.sqrt(x * x + y * y + z * z);
        return {
          time: `${t.toFixed(1)}s`,
          x: Number(x.toFixed(2)),
          y: Number(y.toFixed(2)),
          z: Number(z.toFixed(2)),
          mag: Number(mag.toFixed(2)),
        };
      });

  const unit = sensorType === 'accelerometer' ? 'm/s²' : 'rad/s';
  const title = sensorType === 'accelerometer' ? 'Accelerometer Kinematics' : 'Gyroscope Angular Velocity';

  return (
    <div className="bg-[#0E1522] border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {sensorType === 'accelerometer' ? (
            <Activity className="w-4 h-4 text-amber-400" />
          ) : (
            <Compass className="w-4 h-4 text-cyan-400" />
          )}
          <span className="text-xs font-semibold text-slate-200">{title}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {nominalRateHz} Hz • ({unit})
          </span>
        </div>

        <button
          onClick={() => setShowMagnitude(!showMagnitude)}
          className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
            showMagnitude
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {showMagnitude ? 'Hide Magnitude' : 'Show Magnitude'}
        </button>
      </div>

      {/* Chart */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
            <YAxis stroke="#64748B" fontSize={10} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" dataKey="x" stroke="#EF4444" name="X axis" dot={false} strokeWidth={1.5} />
            <Line type="monotone" dataKey="y" stroke="#10B981" name="Y axis" dot={false} strokeWidth={1.5} />
            <Line type="monotone" dataKey="z" stroke="#3B82F6" name="Z axis" dot={false} strokeWidth={1.5} />
            {showMagnitude && (
              <Line
                type="monotone"
                dataKey="mag"
                stroke="#F59E0B"
                name="Vector Magnitude |v|"
                dot={false}
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mandatory Sensor Mounting Disclaimer */}
      <DisclaimerBanner type="sensor_note" />
    </div>
  );
};
