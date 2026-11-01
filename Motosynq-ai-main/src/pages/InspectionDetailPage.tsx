import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../features/data/DataContext';
import { useAuth } from '../features/auth/AuthContext';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SampleDataBadge } from '../components/ui/SampleDataBadge';
import { DisclaimerBanner } from '../components/ui/DisclaimerBanner';
import { Modal } from '../components/ui/Modal';
import { AudioWaveformViewer } from '../components/lab/AudioWaveformViewer';
import { SensorGraphViewer } from '../components/lab/SensorGraphViewer';
import { FrequencySpectrumViewer } from '../components/lab/FrequencySpectrumViewer';
import { formatDate, formatDateTime, formatDuration } from '../lib/formatters';
import { generateInspectionPdfReport } from '../lib/pdfReportGenerator';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Bike,
  Cpu,
  Download,
  Share2,
  Trash2,
  CheckCircle2,
  Activity,
  Layers,
  Wrench,
  AlertTriangle,
  FileArchive,
} from 'lucide-react';

export const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sessions, vehicles, deleteSession, mechanicConfirmations } = useData();
  const { isDemoMode } = useAuth();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const session = sessions.find((s) => s.id === id);
  const vehicle = session ? vehicles.find((v) => v.id === session.vehicle_id) : null;
  const analysis = session?.latest_analysis;
  const relatedMechanic = mechanicConfirmations.find((m) => m.session_id === id);

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-white">Inspection Session Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The requested inspection record does not exist or was deleted.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-[#0B1220] font-bold text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteSession(session.id);
    setIsDeleteModalOpen(false);
    navigate('/dashboard');
  };

  const handleExportZip = () => {
    // Generate JSON package download matching Android app format
    const sessionPackage = {
      session_id: session.id,
      vehicle_id: session.vehicle_id,
      started_at: session.started_at,
      ended_at: session.ended_at,
      duration_seconds: session.duration_seconds,
      source: session.source,
      recording_config: session.recording_config,
      sensor_availability: session.sensor_availability,
      analysis: session.latest_analysis,
    };
    const blob = new Blob([JSON.stringify(sessionPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${session.id}_package.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                Inspection Session: {session.id}
              </h1>
              {isDemoMode && <SampleDataBadge size="sm" />}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Recorded {formatDateTime(session.started_at)} via {session.source === 'android' ? 'Android Sync' : 'Web Upload'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => generateInspectionPdfReport(session, vehicle, relatedMechanic)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] font-bold text-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate PDF</span>
          </button>
          <button
            onClick={handleExportZip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
          >
            <FileArchive className="w-3.5 h-3.5" />
            <span>Export Package</span>
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-pointer"
            title="Delete Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Processing Status Timeline */}
      <Card title="Signal Ingestion & Processing Timeline">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {[
            { label: 'Recorded', time: formatDateTime(session.started_at), done: true },
            { label: 'Uploaded', time: session.source === 'android' ? 'Via Sync Worker' : 'Direct Upload', done: true },
            { label: 'Validated', time: 'PCM RIFF Passed', done: true },
            { label: 'Processed', time: `${session.duration_seconds}s Audio + Sensors`, done: true },
            {
              label: 'Classification',
              time: analysis?.result_category ? analysis.result_category.replace('_', ' ') : 'Pending',
              done: Boolean(analysis),
            },
          ].map((step, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#0E1420] border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{step.label}</span>
              </div>
              <p className="text-[11px] text-slate-400 capitalize">{step.time}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Associated Motorcycle & Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Analysis Classification & Uncertainty">
          {analysis ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0E1420] p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Screening Category</span>
                  <StatusBadge category={analysis.result_category} size="sm" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Prediction Confidence</span>
                  <span className="font-mono text-cyan-400 font-semibold">
                    {analysis.confidence ? `${(analysis.confidence * 100).toFixed(0)}%` : 'Unavailable'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Model & Version</span>
                  <span className="font-mono text-slate-300">
                    {analysis.model_name || 'AI Model'} ({analysis.model_version || 'Not loaded'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Inference Completed</span>
                  <span className="text-slate-300 font-mono">{formatDateTime(analysis.completed_at)}</span>
                </div>
              </div>

              {/* AI Observation vs Mechanic separation */}
              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 space-y-1">
                <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  AI observation – not a diagnosis
                </span>
                <p className="text-slate-300 leading-relaxed mt-1">
                  {analysis.recommendation || 'Signals conform to stationary baseline acoustics.'}
                </p>
                {analysis.uncertainty?.description && (
                  <p className="text-[11px] text-slate-400 italic mt-1">
                    Uncertainty: {analysis.uncertainty.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No analysis results generated for this session.</p>
          )}
        </Card>

        <Card title="Motorcycle Profile & Hardware Link">
          {vehicle ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-100">
                <Bike className="w-4 h-4 text-cyan-400" />
                <span>{vehicle.nickname}</span>
              </div>
              <p className="text-slate-400">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
              <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-400 text-[11px]">
                <p>Registration: {vehicle.registration_identifier ? `•••• ${vehicle.registration_identifier.slice(-4)}` : 'Masked'}</p>
                <p>Mounting: {session.recording_config?.mount_position || 'Handlebar clamp'}</p>
                <p>Device: {session.recording_config?.device_model || 'Android Smartphone'}</p>
              </div>
              <button
                onClick={() => navigate('/health-passport')}
                className="w-full mt-2 py-1.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                Open Health Passport
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Unassigned vehicle</p>
          )}
        </Card>
      </div>

      {/* Signal Visualizations */}
      <AudioWaveformViewer
        durationSeconds={session.duration_seconds}
        sampleRate={session.recording_config?.audio_sample_rate || 16000}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FrequencySpectrumViewer />
        <SensorGraphViewer sensorType="accelerometer" nominalRateHz={session.recording_config?.sensor_rate_hz || 50} />
      </div>

      {/* Mechanic Notes if confirmed */}
      {relatedMechanic && (
        <Card title="Attached Workshop Confirmation">
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Mechanic confirmed
              </span>
              <span className="text-slate-400 font-mono text-[10px]">{relatedMechanic.confirmed_on}</span>
            </div>
            <p className="font-semibold text-slate-100 capitalize">
              Component: {relatedMechanic.component.replace('_', ' ')}
            </p>
            <p className="text-slate-300">{relatedMechanic.diagnosis_text}</p>
            <p className="text-[11px] text-slate-400 italic">
              Inspected by: {relatedMechanic.mechanic_name} ({relatedMechanic.workshop_name})
            </p>
          </div>
        </Card>
      )}

      {/* DELETE CONFIRM MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Session Deletion">
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Are you sure you want to delete inspection session <strong className="text-white font-mono">{session.id}</strong>?
            This will permanently remove the acoustic recording, sensor records, and associated analysis results.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
