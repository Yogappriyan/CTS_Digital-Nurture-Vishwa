/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOTOSYNQ AI — Digital Twin: 149cc SOHC Engine Core Assembly
 * Procedural model of an air-cooled 4-stroke 2-valve single cylinder engine
 * Includes crankcase, clutch cover, magneto cover, starter motor, finned cylinder block,
 * finned cylinder head, SOHC tappet cover, spark plug with boot, and intake manifold.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  CRANKCASE_CENTER_X,
  CRANKCASE_CENTER_Y,
  CRANKCASE_WIDTH,
  CYLINDER_INCLINE,
  CYLINDER_BASE_Y,
  CYLINDER_HEAD_Y,
} from '../dimensions';

interface PartProps {
  selectedGroup: string | null;
  hoveredGroup: string | null;
  exploded: number;
  onPointerOver: (group: string, name: string) => void;
  onPointerOut: () => void;
  onClick: (group: string) => void;
}

export const Engine: React.FC<PartProps> = ({
  selectedGroup,
  hoveredGroup,
  exploded,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  // Exploded offset: moves slightly down and forward
  const explodeOffset = useMemo(
    () => new THREE.Vector3(0.06 * exploded, -0.14 * exploded, 0),
    [exploded]
  );

  const isSelected = selectedGroup === 'engine';
  const isHovered = hoveredGroup === 'engine';
  const isAnySelected = Boolean(selectedGroup);
  const isDimmed = isAnySelected && !isSelected;

  const emissive = (isSelected || isHovered) ? '#22d3ee' : '#000000';
  const emissiveIntensity = isSelected ? 0.7 : isHovered ? 0.45 : 0;
  const opacity = isDimmed ? 0.35 : 1.0;
  const transparent = isDimmed;

  // 7 Cooling fin levels along cylinder barrel
  const finHeights = useMemo(() => [0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.21], []);

  return (
    <group
      position={[explodeOffset.x, explodeOffset.y, explodeOffset.z]}
      userData={{ group: 'engine', name: 'Engine Core & Top End' }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver('engine', 'Engine Core & Top End');
      }}
      onPointerOut={onPointerOut}
      onClick={(e) => {
        e.stopPropagation();
        onClick('engine');
      }}
    >
      {/* ========================================================
          CRANKCASE & TRANSMISSION HOUSING
          ======================================================== */}
      <group position={[CRANKCASE_CENTER_X, CRANKCASE_CENTER_Y, 0]}>
        {/* Main crankcase block (die-cast aluminum) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.30, 0.22, 0.19]} />
          <meshStandardMaterial
            color="#22262e"
            roughness={0.45}
            metalness={0.8}
            emissive={new THREE.Color(emissive)}
            emissiveIntensity={emissiveIntensity}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>

        {/* Oil Sump with Cooling Ribs at bottom */}
        <mesh position={[0.01, -0.115, 0]}>
          <boxGeometry args={[0.22, 0.03, 0.16]} />
          <meshStandardMaterial
            color="#181a20"
            roughness={0.5}
            metalness={0.85}
            emissive={new THREE.Color(emissive)}
            emissiveIntensity={emissiveIntensity}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>

        {/* Right Side Cover: Clutch & Oil Filter Housing (+Z) */}
        <group position={[0.02, 0.01, CRANKCASE_WIDTH / 2 - 0.045]}>
          {/* Main circular clutch dome */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.095, 0.098, 0.042, 32]} />
            <meshStandardMaterial
              color="#2a2e38"
              roughness={0.35}
              metalness={0.88}
              emissive={new THREE.Color(emissive)}
              emissiveIntensity={emissiveIntensity}
              transparent={transparent}
              opacity={opacity}
            />
          </mesh>

          {/* Oil level inspection sight glass */}
          <mesh position={[0.035, -0.045, 0.022]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.014, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive={new THREE.Color('#d97706')}
              emissiveIntensity={0.3}
              roughness={0.1}
            />
          </mesh>

          {/* Oil filler threaded plug */}
          <mesh position={[-0.045, 0.065, 0.022]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.012, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.5} />
          </mesh>
        </group>

        {/* Left Side Cover: ACG Magneto / Alternator (-Z) */}
        <group position={[-0.01, 0.02, -CRANKCASE_WIDTH / 2 + 0.045]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.088, 0.092, 0.04, 32]} />
            <meshStandardMaterial
              color="#2a2e38"
              roughness={0.35}
              metalness={0.88}
              emissive={new THREE.Color(emissive)}
              emissiveIntensity={emissiveIntensity}
              transparent={transparent}
              opacity={opacity}
            />
          </mesh>
          {/* Timing inspection cap */}
          <mesh position={[0, 0, -0.021]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.008, 16]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.9} />
          </mesh>
        </group>

        {/* Electric Starter Motor (mounted high on front of crankcase) */}
        <mesh position={[0.11, 0.09, -0.02]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.032, 0.032, 0.14, 20]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.4}
            metalness={0.9}
            emissive={new THREE.Color(emissive)}
            emissiveIntensity={emissiveIntensity}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>
      </group>

      {/* ========================================================
          CYLINDER BARREL & HEAD (Air-Cooled Single, 15° forward tilt)
          ======================================================== */}
      <group position={[CRANKCASE_CENTER_X + 0.03, CYLINDER_BASE_Y, 0]}>
        <group rotation={[0, 0, -CYLINDER_INCLINE]}>
          {/* Cylinder Block Barrel */}
          <mesh position={[0, 0.11, 0]}>
            <cylinderGeometry args={[0.075, 0.078, 0.22, 24]} />
            <meshStandardMaterial
              color="#1a1c22"
              roughness={0.5}
              metalness={0.75}
              emissive={new THREE.Color(emissive)}
              emissiveIntensity={emissiveIntensity}
              transparent={transparent}
              opacity={opacity}
            />
          </mesh>

          {/* Horizontal Cooling Fins Stack */}
          {finHeights.map((y, idx) => (
            <mesh key={idx} position={[0, y, 0]}>
              <boxGeometry args={[0.21 - idx * 0.005, 0.006, 0.20 - idx * 0.004]} />
              <meshStandardMaterial
                color="#282d37"
                roughness={0.3}
                metalness={0.88}
                emissive={new THREE.Color(emissive)}
                emissiveIntensity={emissiveIntensity}
                transparent={transparent}
                opacity={opacity}
              />
            </mesh>
          ))}

          {/* Cylinder Head (SOHC Combustion Chamber & Valve Area) */}
          <group position={[0, 0.24, 0]}>
            <mesh>
              <boxGeometry args={[0.19, 0.09, 0.18]} />
              <meshStandardMaterial
                color="#252a33"
                roughness={0.4}
                metalness={0.85}
                emissive={new THREE.Color(emissive)}
                emissiveIntensity={emissiveIntensity}
                transparent={transparent}
                opacity={opacity}
              />
            </mesh>

            {/* Cylinder Head Fins */}
            {[-0.02, 0.01, 0.035].map((y, idx) => (
              <mesh key={idx} position={[0, y, 0]}>
                <boxGeometry args={[0.22, 0.006, 0.21]} />
                <meshStandardMaterial
                  color="#2b313c"
                  roughness={0.3}
                  metalness={0.9}
                  emissive={new THREE.Color(emissive)}
                  emissiveIntensity={emissiveIntensity}
                  transparent={transparent}
                  opacity={opacity}
                />
              </mesh>
            ))}

            {/* Top Camshaft & Tappet Rocker Cover */}
            <mesh position={[0, 0.065, 0]}>
              <cylinderGeometry args={[0.068, 0.074, 0.045, 20]} />
              <meshStandardMaterial
                color="#181b22"
                roughness={0.35}
                metalness={0.92}
                emissive={new THREE.Color(emissive)}
                emissiveIntensity={emissiveIntensity}
                transparent={transparent}
                opacity={opacity}
              />
            </mesh>

            {/* Spark Plug & High Tension Rubber Boot (on right side +Z) */}
            <group position={[0.02, 0.05, 0.08]} rotation={[0.4, 0, 0.2]}>
              {/* Plug Hex Body */}
              <mesh>
                <cylinderGeometry args={[0.01, 0.01, 0.035, 6]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
              </mesh>
              {/* Ceramic insulator */}
              <mesh position={[0, 0.025, 0]}>
                <cylinderGeometry args={[0.007, 0.007, 0.02, 12]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
              </mesh>
              {/* Rubber 90-degree Spark Plug Cap & Lead */}
              <mesh position={[0, 0.045, 0]}>
                <cylinderGeometry args={[0.011, 0.011, 0.03, 12]} />
                <meshStandardMaterial color="#dc2626" roughness={0.8} metalness={0.1} />
              </mesh>
            </group>

            {/* Intake Manifold & Fuel Injection Throttle Body (facing rear -X) */}
            <group position={[-0.10, 0.01, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.024, 0.024, 0.06, 16]} />
                <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.85} />
              </mesh>
              {/* Throttle sensor / injector module */}
              <mesh position={[-0.04, 0.025, 0]}>
                <boxGeometry args={[0.04, 0.05, 0.045]} />
                <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
