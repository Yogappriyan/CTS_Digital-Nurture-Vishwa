/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOTOSYNQ AI — Digital Twin: Frame, Bodywork & Ergonomics Assembly
 * Includes high-tensile diamond backbone steel frame, down-tubes, subframe,
 * retro-roadster sculpted fuel tank with knee pads & filler cap, tuck-and-roll dual seat,
 * side panels, tail section, round LED taillight, footpegs, pedals, and side stand.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  HEAD_TUBE_X,
  HEAD_TUBE_Y,
  SWINGARM_PIVOT_X,
  SWINGARM_PIVOT_Y,
  SEAT_HEIGHT,
  TANK_CENTER_X,
  TANK_CENTER_Y,
  TANK_LENGTH,
  TANK_WIDTH,
  TANK_HEIGHT,
  SEAT_FRONT_X,
  SEAT_REAR_X,
  SEAT_WIDTH,
} from '../dimensions';

interface PartProps {
  selectedGroup: string | null;
  hoveredGroup: string | null;
  exploded: number;
  paintColor: string;
  onPointerOver: (group: string, name: string) => void;
  onPointerOut: () => void;
  onClick: (group: string) => void;
}

export const FrameAndBody: React.FC<PartProps> = ({
  selectedGroup,
  hoveredGroup,
  exploded,
  paintColor,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  // Exploded offsets:
  // Tank moves up (+Y)
  const tankExplode = useMemo(() => new THREE.Vector3(0, 0.18 * exploded, 0), [exploded]);
  // Seat & Tail moves up and back (-X, +Y)
  const seatExplode = useMemo(() => new THREE.Vector3(-0.10 * exploded, 0.14 * exploded, 0), [exploded]);

  const getMaterialProps = (group: string, defaultColor: string | number, isMetal = false) => {
    const isSelected = selectedGroup === group;
    const isHovered = hoveredGroup === group;
    const isAnySelected = Boolean(selectedGroup);
    const isDimmed = isAnySelected && !isSelected;

    const emissive = (isSelected || isHovered) ? '#22d3ee' : '#000000';
    const emissiveIntensity = isSelected ? 0.65 : isHovered ? 0.45 : 0;
    const opacity = isDimmed ? 0.35 : 1.0;
    const transparent = isDimmed;

    return {
      color: defaultColor,
      emissive: new THREE.Color(emissive),
      emissiveIntensity,
      transparent,
      opacity,
      roughness: isMetal ? 0.3 : 0.8,
      metalness: isMetal ? 0.85 : 0.1,
    };
  };

  // Main backbone frame tube from steering head to swingarm pivot
  const backboneGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(HEAD_TUBE_X, HEAD_TUBE_Y, 0),
      new THREE.Vector3(HEAD_TUBE_X - 0.12, HEAD_TUBE_Y - 0.08, 0),
      new THREE.Vector3(0.04, 0.64, 0),
      new THREE.Vector3(SWINGARM_PIVOT_X, SWINGARM_PIVOT_Y + 0.14, 0),
      new THREE.Vector3(SWINGARM_PIVOT_X, SWINGARM_PIVOT_Y, 0),
    ]);
    return new THREE.TubeGeometry(curve, 28, 0.024, 16, false);
  }, []);

  // Down-tubes connecting head tube down around engine cradle
  const downTubeGeometryLeft = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(HEAD_TUBE_X - 0.04, HEAD_TUBE_Y - 0.06, 0.0),
      new THREE.Vector3(0.24, 0.52, -0.075),
      new THREE.Vector3(0.18, 0.28, -0.075),
      new THREE.Vector3(-0.06, 0.22, -0.075),
      new THREE.Vector3(SWINGARM_PIVOT_X, SWINGARM_PIVOT_Y, -0.075),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.014, 12, false);
  }, []);

  const downTubeGeometryRight = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(HEAD_TUBE_X - 0.04, HEAD_TUBE_Y - 0.06, 0.0),
      new THREE.Vector3(0.24, 0.52, 0.075),
      new THREE.Vector3(0.18, 0.28, 0.075),
      new THREE.Vector3(-0.06, 0.22, 0.075),
      new THREE.Vector3(SWINGARM_PIVOT_X, SWINGARM_PIVOT_Y, 0.075),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.014, 12, false);
  }, []);

  // Rear subframe tubes supporting seat
  const subframeGeometry = useMemo(() => {
    const curveLeft = new THREE.CatmullRomCurve3([
      new THREE.Vector3(SWINGARM_PIVOT_X + 0.05, 0.64, -0.09),
      new THREE.Vector3(-0.35, 0.74, -0.10),
      new THREE.Vector3(SEAT_REAR_X - 0.05, 0.78, -0.08),
    ]);
    return new THREE.TubeGeometry(curveLeft, 20, 0.013, 12, false);
  }, []);

  const subframeLowerGeometry = useMemo(() => {
    const curveLeft = new THREE.CatmullRomCurve3([
      new THREE.Vector3(SWINGARM_PIVOT_X, SWINGARM_PIVOT_Y + 0.08, -0.08),
      new THREE.Vector3(-0.42, 0.66, -0.085),
      new THREE.Vector3(SEAT_REAR_X - 0.05, 0.78, -0.08),
    ]);
    return new THREE.TubeGeometry(curveLeft, 20, 0.012, 12, false);
  }, []);

  return (
    <group>
      {/* ========================================================
          STEEL CHASSIS & SUBFRAME
          ======================================================== */}
      <group
        userData={{ group: 'non_monitored', name: 'High-Tensile Steel Diamond Frame' }}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver('non_monitored', 'Steel Diamond Frame'); }}
        onPointerOut={onPointerOut}
        onClick={(e) => { e.stopPropagation(); onClick('non_monitored'); }}
      >
        {/* Steering Head Tube */}
        <mesh position={[HEAD_TUBE_X, HEAD_TUBE_Y, 0]} rotation={[0, 0, 26 * (Math.PI / 180)]}>
          <cylinderGeometry args={[0.026, 0.026, 0.19, 20]} />
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#1e2430', true)}
            roughness={0.35}
            metalness={0.88}
          />
        </mesh>

        {/* Main Backbone Tube */}
        <mesh geometry={backboneGeometry}>
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#1e2430', true)}
            roughness={0.35}
            metalness={0.88}
          />
        </mesh>

        {/* Dual Down-tubes Cradle (Left & Right) */}
        <mesh geometry={downTubeGeometryLeft}>
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#1e2430', true)}
            roughness={0.35}
            metalness={0.88}
          />
        </mesh>
        <mesh geometry={downTubeGeometryRight}>
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#1e2430', true)}
            roughness={0.35}
            metalness={0.88}
          />
        </mesh>

        {/* Rear Subframe Rails (Left & Right) */}
        <mesh geometry={subframeGeometry}>
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#1e2430', true)}
            roughness={0.35}
            metalness={0.88}
          />
        </mesh>
        <mesh geometry={subframeLowerGeometry}>
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#1e2430', true)}
            roughness={0.35}
            metalness={0.88}
          />
        </mesh>
        {/* Right mirror subframe */}
        <group scale={[1, 1, -1]}>
          <mesh geometry={subframeGeometry}>
            <meshStandardMaterial
              {...getMaterialProps('non_monitored', '#1e2430', true)}
              roughness={0.35}
              metalness={0.88}
            />
          </mesh>
          <mesh geometry={subframeLowerGeometry}>
            <meshStandardMaterial
              {...getMaterialProps('non_monitored', '#1e2430', true)}
              roughness={0.35}
              metalness={0.88}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          RETRO-MODERN FUEL TANK (FZ-X Tear-drop Roadster)
          ======================================================== */}
      <group
        position={[
          TANK_CENTER_X + tankExplode.x,
          TANK_CENTER_Y + tankExplode.y,
          tankExplode.z,
        ]}
        userData={{ group: 'non_monitored', name: 'Roadster Fuel Tank (10 Litres)' }}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver('non_monitored', 'Fuel Tank'); }}
        onPointerOut={onPointerOut}
        onClick={(e) => { e.stopPropagation(); onClick('non_monitored'); }}
      >
        {/* Main Tank Sculpted Body */}
        <mesh position={[0, 0, 0]} scale={[1.15, 0.75, 0.88]}>
          <sphereGeometry args={[TANK_LENGTH / 2, 32, 24]} />
          <meshPhysicalMaterial
            color={paintColor}
            roughness={0.22}
            metalness={0.68}
            clearcoat={0.95}
            clearcoatRoughness={0.08}
          />
        </mesh>

        {/* Tank Lower Knee Recesses / Under-trim */}
        <mesh position={[-0.04, -0.06, 0]}>
          <boxGeometry args={[TANK_LENGTH * 0.72, 0.08, TANK_WIDTH * 0.75]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Contrasting Matte Knee Grip Pads (Left and Right) */}
        {[-TANK_WIDTH / 2 + 0.015, TANK_WIDTH / 2 - 0.015].map((z, idx) => (
          <mesh key={idx} position={[-0.03, -0.01, z]} rotation={[0, 0, -0.1]}>
            <boxGeometry args={[0.16, 0.09, 0.018]} />
            <meshStandardMaterial color="#18181b" roughness={0.95} metalness={0.05} />
          </mesh>
        ))}

        {/* Aircraft-Style Flush Fuel Filler Cap */}
        <group position={[0.08, TANK_HEIGHT * 0.58, 0]} rotation={[0.15, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.038, 0.038, 0.008, 24]} />
            <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.004, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.006, 24]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.98} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          SIDE PANELS & ELECTRICAL UTILITY COVERS
          ======================================================== */}
      {[-0.10, 0.10].map((z, idx) => (
        <group
          key={idx}
          position={[-0.08, 0.55, z]}
          userData={{ group: 'non_monitored', name: 'Roadster Side Cover' }}
        >
          <mesh rotation={[0, (z > 0 ? 0.08 : -0.08), 0]}>
            <boxGeometry args={[0.22, 0.14, 0.018]} />
            <meshPhysicalMaterial
              color="#090d16"
              roughness={0.4}
              metalness={0.5}
              clearcoat={0.7}
            />
          </mesh>
          {/* Aluminum decorative accent mesh insert */}
          <mesh position={[0, 0, (z > 0 ? 0.011 : -0.011)]}>
            <planeGeometry args={[0.12, 0.05]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          TUCK-AND-ROLL ROADSTER DUAL STEP SEAT
          ======================================================== */}
      <group
        position={[seatExplode.x, seatExplode.y, seatExplode.z]}
        userData={{ group: 'non_monitored', name: 'Ribbed Scrambler Step Seat' }}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver('non_monitored', 'Step Seat'); }}
        onPointerOut={onPointerOut}
        onClick={(e) => { e.stopPropagation(); onClick('non_monitored'); }}
      >
        {/* Rider Front Seat Section (Height: SEAT_HEIGHT = 0.80m) */}
        <mesh position={[-0.20, SEAT_HEIGHT + 0.01, 0]}>
          <boxGeometry args={[0.26, 0.065, SEAT_WIDTH - 0.03]} />
          <meshStandardMaterial color="#18181b" roughness={0.92} metalness={0.06} />
        </mesh>

        {/* Passenger Raised Step Section */}
        <mesh position={[-0.43, SEAT_HEIGHT + 0.045, 0]}>
          <boxGeometry args={[0.22, 0.07, SEAT_WIDTH - 0.05]} />
          <meshStandardMaterial color="#18181b" roughness={0.92} metalness={0.06} />
        </mesh>

        {/* Retro Ribbed Quilted Pleats */}
        {Array.from({ length: 8 }, (_, i) => -0.12 - i * 0.045).map((x, idx) => (
          <mesh key={idx} position={[x, (x < -0.32 ? SEAT_HEIGHT + 0.082 : SEAT_HEIGHT + 0.045), 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.005, 0.005, SEAT_WIDTH - 0.06, 8]} />
            <meshStandardMaterial color="#27272a" roughness={0.85} metalness={0.05} />
          </mesh>
        ))}

        {/* Grab Rail / Pilllion Loop */}
        <group position={[SEAT_REAR_X + 0.02, SEAT_HEIGHT + 0.04, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.09, 0.009, 12, 24, Math.PI]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          TAIL COWL, ROUND LED TAILLIGHT & REAR INDICATORS
          ======================================================== */}
      <group position={[SEAT_REAR_X - 0.05, 0.76, 0]}>
        {/* Tail Cowl */}
        <mesh position={[0, -0.01, 0]}>
          <boxGeometry args={[0.11, 0.06, 0.16]} />
          <meshPhysicalMaterial
            color={paintColor}
            roughness={0.25}
            metalness={0.65}
            clearcoat={0.9}
          />
        </mesh>

        {/* Retro Round LED Taillight */}
        <group position={[-0.06, 0.01, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.034, 0.034, 0.022, 24]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Red Emissive Lens Ring */}
          <mesh position={[0, 0.012, 0]}>
            <circleGeometry args={[0.03, 24]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive={new THREE.Color('#ef4444')}
              emissiveIntensity={1.2}
              roughness={0.15}
            />
          </mesh>
        </group>

        {/* Rear Amber Turn Signals */}
        {[-0.11, 0.11].map((z, idx) => (
          <group key={idx} position={[-0.03, -0.02, z]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.03, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, (z > 0 ? 0.016 : -0.016)]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.013, 0.013, 0.01, 16]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive={new THREE.Color('#f59e0b')}
                emissiveIntensity={0.6}
              />
            </mesh>
          </group>
        ))}

        {/* License Plate Bracket & Reflector */}
        <group position={[-0.08, -0.10, 0]} rotation={[0, 0, -0.3]}>
          <mesh>
            <boxGeometry args={[0.008, 0.12, 0.05]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.3} />
          </mesh>
          <mesh position={[-0.006, -0.02, 0]}>
            <boxGeometry args={[0.004, 0.09, 0.14]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} metalness={0.1} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          FOOT CONTROLS, PEGS & SIDE STAND
          ======================================================== */}
      {/* Rider Footpegs (Left -Z and Right +Z) */}
      {[-0.19, 0.19].map((z, idx) => (
        <group key={idx} position={[-0.08, 0.30, z]}>
          {/* Cast Hanger Bracket */}
          <mesh position={[0, 0.02, (z > 0 ? -0.04 : 0.04)]}>
            <boxGeometry args={[0.08, 0.05, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Rubber Knurled Peg */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.09, 16]} />
            <meshStandardMaterial color="#18181b" roughness={0.95} metalness={0.05} />
          </mesh>
        </group>
      ))}

      {/* Right Side Foot Brake Lever (+Z) */}
      <group position={[0.02, 0.28, 0.16]}>
        <mesh rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.11, 0.014, 0.012]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.2} />
        </mesh>
        {/* Serrated Toe Pedal */}
        <mesh position={[0.06, 0.01, 0.018]}>
          <boxGeometry args={[0.024, 0.012, 0.03]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>

      {/* Left Side Gearshift Pedal (-Z) */}
      <group position={[0.01, 0.28, -0.16]}>
        <mesh rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.10, 0.014, 0.012]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.2} />
        </mesh>
        {/* Rubber Shifter Peg */}
        <mesh position={[0.055, 0.01, -0.018]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.011, 0.011, 0.028, 12]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} metalness={0.1} />
        </mesh>
      </group>

      {/* Side Stand (Kickstand, folded on left -Z) */}
      <group position={[-0.08, 0.24, -0.11]} rotation={[-0.2, 0, -0.55]}>
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.011, 0.009, 0.26, 14]} />
          <meshStandardMaterial color="#1e2430" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* Flat Foot Pad */}
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[0.045, 0.008, 0.035]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};
