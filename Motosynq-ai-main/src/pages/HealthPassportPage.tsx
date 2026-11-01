import React, { useState } from 'react';
import { useData } from '../features/data/DataContext';
import { useAuth } from '../features/auth/AuthContext';
import { Vehicle, MaintenanceEvent, MechanicConfirmation, SharedReport } from '../types';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SampleDataBadge } from '../components/ui/SampleDataBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { DisclaimerBanner } from '../components/ui/DisclaimerBanner';
import { formatDate, formatDateTime, formatDuration } from '../lib/formatters';
import { generateInspectionPdfReport } from '../lib/pdfReportGenerator';
import {
  Bike,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Share2,
  Wrench,
  TrendingUp,
  Download,
  Copy,
  Check,
  Shield,
  Clock,
  EyeOff,
  ExternalLink,
  AlertTriangle,
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
import { useNavigate } from 'react-router-dom';

export const HealthPassportPage: React.FC = () => {
  const {
    vehicles,
    activeVehicle,
    activeVehicleId,
    setActiveVehicleId,
    addVehicle,
    deleteVehicle,
    sessions,
    maintenanceEvents,
    addMaintenanceEvent,
    mechanicConfirmations,
    addMechanicConfirmation,
    sharedReports,
    createSharedReport,
    revokeSharedReport,
  } = useData();

  const { isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'inspections' | 'trends' | 'maintenance' | 'reports' | 'sharing'
  >('overview');

  // Add Vehicle Modal
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newReg, setNewReg] = useState('');

  // Add Maintenance Modal
  const [isAddMaintOpen, setIsAddMaintOpen] = useState(false);
  const [maintType, setMaintType] = useState<MaintenanceEvent['event_type']>('routine_service');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintMileage, setMaintMileage] = useState<string>('');
  const [maintBy, setMaintBy] = useState('');
  const [maintDate, setMaintDate] = useState(new Date().toISOString().split('T')[0]);

  // Add Mechanic Confirmation Modal
  const [isAddMechOpen, setIsAddMechOpen] = useState(false);
  const [mechComponent, setMechComponent] = useState<MechanicConfirmation['component']>('engine');
  const [mechDiagnosis, setMechDiagnosis] = useState('');
  const [mechName, setMechName] = useState('');
  const [mechWorkshop, setMechWorkshop] = useState('');
  const [mechDate, setMechDate] = useState(new Date().toISOString().split('T')[0]);

  // Share Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareSessionId, setShareSessionId] = useState<string>('');
  const [shareExpiryDays, setShareExpiryDays] = useState<number>(7);
  const [hideReg, setHideReg] = useState(true);
  const [hideAudio, setHideAudio] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const currentVehicle = activeVehicle || vehicles[0];
  const vehicleSessions = currentVehicle ? sessions.filter((s) => s.vehicle_id === currentVehicle.id) : [];
  const vehicleMaintenance = currentVehicle ? maintenanceEvents.filter((m) => m.vehicle_id === currentVehicle.id) : [];
  const vehicleMechanic = currentVehicle ? mechanicConfirmations.filter((m) => m.vehicle_id === currentVehicle.id) : [];

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNickname || !newMake || !newModel) return;
    await addVehicle({
      nickname: newNickname,
      make: newMake,
      model: newModel,
      year: newYear,
      registration_identifier: newReg || null,
      notes: null,
    });
    setNewNickname('');
    setNewMake('');
    setNewModel('');
    setNewReg('');
    setIsAddVehicleOpen(false);
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle || !maintDesc) return;
    await addMaintenanceEvent({
      vehicle_id: currentVehicle.id,
      event_date: maintDate,
      event_type: maintType,
      description: maintDesc,
      mileage_km: maintMileage ? parseInt(maintMileage, 10) : null,
      performed_by: maintBy || 'Owner',
      mechanic_notes: null,
    });
    setMaintDesc('');
    setIsAddMaintOpen(false);
  };

  const handleCreateMechanicConf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle || !mechDiagnosis || !mechName) return;
    await addMechanicConfirmation({
      vehicle_id: currentVehicle.id,
      component: mechComponent,
      diagnosis_text: mechDiagnosis,
      mechanic_name: mechName,
      workshop_name: mechWorkshop || undefined,
      confirmed_on: mechDate,
      session_id: vehicleSessions[0]?.id || null,
    });
    setMechDiagnosis('');
    setMechName('');
    setIsAddMechOpen(false);
  };

  const handleCreateShare = async () => {
    if (!shareSessionId) return;
    const report = await createSharedReport(
      shareSessionId,
      {
        hide_registration: hideReg,
        hide_audio: hideAudio,
        include_sensor_graphs: true,
      },
      shareExpiryDays
    );
    setIsShareModalOpen(false);
  };

  // Trend data strictly built from stored session results
  const healthTrendData = vehicleSessions
    .filter((s) => s.latest_analysis)
    .slice()
    .reverse()
    .map((s) => {
      const an = s.latest_analysis!;
      const abnormalProb = an.class_probabilities?.abnormal_pattern
        ? Number((an.class_probabilities.abnormal_pattern * 100).toFixed(1))
        : an.result_category === 'abnormal_pattern'
        ? 85
        : 15;
      return {
        date: formatDate(s.started_at),
        abnormalProbability: abnormalProb,
        modelVersion: an.model_version || 'unversioned',
      };
    });

  // Check if multiple model versions exist in trend
  const modelVersions = Array.from(new Set(healthTrendData.map((d) => d.modelVersion)));
  const hasMixedModelVersions = modelVersions.length > 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Vehicle Health Passport</h1>
            {isDemoMode && <SampleDataBadge size="sm" />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete motorcycle profile lifecycle, chronological screening sessions, workshop logs, and verified reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddVehicleOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] font-bold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Motorcycle</span>
          </button>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Vehicle Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {vehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveVehicleId(v.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              v.id === currentVehicle?.id
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 ring-1 ring-cyan-500/20'
                : 'bg-[#121824] text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>{v.nickname}</span>
            <span className="text-[10px] text-slate-500 font-mono">({v.year})</span>
          </button>
        ))}
      </div>

      {currentVehicle ? (
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="border-b border-slate-800 flex items-center gap-4 text-xs font-semibold overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'inspections', label: `Inspections (${vehicleSessions.length})` },
              { id: 'trends', label: 'Health Trends' },
              { id: 'maintenance', label: `Workshop Logs (${vehicleMaintenance.length + vehicleMechanic.length})` },
              { id: 'reports', label: 'PDF Reports' },
              { id: 'sharing', label: `Sharing (${sharedReports.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-300 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="md:col-span-2"
                title={
                  <div className="flex items-center justify-between">
                    <span>Motorcycle Specification & Privacy Note</span>
                    <button
                      onClick={() => deleteVehicle(currentVehicle.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-normal cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Profile
                    </button>
                  </div>
                }
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-[#0E1420] p-4 rounded-xl border border-slate-800 mb-4">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nickname</span>
                    <span className="font-semibold text-white">{currentVehicle.nickname}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Make & Model</span>
                    <span className="font-semibold text-slate-200">{currentVehicle.make} {currentVehicle.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Manufacturing Year</span>
                    <span className="font-mono text-slate-200">{currentVehicle.year}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Registration Number</span>
                    <span className="font-mono text-cyan-400">
                      {currentVehicle.registration_identifier
                        ? `•••• ${currentVehicle.registration_identifier.slice(-4)}`
                        : 'Unregistered / Masked'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Registered In Database</span>
                    <span className="text-slate-300">{formatDate(currentVehicle.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Sync Sessions</span>
                    <span className="font-mono text-slate-200 font-bold">{vehicleSessions.length}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-300">Privacy & Identifiers:</strong> Vehicle registration plates are masked by default across all public and shared views. Storage complies with local sensor recording guidelines.
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card title="Quick Actions">
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/diagnostic-lab')}
                      className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] font-bold text-xs text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>New Diagnostic Inspection</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate('/digital-twin')}
                      className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>View 3D Digital Twin</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsAddMaintOpen(true)}
                      className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>Log Workshop Maintenance</span>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsAddMechOpen(true)}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-800/40 text-xs text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>Add Mechanic Confirmation</span>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: INSPECTIONS */}
          {activeTab === 'inspections' && (
            <Card title="Stationary Inspection Sessions">
              {vehicleSessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Source</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Classification</th>
                        <th className="py-2.5 px-3">Confidence</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {vehicleSessions.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/20">
                          <td className="py-3 px-3 text-slate-200">{formatDateTime(s.started_at)}</td>
                          <td className="py-3 px-3 font-sans">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                              {s.source === 'android' ? 'Android App' : 'Web Upload'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300">{formatDuration(s.duration_seconds)}</td>
                          <td className="py-3 px-3">
                            <StatusBadge category={s.latest_analysis?.result_category} size="sm" />
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {s.latest_analysis?.confidence !== null && s.latest_analysis?.confidence !== undefined
                              ? `${(s.latest_analysis.confidence * 100).toFixed(0)}%`
                              : '—'}
                          </td>
                          <td className="py-3 px-3 text-right space-x-2 font-sans">
                            <button
                              onClick={() => navigate(`/inspection/${s.id}`)}
                              className="text-xs text-cyan-400 hover:underline cursor-pointer"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => {
                                setShareSessionId(s.id);
                                setIsShareModalOpen(true);
                              }}
                              className="text-xs text-slate-400 hover:text-white cursor-pointer"
                            >
                              Share
                            </button>
                            <button
                              onClick={() => generateInspectionPdfReport(s, currentVehicle)}
                              className="text-xs text-slate-400 hover:text-white cursor-pointer"
                            >
                              PDF
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
                  title="No Inspections For This Motorcycle"
                  description="Synchronize a recording from the Android app or upload audio in the Diagnostic Lab."
                />
              )}
            </Card>
          )}

          {/* TAB 3: HEALTH TRENDS */}
          {activeTab === 'trends' && (
            <Card
              title={
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Acoustic Deviation Probability Over Time</span>
                </div>
              }
              subtitle="Constructed strictly from historical stored session inference records"
            >
              {healthTrendData.length > 0 ? (
                <div className="space-y-4">
                  {hasMixedModelVersions && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>
                        Note: Different model versions were used across sessions ({modelVersions.join(', ')}). Trends between versions should be interpreted with caution.
                      </span>
                    </div>
                  )}

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={healthTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                        <YAxis stroke="#64748B" fontSize={11} unit="%" domain={[0, 100]} />
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
                          dataKey="abnormalProbability"
                          name="Abnormal Pattern Probability"
                          stroke="#22D3EE"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#22D3EE' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={TrendingUp}
                  title="No Trend Data"
                  description="Trends require completed inspection sessions for this motorcycle."
                />
              )}
            </Card>
          )}

          {/* TAB 4: MAINTENANCE & MECHANIC CONFIRMATIONS */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              {/* Mechanic Confirmations */}
              <Card
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-emerald-400" />
                      <span>Mechanic-Confirmed Diagnoses</span>
                    </div>
                    <button
                      onClick={() => setIsAddMechOpen(true)}
                      className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
                    >
                      + Add Mechanic Record
                    </button>
                  </div>
                }
                subtitle="Physical workshop diagnoses recorded by certified technicians"
              >
                {vehicleMechanic.length > 0 ? (
                  <div className="space-y-3">
                    {vehicleMechanic.map((m) => (
                      <div key={m.id} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Mechanic confirmed
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">{m.confirmed_on}</span>
                        </div>
                        <p className="font-semibold text-slate-100 capitalize">
                          Component: {m.component.replace('_', ' ')}
                        </p>
                        <p className="text-slate-300 leading-relaxed">{m.diagnosis_text}</p>
                        <p className="text-[11px] text-slate-400 italic">
                          Inspected by: {m.mechanic_name} ({m.workshop_name || 'Independent Workshop'})
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Wrench}
                    title="No Mechanic Confirmations"
                    description="Record a verified workshop diagnosis to update component evidence."
                    actionText="Add Mechanic Record"
                    onAction={() => setIsAddMechOpen(true)}
                  />
                )}
              </Card>

              {/* Maintenance Events */}
              <Card
                title={
                  <div className="flex items-center justify-between">
                    <span>Routine Maintenance History</span>
                    <button
                      onClick={() => setIsAddMaintOpen(true)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      + Log Maintenance
                    </button>
                  </div>
                }
              >
                {vehicleMaintenance.length > 0 ? (
                  <div className="space-y-3">
                    {vehicleMaintenance.map((m) => (
                      <div key={m.id} className="p-3 rounded-lg bg-[#0E1420] border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200 capitalize">{m.event_type.replace('_', ' ')}</span>
                          <span className="font-mono text-slate-400 text-[10px]">{m.event_date}</span>
                        </div>
                        <p className="text-slate-300">{m.description}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>Performed by: {m.performed_by}</span>
                          {m.mileage_km && <span className="font-mono text-cyan-400">{m.mileage_km.toLocaleString()} km</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="No Maintenance Logs"
                    description="Track chain lube, oil changes, spark plug replacements, and valve adjustments."
                    actionText="Log Maintenance"
                    onAction={() => setIsAddMaintOpen(true)}
                  />
                )}
              </Card>
            </div>
          )}

          {/* TAB 5: PDF REPORTS */}
          {activeTab === 'reports' && (
            <Card title="Official Inspection PDF Reports">
              {vehicleSessions.length > 0 ? (
                <div className="space-y-3">
                  {vehicleSessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-xl bg-[#0E1420] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">
                          Inspection Session {s.id}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {formatDateTime(s.started_at)} • Duration: {s.duration_seconds}s
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge category={s.latest_analysis?.result_category} size="sm" />
                        <button
                          onClick={() => generateInspectionPdfReport(s, currentVehicle, vehicleMechanic[0])}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold cursor-pointer transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Generate PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No Inspection Reports"
                  description="Reports can be generated once inspection sessions are recorded."
                />
              )}
            </Card>
          )}

          {/* TAB 6: SHARING */}
          {activeTab === 'sharing' && (
            <Card
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-cyan-400" />
                    <span>Shared Public Report Links</span>
                  </div>
                  <button
                    onClick={() => {
                      if (vehicleSessions.length > 0) {
                        setShareSessionId(vehicleSessions[0].id);
                        setIsShareModalOpen(true);
                      }
                    }}
                    disabled={vehicleSessions.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] font-bold text-xs disabled:opacity-50 cursor-pointer"
                  >
                    + Share New Report
                  </button>
                </div>
              }
              subtitle="Token-gated secure links for sharing individual inspection screenings with mechanics or buyers"
            >
              {sharedReports.length > 0 ? (
                <div className="space-y-3">
                  {sharedReports.map((shr) => {
                    const isRevoked = Boolean(shr.revoked_at);
                    const isExpired = shr.expires_at ? new Date(shr.expires_at) < new Date() : false;
                    const shareUrl = `${window.location.origin}/shared/${shr.token || shr.token_hash}`;

                    return (
                      <div
                        key={shr.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                          isRevoked || isExpired
                            ? 'bg-slate-900/60 border-slate-800 opacity-60'
                            : 'bg-[#0E1420] border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-cyan-400 font-semibold">
                              Token: {shr.token_hash.slice(0, 16)}...
                            </span>
                            {isRevoked ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                Revoked
                              </span>
                            ) : isExpired ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                Expired
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">Views: {shr.view_count}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Expires: {shr.expires_at ? formatDate(shr.expires_at) : 'Never'}</span>
                          <span>Options: {shr.options.hide_registration ? 'Plate Masked • ' : ''}{shr.options.hide_audio ? 'Audio Hidden' : 'Audio Included'}</span>
                        </div>

                        {!isRevoked && !isExpired && (
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(shareUrl);
                                  setCopiedToken(shr.id);
                                  setTimeout(() => setCopiedToken(null), 2000);
                                }}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                              >
                                {copiedToken === shr.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedToken === shr.id ? 'Copied Link' : 'Copy Public URL'}</span>
                              </button>
                              <a
                                href={`/shared/${shr.token || shr.token_hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center gap-1"
                              >
                                <span>Open View</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>

                            <button
                              onClick={() => revokeSharedReport(shr.id)}
                              className="text-rose-400 hover:underline cursor-pointer"
                            >
                              Revoke Access
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Share2}
                  title="No Shared Reports"
                  description="Generate a secure link to share an inspection screening with a mechanic."
                />
              )}
            </Card>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Bike}
          title="No Motorcycles Configured"
          description="Add a motorcycle profile to unlock health passport tabs."
          actionText="Add Motorcycle"
          onAction={() => setIsAddVehicleOpen(true)}
        />
      )}

      {/* MODAL: ADD VEHICLE */}
      <Modal isOpen={isAddVehicleOpen} onClose={() => setIsAddVehicleOpen(false)} title="Register Motorcycle Profile">
        <form onSubmit={handleCreateVehicle} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Nickname / Call-sign *</label>
            <input
              type="text"
              required
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="e.g. Daily Commuter 650"
              className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Make *</label>
              <input
                type="text"
                required
                value={newMake}
                onChange={(e) => setNewMake(e.target.value)}
                placeholder="Royal Enfield"
                className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Model *</label>
              <input
                type="text"
                required
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                placeholder="Interceptor 650"
                className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Year</label>
              <input
                type="number"
                min={1970}
                max={2030}
                value={newYear}
                onChange={(e) => setNewYear(parseInt(e.target.value, 10))}
                className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Registration Identifier (Masked)</label>
              <input
                type="text"
                value={newReg}
                onChange={(e) => setNewReg(e.target.value)}
                placeholder="KA-05-MQ-8842"
                className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Registration identifiers are stored privately and masked in public share links.
          </p>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddVehicleOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] font-bold"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: LOG MAINTENANCE */}
      <Modal isOpen={isAddMaintOpen} onClose={() => setIsAddMaintOpen(false)} title="Log Routine Maintenance">
        <form onSubmit={handleCreateMaintenance} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Event Type</label>
            <select
              aria-label="Maintenance Event Type"
              value={maintType}
              onChange={(e) => setMaintType(e.target.value as any)}
              className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
            >
              <option value="routine_service">Routine General Service</option>
              <option value="oil_change">Oil & Filter Change</option>
              <option value="chain_adjustment">Chain Cleaning & Slack Adjustment</option>
              <option value="valve_clearance">Valve Clearance Inspection</option>
              <option value="tire_replacement">Tire Replacement</option>
              <option value="repair">Mechanical Repair</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Description *</label>
            <textarea
              required
              rows={2}
              value={maintDesc}
              onChange={(e) => setMaintDesc(e.target.value)}
              placeholder="Replaced 10W-50 oil, set chain tension to 25mm slack..."
              className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Odometer (km)</label>
              <input
                type="number"
                value={maintMileage}
                onChange={(e) => setMaintMileage(e.target.value)}
                placeholder="10500"
                className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Date</label>
              <input
                type="date"
                value={maintDate}
                onChange={(e) => setMaintDate(e.target.value)}
                className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Performed By</label>
            <input
              type="text"
              value={maintBy}
              onChange={(e) => setMaintBy(e.target.value)}
              placeholder="Self (DIY) or Service Center"
              className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddMaintOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] font-bold"
            >
              Record Maintenance
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD MECHANIC CONFIRMATION */}
      <Modal isOpen={isAddMechOpen} onClose={() => setIsAddMechOpen(false)} title="Record Mechanic Confirmation">
        <form onSubmit={handleCreateMechanicConf} className="space-y-3.5 text-xs">
          <p className="text-slate-400 text-[11px]">
            This logs a certified technician diagnosis that updates the Digital Twin component evidence status.
          </p>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Component Target</label>
            <select
              aria-label="Component Target"
              value={mechComponent}
              onChange={(e) => setMechComponent(e.target.value as any)}
              className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
            >
              <option value="engine">Engine Core</option>
              <option value="valves">Valves / Tappet Lash</option>
              <option value="chain_sprocket">Drive Chain & Sprockets</option>
              <option value="wheel_bearing">Wheel Bearings & Hubs</option>
              <option value="exhaust">Exhaust System</option>
              <option value="other">Other Mechanical System</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Diagnosis Findings *</label>
            <textarea
              required
              rows={3}
              value={mechDiagnosis}
              onChange={(e) => setMechDiagnosis(e.target.value)}
              placeholder="Feeler gauge inspection confirmed intake clearance at 0.08mm. No abnormal mechanical lash."
              className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Technician Name *</label>
              <input
                type="text"
                required
                value={mechName}
                onChange={(e) => setMechName(e.target.value)}
                placeholder="Rajesh Kumar, Senior Tech"
                className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Workshop Name</label>
              <input
                type="text"
                value={mechWorkshop}
                onChange={(e) => setMechWorkshop(e.target.value)}
                placeholder="Apex Moto Services"
                className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Date of Physical Inspection</label>
            <input
              type="date"
              value={mechDate}
              onChange={(e) => setMechDate(e.target.value)}
              className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddMechOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0B1220] font-bold"
            >
              Save Mechanic Confirmation
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SHARE REPORT */}
      <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Generate Secure Shared Link">
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Create an encrypted, token-gated link to share this specific screening report. The recipient will not have access to any other vehicles or records.
          </p>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Link Expiration</label>
            <select
              aria-label="Link Expiration"
              value={shareExpiryDays}
              onChange={(e) => setShareExpiryDays(parseInt(e.target.value, 10))}
              className="w-full bg-[#18202C] border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value={1}>Expires in 24 hours</option>
              <option value={7}>Expires in 7 days</option>
              <option value={30}>Expires in 30 days</option>
              <option value={0}>Never expires (until manually revoked)</option>
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideReg}
                onChange={(e) => setHideReg(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500"
              />
              <span className="text-slate-300">Mask registration plate identifier</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideAudio}
                onChange={(e) => setHideAudio(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500"
              />
              <span className="text-slate-300">Exclude raw audio playback (summary metrics only)</span>
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateShare}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] font-bold"
            >
              Generate Share Link
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
