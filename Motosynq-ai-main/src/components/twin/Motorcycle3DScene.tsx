/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOTOSYNQ AI — Digital Twin 3D Motorcycle Scene
 * Rebuilt procedural 150cc roadster (Yamaha FZ-X class)
 * React Three Fiber implementation with PBR materials, OrbitControls,
 * 4 camera presets, exploded view, leader labels, and assembly validation.
 */

import React, { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { DigitalTwinComponentId } from '../../types';
import { Motorcycle } from './Motorcycle';
import { COLORWAY_PRESETS } from './dimensions';
import { validateAssembly, AssemblyValidationReport } from './validateAssembly';
import {
  RotateCcw,
  Sparkles,
  Camera,
  Layers,
  Tag,
  CheckCircle2,
  Info,
  Maximize2,
  Eye,
  Sun,
  Moon,
} from 'lucide-react';

export type FzxColorway = 'cyan' | 'blue' | 'copper' | 'titan';

interface Motorcycle3DSceneProps {
  selectedComponent: DigitalTwinComponentId;
  onSelectComponent: (id: DigitalTwinComponentId) => void;
  onWebGlError?: () => void;
}

// Camera preset target positions and lookAt points
interface CameraPresetConfig {
  name: string;
  camPos: [number, number, number];
  targetPos: [number, number, number];
}

const CAMERA_PRESETS: Record<string, CameraPresetConfig> = {
  three_quarters: {
    name: '3/4 Front Angle',
    camPos: [2.3, 1.3, 2.4],
    targetPos: [0.1, 0.55, 0.0],
  },
  side_profile: {
    name: 'Side Profile',
    camPos: [0.0, 0.72, 3.1],
    targetPos: [0.0, 0.52, 0.0],
  },
  engine_focus: {
    name: 'Engine Close-up',
    camPos: [0.72, 0.62, 1.15],
    targetPos: [0.06, 0.45, 0.04],
  },
  rear_chain: {
    name: 'Rear & Chain',
    camPos: [-1.55, 0.65, -1.45],
    targetPos: [-0.42, 0.38, -0.08],
  },
};

/**
 * Animated Camera Controller with smooth spring damping
 * Only actively lerps during programmatic camera preset transitions.
 * Yields immediately to manual OrbitControls on user mouse/touch interaction.
 */
const CameraAnimator: React.FC<{
  targetCam: [number, number, number];
  targetLook: [number, number, number];
  controlsRef: React.RefObject<any>;
  transitionId: number;
}> = ({ targetCam, targetLook, controlsRef, transitionId }) => {
  const { camera } = useThree();
  const isTransitioning = useRef(false);
  const desiredCam = useRef(new THREE.Vector3(...targetCam));
  const desiredLook = useRef(new THREE.Vector3(...targetLook));

  // Trigger smooth transition whenever preset changes or transitionId increments
  useEffect(() => {
    desiredCam.current.set(...targetCam);
    desiredLook.current.set(...targetLook);
    isTransitioning.current = true;
  }, [targetCam, targetLook, transitionId]);

  // Cancel programmatic transition immediately when user begins manual mouse or touch interaction
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onStart = () => {
      isTransitioning.current = false;
    };

    controls.addEventListener('start', onStart);
    return () => {
      controls.removeEventListener('start', onStart);
    };
  }, [controlsRef]);

  useFrame((_, delta) => {
    if (!isTransitioning.current) return;

    // Smooth exponential damping toward preset target
    const factor = Math.min(1, delta * 5.0);
    camera.position.lerp(desiredCam.current, factor);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredLook.current, factor);
      controlsRef.current.update();
    }

    const camDist = camera.position.distanceTo(desiredCam.current);
    const targetDist = controlsRef.current
      ? controlsRef.current.target.distanceTo(desiredLook.current)
      : 0;

    // Transition reached target: stop lerping completely so OrbitControls is free
    if (camDist < 0.012 && targetDist < 0.012) {
      camera.position.copy(desiredCam.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(desiredLook.current);
        controlsRef.current.update();
      }
      isTransitioning.current = false;
    }
  });

  return null;
};

