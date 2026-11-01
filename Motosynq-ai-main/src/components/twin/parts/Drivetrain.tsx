/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOTOSYNQ AI — Digital Twin: Drive Chain & Sprockets Assembly
 * Includes front countershaft sprocket (14T), rear drive sprocket (41T) with mounting bolts,
 * closed continuous drive chain loop wrapping both sprockets without gaps,
 * and protective chain slider and upper guard.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  SPROCKET_Z,
  FRONT_SPROCKET_X,
  FRONT_SPROCKET_Y,
  FRONT_SPROCKET_RADIUS,
  REAR_SPROCKET_X,
  REAR_SPROCKET_Y,
  REAR_SPROCKET_RADIUS,
} from '../dimensions';

interface PartProps {
  selectedGroup: string | null;
  hoveredGroup: string | null;
  exploded: number;
  onPointerOver: (group: string, name: string) => void;
  onPointerOut: () => void;
  onClick: (group: string) => void;
}

export const Drivetrain: React.FC<PartProps> = ({
  selectedGroup,
  hoveredGroup,
  exploded,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  // Exploded offset: pushes drivetrain outward to the left (-Z)
  const explodeOffset = useMemo(
    () => new THREE.Vector3(-0.04 * exploded, -0.02 * exploded, -0.16 * exploded),
    [exploded]
  );

  const isSelected = selectedGroup === 'chain_sprocket';
  const isHovered = hoveredGroup === 'chain_sprocket';
  const isAnySelected = Boolean(selectedGroup);
  const isDimmed = isAnySelected && !isSelected;

  const emissive = (isSelected || isHovered) ? '#22d3ee' : '#000000';
  const emissiveIntensity = isSelected ? 0.7 : isHovered ? 0.45 : 0;
  const opacity = isDimmed ? 0.35 : 1.0;
  const transparent = isDimmed;

  // Rear sprocket bolt positions (6 bolts at 60 deg)
  const boltAngles = useMemo(() => Array.from({ length: 6 }, (_, i) => (i * Math.PI) / 3), []);

  // Continuous closed curve geometry for the roller chain loop
  const chainGeometry = useMemo(() => {
    // Tangent points and arc sampling for seamless continuous loop
    const points: THREE.Vector3[] = [];

    // Upper run from front sprocket top to rear sprocket top
    const upperSteps = 12;
    for (let i = 0; i <= upperSteps; i++) {
      const t = i / upperSteps;
      const x = THREE.MathUtils.lerp(FRONT_SPROCKET_X, REAR_SPROCKET_X, t);
      // Slight natural catenary sag on upper drive run
      const y = THREE.MathUtils.lerp(
        FRONT_SPROCKET_Y + FRONT_SPROCKET_RADIUS,
        REAR_SPROCKET_Y + REAR_SPROCKET_RADIUS,
        t
      );
      points.push(new THREE.Vector3(x, y, SPROCKET_Z));
    }

    // Rear sprocket wrapping arc (from top +90° through rear 180° to bottom 270°)
    const rearArcSteps = 16;
    for (let i = 1; i < rearArcSteps; i++) {
      const angle = Math.PI / 2 + (i / rearArcSteps) * Math.PI;
      const x = REAR_SPROCKET_X + Math.cos(angle) * REAR_SPROCKET_RADIUS;
      const y = REAR_SPROCKET_Y + Math.sin(angle) * REAR_SPROCKET_RADIUS;
      points.push(new THREE.Vector3(x, y, SPROCKET_Z));
    }

    // Lower run from rear sprocket bottom back to front sprocket bottom
    const lowerSteps = 12;
    for (let i = 0; i <= lowerSteps; i++) {
      const t = i / lowerSteps;
      const x = THREE.MathUtils.lerp(REAR_SPROCKET_X, FRONT_SPROCKET_X, t);
      // Realistic lower run return path with slight slack sag
      const baseSag = Math.sin(t * Math.PI) * 0.012;
      const y = THREE.MathUtils.lerp(
        REAR_SPROCKET_Y - REAR_SPROCKET_RADIUS,
        FRONT_SPROCKET_Y - FRONT_SPROCKET_RADIUS,
        t
      ) - baseSag;
      points.push(new THREE.Vector3(x, y, SPROCKET_Z));
    }

    // Front sprocket wrapping arc (from bottom 270° through front 0°/360° to top 90°)
    const frontArcSteps = 12;
    for (let i = 1; i < frontArcSteps; i++) {
      const angle = (3 * Math.PI) / 2 + (i / frontArcSteps) * Math.PI;
      const x = FRONT_SPROCKET_X + Math.cos(angle) * FRONT_SPROCKET_RADIUS;
      const y = FRONT_SPROCKET_Y + Math.sin(angle) * FRONT_SPROCKET_RADIUS;
      points.push(new THREE.Vector3(x, y, SPROCKET_Z));
    }

    const curve = new THREE.CatmullRomCurve3(points, true);
    return new THREE.TubeGeometry(curve, 100, 0.009, 10, true);
  }, []);

  return (
    <group
      position={[explodeOffset.x, explodeOffset.y, explodeOffset.z]}
      userData={{ group: 'chain_sprocket', name: 'Drive Chain & Sprockets' }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver('chain_sprocket', 'Drive Chain & Sprockets');
      }}
      onPointerOut={onPointerOut}
      onClick={(e) => {
        e.stopPropagation();
        onClick('chain_sprocket');
      }}
    >
      {/* ========================================================
          FRONT COUNTERSHAFT SPROCKET (14-Teeth)
          ======================================================== */}
      <group position={[FRONT_SPROCKET_X, FRONT_SPROCKET_Y, SPROCKET_Z]}>
        {/* Sprocket Disc */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[FRONT_SPROCKET_RADIUS, FRONT_SPROCKET_RADIUS, 0.008, 24]} />
          <meshStandardMaterial
            color="#334155"
            roughness={0.35}
            metalness={0.9}
            emissive={new THREE.Color(emissive)}
            emissiveIntensity={emissiveIntensity}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>
        {/* Central shaft nut */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.018, 6]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.95} />
        </mesh>
      </group>

      {/* ========================================================
          REAR DRIVE SPROCKET (41-Teeth Hardened Steel)
          ======================================================== */}
      <group position={[REAR_SPROCKET_X, REAR_SPROCKET_Y, SPROCKET_Z]}>
        {/* Outer toothed ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.055, REAR_SPROCKET_RADIUS, 42]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.3}
            metalness={0.92}
            side={THREE.DoubleSide}
            emissive={new THREE.Color(emissive)}
            emissiveIntensity={emissiveIntensity}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>
        {/* Sprocket web thickness */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[REAR_SPROCKET_RADIUS - 0.006, REAR_SPROCKET_RADIUS - 0.006, 0.007, 36]} />
          <meshStandardMaterial
            color="#27272a"
            roughness={0.35}
            metalness={0.9}
            emissive={new THREE.Color(emissive)}
            emissiveIntensity={emissiveIntensity}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>
        {/* Weight-reduction lightning holes */}
        {boltAngles.map((angle, idx) => (
          <mesh
            key={`hole-${idx}`}
            position={[Math.cos(angle + 0.5) * 0.075, Math.sin(angle + 0.5) * 0.075, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.012, 0.012, 0.008, 16]} />
            <meshBasicMaterial color="#0b1220" />
          </mesh>
        ))}
        {/* 6 High-tensile Sprocket Mounting Bolts & Lock Nuts */}
        {boltAngles.map((angle, idx) => (
          <mesh
            key={`bolt-${idx}`}
            position={[Math.cos(angle) * 0.058, Math.sin(angle) * 0.058, 0.005]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.008, 0.008, 0.009, 6]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.95} />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          CONTINUOUS CLOSED DRIVE CHAIN LOOP (520 O-Ring Spec)
          ======================================================== */}
      <mesh geometry={chainGeometry}>
        <meshStandardMaterial
          color="#d97706" // Gold/bronze hardened O-ring links
          roughness={0.28}
          metalness={0.88}
          emissive={new THREE.Color(emissive)}
          emissiveIntensity={emissiveIntensity}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* ========================================================
          CHAIN GUARD & SWINGARM RUBBER SLIDER
          ======================================================== */}
      <group position={[-0.38, 0.38, SPROCKET_Z + 0.01]}>
        {/* Matte black protective chain guard */}
        <mesh rotation={[0, 0, 0.06]}>
          <boxGeometry args={[0.36, 0.035, 0.024]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.7}
            metalness={0.2}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>
      </group>
    </group>
  );
};
