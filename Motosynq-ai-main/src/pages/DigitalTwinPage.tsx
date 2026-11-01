import React, { useState } from 'react';
import { useData } from '../features/data/DataContext';
import { useAuth } from '../features/auth/AuthContext';
import { DigitalTwinComponentId, ComponentStatus } from '../types';
import { Motorcycle3DScene } from '../components/twin/Motorcycle3DScene';
import { MotorcycleSvgFallback } from '../components/twin/MotorcycleSvgFallback';
import { Card } from '../components/ui/Card';
import { SampleDataBadge } from '../components/ui/SampleDataBadge';
import { DisclaimerBanner } from '../components/ui/DisclaimerBanner';
import { formatDate } from '../lib/formatters';
import {
  Box,
  Wrench,
  Activity,
  Layers,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DigitalTwinPage: React.FC = () => {
  const { vehicles, activeVehicle, activeVehicleId, setActiveVehicleId, sessions, mechanicConfirmations } = useData();
  const { isDemoMode } = useAuth();
  const [selectedComponent, setSelectedComponent] = useState<DigitalTwinComponentId>('engine');
  const [useSvgFallback, setUseSvgFallback] = useState(false);
  const navigate = useNavigate();

  const currentVehicle = activeVehicle || vehicles[0];

  // Component metadata definitions
  const componentsList: { id: DigitalTwinComponentId; name: string; description: string }[] = [
    {
      id: 'engine',
      name: 'Engine Core & Top End',
      description: 'Cylinder head, piston wrist pin, valve lash, and primary combustion acoustics.',
    },
    {
      id: 'chain_sprocket',
      name: 'Drive Chain & Sprockets',
      description: 'Secondary drive tension, link articulation friction, and front/rear tooth mesh.',
    },
    {
      id: 'wheel_bearing',
      name: 'Wheel Bearings & Hubs',
      description: 'Front and rear rotational rumble, axial play, and hub inertial vibrations.',
    },
    {
      id: 'exhaust',
      name: 'Exhaust & Muffler System',
      description: 'Exhaust header seal, baffle reverberation, and catalytic canister resonance.',
    },
  ];

  // HONESTY STATUS RULE:
  // "default is Unknown / Insufficient Evidence. A status other than Unknown is set only from:
  //  (a) a validated model output whose supported_classes includes that component, or
  //  (b) a verified mechanic record. Selecting a component or having a sample recording must never change its status."
  const getComponentStatus = (compId: DigitalTwinComponentId): {
    status: ComponentStatus;
    label: string;
    evidenceSource: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  } => {
    // Check for verified mechanic record first
    const mechanicRecord = mechanicConfirmations.find(
      (m) =>
        m.vehicle_id === currentVehicle?.id &&
        (m.component === compId || (compId === 'engine' && m.component === 'valves'))
    );

    if (mechanicRecord) {
      return {
        status: 'normal_pattern',
        label: 'Mechanic Verified In-Spec',
        evidenceSource: `Verified on ${mechanicRecord.confirmed_on} by ${mechanicRecord.mechanic_name}`,
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/10',
        borderClass: 'border-emerald-500/30',
      };
    }

    // Check if any validated model in session history includes this component in supported_classes
    const sessionWithClassSupport = sessions.find(
      (s) =>
        s.vehicle_id === currentVehicle?.id &&
        s.latest_analysis?.supported_classes?.includes(compId)
    );

    if (sessionWithClassSupport?.latest_analysis) {
      const an = sessionWithClassSupport.latest_analysis;
      if (an.result_category === 'abnormal_pattern') {
        return {
          status: 'attention_recommended',
          label: 'Attention Recommended',
          evidenceSource: `Model ${an.model_name || 'AI'} (${an.model_version}) classification`,
          colorClass: 'text-amber-400',
          bgClass: 'bg-amber-500/10',
          borderClass: 'border-amber-500/30',
        };
      }
      if (an.result_category === 'normal_pattern') {
        return {
          status: 'normal_pattern',
          label: 'Normal Pattern',
          evidenceSource: `Model ${an.model_name || 'AI'} (${an.model_version}) classification`,
          colorClass: 'text-teal-400',
          bgClass: 'bg-teal-500/10',
          borderClass: 'border-teal-500/30',
        };
      }
    }

    // DEFAULT HONEST STATUS
    return {
      status: 'unknown',
      label: 'Unknown – Insufficient Evidence',
      evidenceSource: 'No component-specific class validated in active AI model or workshop logs.',
      colorClass: 'text-slate-400',
      bgClass: 'bg-slate-500/10',
      borderClass: 'border-slate-500/30',
    };
  };

  const currentStatus = getComponentStatus(selectedComponent);

  // Relevant mechanic confirmations
  const componentMechanicRecords = mechanicConfirmations.filter(
    (m) =>
      m.vehicle_id === currentVehicle?.id &&
      (m.component === selectedComponent || (selectedComponent === 'engine' && m.component === 'valves'))
  );

  // Related sessions
  const componentSessions = sessions.filter((s) => s.vehicle_id === currentVehicle?.id);

  return (
    <div className="space-y-6">
      {/* Top Bar with Vehicle Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {currentVehicle ? `${currentVehicle.make} ${currentVehicle.model} Digital Twin` : 'Motorcycle Digital Twin'}
            </h1>
            {isDemoMode && <SampleDataBadge size="sm" />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Component-mapped visual inspection interface for {currentVehicle?.nickname || 'active motorcycle'} with strict sensor evidence validation.
          </p>
        </div>

        {/* Vehicle Switcher Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Twin target:</span>
          {vehicles.length > 0 ? (
            <select
              aria-label="Select Target Motorcycle"
              value={activeVehicleId || ''}
              onChange={(e) => setActiveVehicleId(e.target.value)}
              className="bg-[#121824] border border-slate-700 text-xs font-semibold text-cyan-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nickname} ({v.year} {v.make})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-400 italic">No vehicle selected</span>
          )}

          {/* Toggle 3D vs 2D Fallback view */}
          <button
            onClick={() => setUseSvgFallback(!useSvgFallback)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer"
            title="Switch rendering mode"
          >
            {useSvgFallback ? 'Use 3D WebGL' : '2D Schematic'}
          </button>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Main Grid: 3D Scene Viewport + Component Evidence Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Canvas / 2D Fallback + Keyboard List */}
        <div className="lg:col-span-8 space-y-4">
          {useSvgFallback ? (
            <div className="rounded-xl overflow-hidden border border-slate-800 h-[340px] sm:h-[440px] md:h-[560px]">
              <MotorcycleSvgFallback
                selectedComponent={selectedComponent}
                onSelectComponent={(id) => setSelectedComponent(id)}
              />
            </div>
          ) : (
            <Motorcycle3DScene
              selectedComponent={selectedComponent}
              onSelectComponent={(id) => setSelectedComponent(id)}
              onWebGlError={() => setUseSvgFallback(true)}
            />
          )}

          {/* Keyboard-Accessible Component Selection Buttons */}
          <div className="bg-[#12171F] border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Accessible Component Selector:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {componentsList.map((comp) => {
                const compStat = getComponentStatus(comp.id);
                const isSelected = selectedComponent === comp.id;
                return (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedComponent(comp.id)}
                    className={`p-2.5 rounded-lg text-left text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/30'
                        : 'bg-[#18202C] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold truncate">{comp.name}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${compStat.colorClass.replace('text-', 'bg-')}`} />
                      <span className="text-[10px] text-slate-400 truncate">{compStat.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Component Evidence Inspector Panel */}
        <div className="lg:col-span-4 space-y-4">
          <Card
            title={
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Component Evidence Inspector</span>
              </div>
            }
            subtitle={componentsList.find((c) => c.id === selectedComponent)?.name}
          >
            <div className="space-y-4">
              {/* Status Badge */}
              <div className={`p-3.5 rounded-xl border ${currentStatus.bgClass} ${currentStatus.borderClass} space-y-1.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Validated Status:</span>
                  <span className={`text-xs font-bold font-mono ${currentStatus.colorClass}`}>
                    {currentStatus.label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/60 leading-relaxed">
                  <strong className="text-slate-400">Evidence Source:</strong> {currentStatus.evidenceSource}
                </div>
              </div>

              {/* Status Rule Note */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  Honesty Invariance Rule
                </div>
                Component status defaults strictly to <em>Unknown</em> unless validated fault classes are supported by the active model or confirmed by workshop diagnosis.
              </div>

              {/* Recorded Observations: AI vs Mechanic separation */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Recorded Observations
                </h4>

                {/* Mechanic Confirmed Diagnoses */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Mechanic-Confirmed Diagnoses</span>
                  </div>
                  {componentMechanicRecords.length > 0 ? (
                    componentMechanicRecords.map((m) => (
                      <div key={m.id} className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Mechanic confirmed
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono">{m.confirmed_on}</span>
                        </div>
                        <p className="text-slate-200 mt-1">{m.diagnosis_text}</p>
                        <p className="text-[10px] text-slate-400 italic">Confirmed by: {m.mechanic_name} ({m.workshop_name})</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic bg-[#0F1520] p-2.5 rounded border border-slate-800">
                      No verified mechanic records logged for this component.
                    </p>
                  )}
                </div>

                {/* AI Screening Observations */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
                    <Activity className="w-3.5 h-3.5" />
                    <span>AI Acoustic & Motion Observations</span>
                  </div>
                  {componentSessions.filter((s) => s.latest_analysis?.recommendation).length > 0 ? (
                    componentSessions.slice(0, 2).map((s) => (
                      <div key={s.id} className="p-3 rounded-lg bg-cyan-950/15 border border-cyan-800/30 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                            AI observation – not a diagnosis
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono">{formatDate(s.started_at)}</span>
                        </div>
                        <p className="text-slate-300 mt-1">{s.latest_analysis?.recommendation}</p>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Model: {s.latest_analysis?.model_version || 'v0.0'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic bg-[#0F1520] p-2.5 rounded border border-slate-800">
                      No AI observations logged.
                    </p>
                  )}
                </div>
              </div>

              {/* Action: Open Inspection Session */}
              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">Related Sessions:</span>
                <button
                  onClick={() => navigate('/health-passport')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Vehicle Health Passport</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