export const Motorcycle3DScene: React.FC<Motorcycle3DSceneProps> = ({
  selectedComponent,
  onSelectComponent,
  onWebGlError,
}) => {
  const controlsRef = useRef<any>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [colorway, setColorway] = useState<FzxColorway>('cyan');
  const [backdropMode, setBackdropMode] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('motosynq_3d_backdrop');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });
  const [isExploded, setIsExploded] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('three_quarters');
  const [transitionId, setTransitionId] = useState<number>(0);
  const [nonMonitoredMessage, setNonMonitoredMessage] = useState<string | null>(null);
  const [validationReport, setValidationReport] = useState<AssemblyValidationReport | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);

  const handleToggleBackdrop = (mode: 'light' | 'dark') => {
    setBackdropMode(mode);
    try {
      localStorage.setItem('motosynq_3d_backdrop', mode);
    } catch {
      // ignore
    }
  };

  // Run assembly validation on mount
  useEffect(() => {
    const report = validateAssembly();
    setValidationReport(report);
  }, []);

  // WebGL support detection
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebGlSupported(false);
        if (onWebGlError) onWebGlError();
      }
    } catch {
      setWebGlSupported(false);
      if (onWebGlError) onWebGlError();
    }
  }, [onWebGlError]);

  // Non-monitored part click tooltip timeout
  const handleNonMonitoredClick = useCallback(() => {
    setNonMonitoredMessage(
      'Not a monitored component — Only Engine, Drive Chain & Sprockets, Wheel Bearings, and Exhaust are monitored.'
    );
    const timer = setTimeout(() => {
      setNonMonitoredMessage(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  // Handle Preset Button Click
  const handlePresetChange = (presetKey: string) => {
    setActivePreset(presetKey);
    setTransitionId((prev) => prev + 1);
  };

  // Reset to default angle
  const handleResetCamera = () => {
    setActivePreset('three_quarters');
    setTransitionId((prev) => prev + 1);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Colorway config
  const currentColorway = COLORWAY_PRESETS[colorway] || COLORWAY_PRESETS.cyan;

  if (!webGlSupported) {
    return null;
  }

  const currentPresetConfig = CAMERA_PRESETS[activePreset] || CAMERA_PRESETS.three_quarters;

  return (
    <div
      className={`relative h-[340px] sm:h-[440px] md:h-[560px] w-full select-none overflow-hidden rounded-xl transition-colors duration-300 ${
        backdropMode === 'dark'
          ? 'border border-slate-800 bg-[#070b14] shadow-2xl'
          : 'border border-slate-300 bg-white shadow-lg'
      }`}
    >
      {/* 3D Scene Canvas */}
      <Canvas
        camera={{
          fov: 38,
          near: 0.1,
          far: 50,
          position: currentPresetConfig.camPos,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = backdropMode === 'dark' ? 1.22 : 1.15;
        }}
      >
        {/* Dynamic Studio Background Color */}
        <color attach="background" args={[backdropMode === 'dark' ? '#070b14' : '#ffffff']} />

        <Suspense fallback={null}>
          <CameraAnimator
            targetCam={currentPresetConfig.camPos}
            targetLook={currentPresetConfig.targetPos}
            controlsRef={controlsRef}
            transitionId={transitionId}
          />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableRotate={true}
            enablePan={true}
            enableZoom={true}
            minDistance={1.1}
            maxDistance={7.5}
            // Clamp camera strictly above the floor plane (no underground clipping)
            maxPolarAngle={Math.PI / 2 - 0.02}
            minPolarAngle={0.08}
            dampingFactor={0.06}
            enableDamping={true}
            rotateSpeed={0.85}
          />

          {/* Dynamic Studio Lighting tuned for Light or Dark Backdrop */}
          {backdropMode === 'dark' ? (
            <>
              <ambientLight intensity={0.58} color="#e0f2fe" />
              <directionalLight
                position={[5, 8, 5]}
                intensity={2.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-bias={-0.0001}
                color="#ffffff"
              />
              <directionalLight position={[-4, 5, 4]} intensity={0.9} color="#94a3b8" />
              <directionalLight position={[2, 4, -5]} intensity={1.2} color="#38bdf8" />
              <directionalLight position={[0, -2, 0]} intensity={0.4} color="#0284c7" />
            </>
          ) : (
            <>
              <ambientLight intensity={0.88} color="#ffffff" />
              <directionalLight
                position={[5, 8, 5]}
                intensity={1.8}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-bias={-0.0001}
                color="#ffffff"
              />
              <directionalLight position={[-4, 5, 4]} intensity={0.75} color="#f1f5f9" />
              <directionalLight position={[2, 4, -5]} intensity={0.65} color="#e2e8f0" />
              <directionalLight position={[0, -2, 0]} intensity={0.35} color="#f8fafc" />
            </>
          )}

          {/* Procedural Assembled Motorcycle Model */}
          <Motorcycle
            selectedComponent={selectedComponent}
            hoveredComponent={hoveredComponent}
            exploded={isExploded ? 1 : 0}
            showLabels={showLabels}
            paintColor={currentColorway.tankColor}
            onPointerOver={(group, name) => {
              setHoveredComponent(group);
              setHoveredName(name);
            }}
            onPointerOut={() => {
              setHoveredComponent(null);
              setHoveredName(null);
            }}
            onSelectComponent={(id) => onSelectComponent(id)}
            onNonMonitoredClick={handleNonMonitoredClick}
          />

          {/* Ground Contact Shadow */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={backdropMode === 'dark' ? 0.65 : 0.38}
            scale={4.6}
            blur={backdropMode === 'dark' ? 1.8 : 2.0}
            far={1.6}
            color={backdropMode === 'dark' ? '#000000' : '#0f172a'}
          />

          {/* Clean Studio Ground Grid */}
          {backdropMode === 'dark' ? (
            <gridHelper args={[6, 24, 0x0284c7, 0x1e293b]} position={[0, 0, 0]} />
          ) : (
            <gridHelper args={[6, 24, 0x94a3b8, 0xe2e8f0]} position={[0, 0, 0]} />
          )}
        </Suspense>
      </Canvas>

      {/* ========================================================
          TOP BAR OVERLAYS
          ======================================================== */}
      {/* Top Left: Badge & Assembly Status */}
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-slate-900/85 px-3 py-1 text-xs font-medium text-cyan-300 shadow-lg backdrop-blur-md">
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            Simplified illustrative 3D model
          </span>

          {validationReport?.isValid && (
            <button
              type="button"
              onClick={() => setShowValidationModal(true)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-1 text-[11px] font-medium text-emerald-300 backdrop-blur-md hover:bg-emerald-900/60 transition-colors"
              title="Click to view assembly validation report"
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Kinematics In-Spec
            </button>
          )}
        </div>

        <p
          className={`text-[11px] font-medium px-2 py-0.5 rounded border shadow-xs backdrop-blur-sm w-fit transition-colors ${
            backdropMode === 'dark'
              ? 'text-slate-400 bg-slate-900/85 border-slate-700/80'
              : 'text-slate-600 bg-white/85 border-slate-200/90'
          }`}
        >
          Drag to rotate • Scroll to zoom • Click parts to inspect
        </p>
      </div>

      {/* Top Right: Backdrop Mode Switcher & Colorway Preset Buttons */}
      <div className="absolute right-4 top-4 flex flex-wrap items-center gap-2">
        {/* 3D Viewport Backdrop Toggle: Light vs Dark */}
        <div className="flex items-center rounded-lg border border-slate-700/80 bg-slate-900/90 p-1 shadow-lg backdrop-blur-md">
          <span className="px-1.5 text-[11px] font-medium text-slate-300">
            Backdrop:
          </span>
          <button
            type="button"
            onClick={() => handleToggleBackdrop('light')}
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
              backdropMode === 'light'
                ? 'bg-amber-400/25 text-amber-300 border border-amber-400/50 shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title="Clean Studio White Background"
            aria-label="Switch 3D canvas to light background"
          >
            <Sun className="h-3 w-3 text-amber-400" />
            Light
          </button>
          <button
            type="button"
            onClick={() => handleToggleBackdrop('dark')}
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
              backdropMode === 'dark'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title="Cyber Dark Navy Background"
            aria-label="Switch 3D canvas to dark background"
          >
            <Moon className="h-3 w-3 text-cyan-400" />
            Dark
          </button>
        </div>

        {/* Colorway Preset Buttons */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 p-1 shadow-lg backdrop-blur-md">
          <span className="px-1.5 text-[11px] font-medium text-slate-300 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" /> Color:
          </span>
          {(['cyan', 'blue', 'copper', 'titan'] as FzxColorway[]).map((cw) => {
            const cfg = COLORWAY_PRESETS[cw];
            const isActive = colorway === cw;
            return (
              <button
                key={cw}
                type="button"
                onClick={() => setColorway(cw)}
                title={cfg.name}
                className={`h-5 w-5 rounded-full border transition-all ${
                  isActive
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-110 border-white'
                    : 'border-slate-700 opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: cfg.tankColor }}
              />
            );
          })}
        </div>
      </div>

      {/* Non-Monitored Click Notification Toast */}
      {nonMonitoredMessage && (
        <div className="absolute left-1/2 top-16 -translate-x-1/2 z-30 max-w-md rounded-lg border border-amber-500/40 bg-slate-900/95 px-4 py-2.5 text-xs text-amber-200 shadow-xl backdrop-blur-md flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{nonMonitoredMessage}</span>
        </div>
      )}

      {/* Hovered Mesh HUD readout */}
      {hoveredName && (
        <div className="pointer-events-none absolute bottom-16 left-4 rounded-md border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 shadow-xl backdrop-blur-md">
          <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold block">
            Mesh Inspector
          </span>
          <span className="font-medium text-slate-100">{hoveredName}</span>
        </div>
      )}

      {/* ========================================================
          BOTTOM CONTROLS BAR
          ======================================================== */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: 4 Animated Camera Presets */}
        <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/90 p-1 backdrop-blur-md shadow-xl">
          <span className="flex items-center gap-1 px-2 text-[11px] font-medium text-slate-300">
            <Camera className="h-3 w-3 text-cyan-400" /> View:
          </span>
          {Object.entries(CAMERA_PRESETS).map(([key, config]) => {
            const isActive = activePreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePresetChange(key)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                {config.name}
              </button>
            );
          })}
        </div>

        {/* Right: Exploded, Labels & Reset Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 p-1 backdrop-blur-md shadow-xl">
          {/* Exploded View Toggle */}
          <button
            type="button"
            onClick={() => setIsExploded((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              isExploded
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Explode parts to inspect internal assemblies"
          >
            <Layers className="h-3.5 w-3.5" />
            Exploded View
          </button>

          {/* Labels Toggle */}
          <button
            type="button"
            onClick={() => setShowLabels((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              showLabels
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
            title="Show diagnostic leader labels"
          >
            <Tag className="h-3.5 w-3.5" />
            Leader Labels
          </button>

          {/* Reset Camera */}
          <button
            type="button"
            onClick={handleResetCamera}
            className="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors border border-transparent"
            title="Reset camera view to default"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Assembly Validation Modal */}
      {showValidationModal && validationReport && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Assembly & Kinematics Invariant Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowValidationModal(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-slate-300 max-h-80 overflow-y-auto pr-1">
              {validationReport.checks.map((chk, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-800 bg-slate-800/40 p-2.5 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200">{chk.name}</span>
                    <span
                      className={`font-semibold ${
                        chk.passed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {chk.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{chk.details}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowValidationModal(false)}
                className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
