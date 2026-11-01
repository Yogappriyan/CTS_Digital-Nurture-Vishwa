/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOTOSYNQ AI — Digital Twin: Motorcycle Procedural Assembly Component
 * Assembles all modular components into a realistic, correctly proportioned,
 * fully assembled retro-modern street motorcycle (Yamaha FZ-X class).
 */

import React from 'react';
import { Html } from '@react-three/drei';
import { DigitalTwinComponentId } from '../../types';
import { FrontEnd } from './parts/FrontEnd';
import { FrameAndBody } from './parts/FrameAndBody';
import { Engine } from './parts/Engine';
import { Drivetrain } from './parts/Drivetrain';
import { RearEnd } from './parts/RearEnd';
import { Exhaust } from './parts/Exhaust';
import { FRONT_AXLE_X, FRONT_AXLE_Y, REAR_AXLE_X, REAR_AXLE_Y, SPROCKET_Z, MUFFLER_Z } from './dimensions';

interface MotorcycleProps {
  selectedComponent: DigitalTwinComponentId | null;
  hoveredComponent: string | null;
  exploded: number;
  showLabels: boolean;
  paintColor: string;
  onPointerOver: (group: string, name: string) => void;
  onPointerOut: () => void;
  onSelectComponent: (id: DigitalTwinComponentId) => void;
  onNonMonitoredClick: () => void;
}

export const Motorcycle: React.FC<MotorcycleProps> = ({
  selectedComponent,
  hoveredComponent,
  exploded,
  showLabels,
  paintColor,
  onPointerOver,
  onPointerOut,
  onSelectComponent,
  onNonMonitoredClick,
}) => {
  const handleClick = (group: string) => {
    if (group === 'non_monitored') {
      onNonMonitoredClick();
    } else {
      onSelectComponent(group as DigitalTwinComponentId);
    }
  };

  // Label anchor positions in motorcycle coordinates
  const labelAnchors = [
    {
      id: 'engine' as DigitalTwinComponentId,
      name: 'Engine Core & Top End',
      pos: [0.06, 0.52, 0.14] as [number, number, number],
      code: 'ENG-149',
    },
    {
      id: 'chain_sprocket' as DigitalTwinComponentId,
      name: 'Drive Chain & Sprockets',
      pos: [-0.40, 0.40, SPROCKET_Z - 0.04] as [number, number, number],
      code: 'DRV-520',
    },
    {
      id: 'wheel_bearing' as DigitalTwinComponentId,
      name: 'Wheel Bearings & Hubs',
      pos: [FRONT_AXLE_X, FRONT_AXLE_Y + 0.08, 0.12] as [number, number, number],
      code: 'BRG-6202',
    },
    {
      id: 'exhaust' as DigitalTwinComponentId,
      name: 'Exhaust & Muffler',
      pos: [-0.36, 0.36, MUFFLER_Z + 0.06] as [number, number, number],
      code: 'EXH-OEM',
    },
  ];

  return (
    <group>
      {/* Front Wheel, Forks, Handlebars, Lighting */}
      <FrontEnd
        selectedGroup={selectedComponent}
        hoveredGroup={hoveredComponent}
        exploded={exploded}
        paintColor={paintColor}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={handleClick}
      />

      {/* High-Tensile Steel Diamond Frame & Bodywork */}
      <FrameAndBody
        selectedGroup={selectedComponent}
        hoveredGroup={hoveredComponent}
        exploded={exploded}
        paintColor={paintColor}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={handleClick}
      />

      {/* Engine Core & Top End */}
      <Engine
        selectedGroup={selectedComponent}
        hoveredGroup={hoveredComponent}
        exploded={exploded}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={handleClick}
      />

      {/* Drivetrain: Sprockets & Continuous Chain Loop */}
      <Drivetrain
        selectedGroup={selectedComponent}
        hoveredGroup={hoveredComponent}
        exploded={exploded}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={handleClick}
      />

      {/* Rear End: Swingarm, Monoshock, Rear Wheel & Hub Bearings */}
      <RearEnd
        selectedGroup={selectedComponent}
        hoveredGroup={hoveredComponent}
        exploded={exploded}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={handleClick}
      />

      {/* Exhaust System: Swept Header Pipe & Roadster Muffler */}
      <Exhaust
        selectedGroup={selectedComponent}
        hoveredGroup={hoveredComponent}
        exploded={exploded}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={handleClick}
      />

      {/* ========================================================
          DIAGNOSTIC LEADER-LINE LABELS (Toggled via UI button)
          ======================================================== */}
      {showLabels &&
        labelAnchors.map((label) => {
          const isSelected = selectedComponent === label.id;
          return (
            <group key={label.id} position={label.pos}>
              <Html distanceFactor={4.5} center>
                <button
                  type="button"
                  onClick={() => onSelectComponent(label.id)}
                  className={`cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium shadow-lg backdrop-blur-md transition-all duration-200 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/90 text-cyan-200 ring-2 ring-cyan-400/50 scale-105'
                      : 'border-slate-700 bg-slate-900/85 text-slate-200 hover:border-cyan-500/60 hover:text-cyan-300'
                  }`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      isSelected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{label.name}</span>
                  <span className="font-mono text-[10px] text-slate-400 opacity-80">[{label.code}]</span>
                </button>
              </Html>
            </group>
          );
        })}
    </group>
  );
};
