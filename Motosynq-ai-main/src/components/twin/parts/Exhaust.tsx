/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOTOSYNQ AI — Digital Twin: Exhaust & Muffler System Assembly
 * Procedural model of roadster swept 2-into-1 style single header and upswept megaphone muffler
 * Includes cylinder head exhaust collar, contoured stainless header pipe, catalytic chamber,
 * matte black/brushed swept muffler canister, aluminum heat shield, end tip, and frame bracket.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  EXHAUST_HEADER_START_X,
  EXHAUST_HEADER_START_Y,
  EXHAUST_PIPE_RADIUS,
  MUFFLER_Z,
  MUFFLER_START_X,
  MUFFLER_START_Y,
  MUFFLER_END_X,
  MUFFLER_END_Y,
  MUFFLER_RADIUS,
} from '../dimensions';

interface PartProps {
  selectedGroup: string | null;
  hoveredGroup: string | null;
  exploded: number;
  onPointerOver: (group: string, name: string) => void;
  onPointerOut: () => void;
  onClick: (group: string) => void;
}

export const Exhaust: React.FC<PartProps> = ({
  selectedGroup,
  hoveredGroup,
  exploded,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  // Exploded offset: pushes exhaust outward to the right (+Z) and slightly back
  const explodeOffset = useMemo(
    () => new THREE.Vector3(-0.06 * exploded, 0.02 * exploded, 0.20 * exploded),
    [exploded]
  );

  const isSelected = selectedGroup === 'exhaust';
  const isHovered = hoveredGroup === 'exhaust';
  const isAnySelected = Boolean(selectedGroup);
  const isDimmed = isAnySelected && !isSelected;

  const emissive = (isSelected || isHovered) ? '#22d3ee' : '#000000';
  const emissiveIntensity = isSelected ? 0.7 : isHovered ? 0.45 : 0;
  const opacity = isDimmed ? 0.35 : 1.0;
  const transparent = isDimmed;

  // Seamless 3D curve for header pipe from cylinder head to muffler inlet
  const headerGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(EXHAUST_HEADER_START_X, EXHAUST_HEADER_START_Y, 0.04), // head flange
      new THREE.Vector3(0.24, 0.42, 0.09), // sweep out & down in front of cylinder
      new THREE.Vector3(0.23, 0.27, 0.14), // curve down front of crankcase
      new THREE.Vector3(0.12, 0.20, 0.165), // curve along bottom right cradle
      new THREE.Vector3(-0.02, 0.21, 0.17), // pre-chamber collector
      new THREE.Vector3(MUFFLER_START_X, MUFFLER_START_Y, MUFFLER_Z), // muffler entrance
    ]);
    return new THREE.TubeGeometry(curve, 48, EXHAUST_PIPE_RADIUS, 16, false);
  }, []);

  // Muffler angle and length
  const mufflerLength = Math.hypot(
    MUFFLER_END_X - MUFFLER_START_X,
    MUFFLER_END_Y - MUFFLER_START_Y
  );
  const mufflerPitch = Math.atan2(
    MUFFLER_END_Y - MUFFLER_START_Y,
    MUFFLER_END_X - MUFFLER_START_X
  );

  return (
    <group
      position={[explodeOffset.x, explodeOffset.y, explodeOffset.z]}
      userData={{ group: 'exhaust', name: 'Exhaust & Muffler System' }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver('exhaust', 'Exhaust & Muffler System');
      }}
      onPointerOut={onPointerOut}
      onClick={(e) => {
        e.stopPropagation();
        onClick('exhaust');
      }}
    >
      {/* ========================================================
          EXHAUST FLANGE & CYLINDER HEAD COLLAR
          ======================================================== */}
      <mesh
        position={[EXHAUST_HEADER_START_X, EXHAUST_HEADER_START_Y, 0.04]}
        rotation={[0, 0, -0.6]}
      >
        <cylinderGeometry args={[0.028, 0.028, 0.018, 16]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.3}
          metalness={0.9}
          emissive={new THREE.Color(emissive)}
          emissiveIntensity={emissiveIntensity}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Header Retaining Stud Nuts */}
      {[-0.015, 0.015].map((dz, idx) => (
        <mesh
          key={idx}
          position={[EXHAUST_HEADER_START_X + 0.01, EXHAUST_HEADER_START_Y, 0.04 + dz]}
        >
          <cylinderGeometry args={[0.006, 0.006, 0.012, 6]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.2} />
        </mesh>
      ))}

      {/* ========================================================
          STAINLESS STEEL CONTOURED HEADER PIPE
          ======================================================== */}
      <mesh geometry={headerGeometry}>
        <meshStandardMaterial
          color="#64748b" // Heat-blued stainless steel
          roughness={0.28}
          metalness={0.88}
          emissive={new THREE.Color(emissive)}
          emissiveIntensity={emissiveIntensity}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Catalytic Pre-chamber Expansion Box (under engine) */}
      <mesh position={[-0.03, 0.21, 0.155]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.042, 0.042, 0.12, 16]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.4}
          metalness={0.85}
          emissive={new THREE.Color(emissive)}
          emissiveIntensity={emissiveIntensity}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* ========================================================
          SWEPT ROADSTER MUFFLER CANISTER (Upswept megaphone)
          ======================================================== */}
      <group
        position={[MUFFLER_START_X, MUFFLER_START_Y, MUFFLER_Z]}
        rotation={[0, 0, mufflerPitch + Math.PI / 2]}
      >
        {/* Main muffler canister body */}
        <mesh position={[0, -mufflerLength / 2, 0]}>
          <cylinderGeometry
            args={[MUFFLER_RADIUS, MUFFLER_RADIUS * 0.72, mufflerLength, 28]}
          />
          <meshStandardMaterial
            color="#18191f" // Matte ceramic black
            roughness={0.4}
            metalness={0.82}
            emissive={new THREE.Color(emissive)}
            emissiveIntensity={emissiveIntensity}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>

        {/* Brushed Stainless Heat Shield (protects pillion leg) */}
        <mesh position={[0.022, -mufflerLength / 2, 0.015]} rotation={[0, 0.3, 0]}>
          <cylinderGeometry
            args={[MUFFLER_RADIUS + 0.007, MUFFLER_RADIUS * 0.72 + 0.007, mufflerLength * 0.72, 16, 1, true, 0, Math.PI / 1.5]}
          />
          <meshStandardMaterial
            color="#94a3b8"
            roughness={0.25}
            metalness={0.92}
            side={THREE.DoubleSide}
            emissive={new THREE.Color(emissive)}
            emissiveIntensity={emissiveIntensity}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>

        {/* Muffler Tapered End Cap */}
        <mesh position={[0, -mufflerLength - 0.025, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[MUFFLER_RADIUS, 0.05, 24]} />
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

        {/* Polished Exhaust Outlet Tip */}
        <mesh position={[0, -mufflerLength - 0.05, 0]}>
          <cylinderGeometry args={[0.019, 0.021, 0.025, 20]} />
          <meshStandardMaterial
            color="#e2e8f0"
            roughness={0.15}
            metalness={0.98}
            emissive={new THREE.Color(emissive)}
            emissiveIntensity={emissiveIntensity}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>
      </group>

      {/* Frame Mounting Bracket (bolts to rear subframe/footpeg hanger) */}
      <mesh position={[-0.38, 0.42, MUFFLER_Z - 0.04]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.08, 0.02, 0.04]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  );
};
