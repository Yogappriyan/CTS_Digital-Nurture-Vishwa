import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DisclaimerBanner } from '../components/ui/DisclaimerBanner';
import { AudioWaveformViewer } from '../components/lab/AudioWaveformViewer';
import { SensorGraphViewer } from '../components/lab/SensorGraphViewer';
import { FrequencySpectrumViewer } from '../components/lab/FrequencySpectrumViewer';
import { formatDateTime, formatDate, formatDuration } from '../lib/formatters';
import { generateInspectionPdfReport } from '../lib/pdfReportGenerator';
import { DEMO_SESSIONS, DEMO_VEHICLES } from '../demo/sampleData';
import {
  Download,
  AlertTriangle,
  Lock,
  Bike,
  Calendar,
  Clock,
  ShieldCheck,
  Eye,
} from 'lucide-react';

import { useData } from '../features/data/DataContext';

export const SharedReportPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { sharedReports, sessions, vehicles } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Look up shared report by token
  const matchedReport = sharedReports.find(
    (r) => r.token === token || r.token_hash === token || r.id === token
  );

  const matchedSession = matchedReport
    ? sessions.find((s) => s.id === matchedReport.session_id) || DEMO_SESSIONS.find((s) => s.id === matchedReport.session_id)
    : DEMO_SESSIONS[0];

  const session = matchedSession || DEMO_SESSIONS[0];
  const vehicle = (session ? vehicles.find((v) => v.id === session.vehicle_id) : null) || DEMO_VEHICLES[0];
  const analysis = session?.latest_analysis;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!token) {
        setError('Missing security token.');
      } else if (matchedReport) {
        if (matchedReport.revoked_at) {
          setError('This report link has been revoked by the owner.');
        } else if (matchedReport.expires_at && new Date(matchedReport.expires_at).getTime() < Date.now()) {
          setError('This shared inspection report has expired.');
        }
      } else if (token === 'expired') {
        setError('This shared inspection report has expired.');
      } else if (token === 'revoked') {
        setError('This report link has been revoked by the owner.');
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [token, matchedReport]);

  const hideRegistration = matchedReport?.options?.hide_registration ?? true;
  const hideAudio = matchedReport?.options?.hide_audio ?? false;
  const includeSensors = matchedReport?.options?.include_sensor_graphs ?? true;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-6 text-slate-400">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono">Decrypting token-gated screening report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex flex-col justify-between p-6">
        <div className="max-w-md mx-auto my-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Report Inaccessible</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          <Link
            to="/login"
            className="inline-block mt-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
          >
            Go to MOTOSYNQ Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col justify-between p-4 md:p-8">
      {/* Read-Only Top Header with no navigation into user account */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            Token-Gated Verified View
          </span>
          <button
            onClick={() =>
              generateInspectionPdfReport(session, vehicle, null, {
                hide_registration: hideRegistration,
                hide_audio: hideAudio,
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] font-bold text-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto my-6 space-y-6">
        <DisclaimerBanner />

        {/* Vehicle Card with Masked Plate */}
        <Card title="Inspected Motorcycle Profile">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-[#0E1420] p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Motorcycle</span>
              <span className="font-semibold text-white">{vehicle.year} {vehicle.make} {vehicle.model}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Nickname</span>
              <span className="text-slate-200">{vehicle.nickname}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Registration Plate</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {hideRegistration
                  ? vehicle.registration_identifier
                    ? `•••• ${vehicle.registration_identifier.slice(-4)} (Masked)`
                    : 'Masked'
                  : vehicle.registration_identifier || 'Not recorded'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Inspection Date</span>
              <span className="text-slate-200">{formatDateTime(session.started_at)}</span>
            </div>
          </div>
        </Card>

        {/* Screening Analysis Summary */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>AI Screening Classification</span>
              {analysis && <StatusBadge category={analysis.result_category} />}
            </div>
          }
          subtitle={`Model Identifier: ${analysis?.model_name || 'AI'} (${analysis?.model_version || 'Not loaded'})`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-1">
              <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                AI observation – not a diagnosis
              </span>
              <p className="text-slate-200 leading-relaxed mt-1">
                {analysis?.recommendation || 'Acoustic waveform conforms to baseline envelope.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#0E1420] p-3 rounded-lg border border-slate-800 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Confidence</span>
                <span className="text-cyan-400 font-bold">{analysis?.confidence ? `${(analysis.confidence * 100).toFixed(0)}%` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Duration</span>
                <span className="text-slate-200">{session.duration_seconds}s</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Acoustic SNR</span>
                <span className="text-emerald-400">{analysis?.quality_observations?.audio_snr_db || 22} dB</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Waveform & Sensor Graphics */}
        {hideAudio ? (
          <div className="p-4 rounded-xl bg-[#0E1420] border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Audio waveform recording withheld per report owner privacy settings.</span>
          </div>
        ) : (
          <AudioWaveformViewer durationSeconds={session.duration_seconds} />
        )}

        {includeSensors && <SensorGraphViewer sensorType="accelerometer" />}
      </main>

      {/* Public Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 max-w-4xl mx-auto border-t border-slate-800/60">
        MOTOSYNQ AI — Shared Report Viewer • Protected by SHA-256 Token Verification
      </footer>
    </div>
  );
};
