import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../features/data/DataContext';
import { useAuth } from '../features/auth/AuthContext';
import { Card } from '../components/ui/Card';
import { StatTile } from '../components/ui/StatTile';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SampleDataBadge } from '../components/ui/SampleDataBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { DisclaimerBanner } from '../components/ui/DisclaimerBanner';
import { Skeleton } from '../components/ui/Skeleton';
import { AndroidSyncStationModal } from '../components/sync/AndroidSyncStationModal';
import { formatDate, formatDateTime, formatDuration } from '../lib/formatters';
import {
  Bike,
  Activity,
  Calendar,
  AlertTriangle,
  Wrench,
  Clock,
  Play,
  Upload,
  Smartphone,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    vehicles,
    sessions,
    maintenanceEvents,
    mechanicConfirmations,
    activeVehicle,
    setActiveVehicleId,
    isLoading,
    error,
    refreshData,
    androidSync,
  } = useData();
  const { isDemoMode } = useAuth();
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(true);
  const navigate = useNavigate();

  // Sessions for current active vehicle (or all if none active)
  const vehicleSessions = activeVehicle
    ? sessions.filter((s) => s.vehicle_id === activeVehicle.id)
    : sessions;

  // Latest completed analysis
  const latestSessionWithAnalysis = vehicleSessions.find((s) => s.latest_analysis);
  const latestAnalysis = latestSessionWithAnalysis?.latest_analysis;

  // Sync status
  const latestAndroidSession = sessions.find((s) => s.source === 'android');
  const syncTimestamp = androidSync.lastSyncTime || latestAndroidSession?.started_at;
  const syncStatusText = syncTimestamp
    ? `Last synced: ${formatDateTime(syncTimestamp)}`
    : 'No data synced yet';

  // Recommendations extracted honestly from recorded sessions
  const pendingRecommendations = vehicleSessions
    .filter((s) => s.latest_analysis?.recommendation)
    .map((s) => ({
      sessionId: s.id,
      date: s.started_at,
      recommendation: s.latest_analysis!.recommendation!,
      resultCategory: s.latest_analysis!.result_category,
      model_version: s.latest_analysis!.model_version,
    }))
    .slice(0, 3);

  // Trend data strictly built from stored feature_summary records
  const trendData = vehicleSessions
    .filter((s) => s.latest_analysis?.feature_summary)
    .slice()
    .reverse()
    .map((s) => ({
      date: formatDate(s.started_at),
      rmsEnergy: s.latest_analysis?.feature_summary?.audio?.rms_energy
        ? Number((s.latest_analysis.feature_summary.audio.rms_energy * 100).toFixed(2))
        : null,
      spectralCentroid: s.latest_analysis?.feature_summary?.audio?.spectral_centroid || null,
      accelStd: s.latest_analysis?.feature_summary?.accelerometer?.std_xyz
        ? Number(s.latest_analysis.feature_summary.accelerometer.std_xyz[2].toFixed(2))
        : null,
      modelVersion: s.latest_analysis?.model_version || 'v0.0',
    }));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Condition Screening Dashboard</h1>
            {isDemoMode && <SampleDataBadge size="sm" />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal sensor synchronization overview for stationary motorcycle inspections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/diagnostic-lab')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] text-xs font-bold transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Recording
          </button>
        </div>
      </div>

      {/* Mandatory Positioning Banner */}
      <DisclaimerBanner />

      {/* Error Banner if any */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Database synchronization warning: {error}</span>
          </div>
          <button
            onClick={() => refreshData()}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition-colors cursor-pointer shrink-0 font-medium"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Primary Stat Tiles or Skeleton */}
      {isLoading && vehicles.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#12171F] border border-slate-800/80 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
              <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-24" />
              <Skeleton className="h-6 sm:h-7 w-12 sm:w-16" />
              <Skeleton className="h-2.5 sm:h-3 w-24 sm:w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <StatTile
            label="Registered Motorcycles"
            value={vehicles.length}
            icon={<Bike className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />}
            hint={vehicles.length > 0 ? `Active: ${activeVehicle?.nickname || vehicles[0].nickname}` : 'No motorcycles configured'}
          />
          <StatTile
            label="Inspection Sessions"
            value={vehicleSessions.length}
            icon={<Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />}
            hint={vehicleSessions.length > 0 ? `${vehicleSessions.length} sessions logged` : 'No inspection records yet'}
          />
          
          {/* Real Android Sync Tile */}
          <div
            onClick={() => setIsSyncModalOpen(true)}
            className="bg-[#12171F] border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-3 sm:p-4 flex flex-col justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider truncate">Android Sync</span>
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
            </div>
            <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5">
              <span
                className={`text-base sm:text-xl font-bold font-mono truncate ${
                  androidSync.syncState === 'synced' || Boolean(latestAndroidSession)
                    ? 'text-emerald-400'
                    : androidSync.syncState === 'syncing'
                    ? 'text-cyan-400 animate-pulse'
                    : androidSync.syncState === 'error'
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {androidSync.syncState === 'syncing'
                  ? 'Syncing...'
                  : (androidSync.syncState === 'synced' || Boolean(latestAndroidSession))
                  ? '✓ Synced'
                  : 'Ready'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] text-slate-400 gap-1">
              <span className="truncate">{syncStatusText}</span>
              <span className="text-[9px] sm:text-[10px] text-cyan-400 font-medium group-hover:underline shrink-0">Station →</span>
            </div>
          </div>

          {/* HONESTY RULE #4: Disabled Vehicle Health Score Placeholder */}
          <div className="bg-[#12171F] border border-slate-800/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between opacity-80">
            <div className="flex items-center justify-between gap-1 text-slate-400">
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider flex items-center gap-1 truncate">
                <span>Health Score</span>
                <span className="text-[9px] sm:text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">Reserved</span>
              </span>
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
            </div>
            <div className="mt-1.5 sm:mt-2 text-sm sm:text-lg font-bold font-mono text-slate-400 truncate">Not Validated</div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1 sm:mt-1.5 leading-snug line-clamp-2">
              Withheld per honesty rules pending multi-sensor validation.
            </p>
          </div>
        </div>
      )}

      {/* Active Motorcycle Profile Card */}
      {activeVehicle ? (
        <Card
          title={
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 text-cyan-400" />
              <span>Active Motorcycle: {activeVehicle.nickname}</span>
              {isDemoMode && <SampleDataBadge size="sm" />}
            </div>
          }
          subtitle={`${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} • Reg: ${activeVehicle.registration_identifier || 'Not set'}`}
          action={
            <button
              onClick={() => navigate('/health-passport')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>View Health Passport</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#0E1420] p-3 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-slate-400 block text-[11px]">Make & Model</span>
              <span className="font-medium text-slate-200">{activeVehicle.make} {activeVehicle.model}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Model Year</span>
              <span className="font-mono text-slate-200">{activeVehicle.year}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Total Inspections</span>
              <span className="font-mono text-cyan-400 font-semibold">{vehicleSessions.length} recorded</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Last Monitored</span>
              <span className="text-slate-200">
                {vehicleSessions[0]?.started_at ? formatDate(vehicleSessions[0].started_at) : 'Never'}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={Bike}
          title="No Motorcycle Registered"
          description="Register your first motorcycle to start tracking acoustic and inertial inspection sessions."
          actionText="Add Motorcycle Profile"
          onAction={() => navigate('/health-passport')}
        />
      )}

      {/* Latest Analysis & Workshop Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          {/* Latest Analysis Block */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Latest Screening Analysis</span>
                {latestAnalysis && <StatusBadge category={latestAnalysis.result_category} size="sm" />}
              </div>
            }
            subtitle={latestAnalysis ? `Analyzed on ${formatDateTime(latestAnalysis.completed_at || latestAnalysis.started_at)}` : undefined}
          >
            {latestAnalysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 bg-[#0E1420] p-2.5 sm:p-3 rounded-lg border border-slate-800 text-[10px] sm:text-xs">
                  <div>
                    <span className="text-slate-400 block text-[9px] sm:text-[11px]">Classification</span>
                    <span className="font-semibold text-slate-100 capitalize truncate block">
                      {latestAnalysis.result_category.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] sm:text-[11px]">Model</span>
                    <span className="font-mono text-[10px] sm:text-xs text-slate-300 truncate block">
                      {latestAnalysis.model_name ? `${latestAnalysis.model_name}` : 'Not configured'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] sm:text-[11px]">Confidence</span>
                    <span className="font-mono text-[10px] sm:text-xs text-slate-300 truncate block">
                      {latestAnalysis.confidence !== null && latestAnalysis.confidence !== undefined
                        ? `${(latestAnalysis.confidence * 100).toFixed(0)}%`
                        : 'Unavailable'}
                    </span>
                  </div>
                </div>

                {/* Honesty separation: AI Observation vs Mechanic Diagnosis */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-xs">
                    <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded shrink-0">
                      Observation
                    </span>
                    <p className="text-slate-300 text-[11px] sm:text-xs">
                      {latestAnalysis.recommendation || 'Acoustic waveform conforms to baseline envelope.'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/inspection/${latestSessionWithAnalysis?.id}`)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>View Full Session Detail</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="No Screening Results Yet"
                description="Upload an audio WAV recording and motion sensor CSV in the Diagnostic Lab to view screening classifications."
                actionText="Go to Diagnostic Lab"
                onAction={() => navigate('/diagnostic-lab')}
              />
            )}
          </Card>
        </div>

        {/* Recent Workshop Records */}
        <div className="lg:col-span-1">
          <Card
            title={
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>Workshop Records</span>
              </div>
            }
            action={
              <button
                onClick={() => navigate('/health-passport')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
              >
                View all
              </button>
            }
          >
            {mechanicConfirmations.length > 0 || maintenanceEvents.length > 0 ? (
              <div className="space-y-2.5">
                {/* Mechanic Confirmed Records */}
                {mechanicConfirmations.slice(0, 2).map((conf) => (
                  <div key={conf.id} className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-[11px] sm:text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Confirmed
                      </span>
                      <span className="text-slate-400 text-[10px] font-mono">{conf.confirmed_on}</span>
                    </div>
                    <p className="font-medium text-slate-200 capitalize truncate">Component: {conf.component.replace('_', ' ')}</p>
                    <p className="text-slate-300 line-clamp-2">{conf.diagnosis_text}</p>
                    <p className="text-[10px] text-slate-400 italic truncate">By: {conf.mechanic_name}</p>
                  </div>
                ))}

                {/* Maintenance Events */}
                {maintenanceEvents.slice(0, 2).map((m) => (
                  <div key={m.id} className="p-2.5 rounded-lg bg-[#0E1420] border border-slate-800 text-[11px] sm:text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-medium text-slate-200 capitalize truncate">{m.event_type.replace('_', ' ')}</span>
                      <span className="font-mono text-[10px]">{m.event_date}</span>
                    </div>
                    <p className="text-slate-300 line-clamp-2">{m.description}</p>
                    {m.mileage_km && <p className="text-[10px] font-mono text-cyan-400">{m.mileage_km.toLocaleString()} km</p>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wrench}
                title="No Workshop Records"
                description="Add routine maintenance or technician diagnoses in the Health Passport tab."
              />
            )}
          </Card>
        </div>
      </div>

      {/* Screening Analytics & Trends: Aligned Side-by-Side */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Screening Insights & Trends</span>
          <div className="flex items-center gap-1 bg-[#12171F] p-0.5 rounded-lg border border-slate-800 text-[10px] sm:text-[11px]">
            <button
              onClick={() => setIsSideBySide(true)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                isSideBySide ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Align side by side"
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setIsSideBySide(false)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                !isSideBySide ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Stacked cards"
            >
              Stacked
            </button>
          </div>
        </div>

        <div className={`grid gap-2.5 sm:gap-4 ${isSideBySide ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
          {/* Historical Trend Chart (Built strictly from stored feature summaries) */}
          <Card
            title={
              <div className="flex items-center gap-1.5 truncate">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
                <span className="truncate">Acoustic & Vibration Trend</span>
              </div>
            }
            subtitle="Derived strictly from stored inspection features"
          >
            {trendData.length > 0 ? (
              <div className="space-y-2.5">
                <div className="h-36 sm:h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                      <YAxis stroke="#64748B" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rmsEnergy"
                        name="RMS Energy (x100)"
                        stroke="#22D3EE"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#22D3EE' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="accelStd"
                        name="Z-Axis Accel (m/s²)"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#F59E0B' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <DisclaimerBanner type="sensor_note" />
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="Insufficient Data For Trend"
                description="Historical trends require at least 1 inspection session with extracted feature summaries."
              />
            )}
          </Card>

          {/* Inspection Recommendations */}
          <Card
            title={
              <div className="flex items-center gap-1.5 truncate">
                <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span className="truncate">Screening Recommendations</span>
              </div>
            }
            subtitle="Extracted from stored session observations"
          >
            {pendingRecommendations.length > 0 ? (
              <div className="space-y-2.5">
                {pendingRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#0E1420] border border-slate-800 text-[11px] sm:text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{formatDate(rec.date)}</span>
                      <StatusBadge category={rec.resultCategory} size="sm" />
                    </div>
                    <p className="text-slate-200 leading-snug line-clamp-3">{rec.recommendation}</p>
                    <div className="text-[9px] text-slate-400 font-mono">
                      Model: {rec.model_version || 'v0.0'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ShieldAlert}
                title="No Pending Recommendations"
                description="Routine inspection recommendations will appear here following completed screening runs."
              />
            )}
          </Card>
        </div>
      </div>

      {/* Recent Recordings List */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Recent Inspection Recordings</span>
          </div>
        }
        subtitle="Chronological inspection sessions captured via Android sync or web upload"
      >
        {vehicleSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Sensors</th>
                  <th className="py-2.5 px-3">Screening Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {vehicleSessions.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-200">{formatDateTime(s.started_at)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans ${
                        s.source === 'android' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {s.source === 'android' ? 'Android App' : 'Web Upload'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{formatDuration(s.duration_seconds)}</td>
                    <td className="py-3 px-3 text-[11px] font-sans text-slate-300">
                      {s.sensor_availability?.audio ? 'Audio ' : ''}
                      {s.sensor_availability?.accelerometer ? '+ Accel ' : ''}
                      {s.sensor_availability?.gyroscope ? '+ Gyro' : ''}
                    </td>
                    <td className="py-3 px-3">
                      {s.latest_analysis ? (
                        <StatusBadge category={s.latest_analysis.result_category} size="sm" />
                      ) : (
                        <span className="text-slate-400 font-sans italic text-[11px]">Unanalyzed</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => navigate(`/inspection/${s.id}`)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            title="No Recordings Synchronized"
            description="Use the MOTOSYNQ Android app to record an inspection session or upload recordings in the Diagnostic Lab."
            actionText="Go to Diagnostic Lab"
            onAction={() => navigate('/diagnostic-lab')}
          />
        )}
      </Card>

      {/* Android Sync Modal */}
      <AndroidSyncStationModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
    </div>
  );
};
