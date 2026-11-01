/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOTOSYNQ AI — Digital Twin: Rear End Assembly
 * Includes box-section swingarm, central monoshock with high-tensile coil spring,
 * rear wheel hub & precision wheel bearings, rear axle and adjusters,
 * rear brake disc & caliper, rear tyre (140/70-17), and rear hugger fender.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  REAR_AXLE_X,
  REAR_AXLE_Y,
  REAR_AXLE_Z,
  REAR_TYRE_RADIUS,
  REAR_TYRE_WIDTH,
  REAR_RIM_RADIUS,
  REAR_RIM_WIDTH,
  REAR_DISC_RADIUS,
  SWINGARM_PIVOT_X,
  SWINGARM_PIVOT_Y,
  MONOSHOCK_TOP_X,
  MONOSHOCK_TOP_Y,
} from '../dimensions';

interface PartProps {
  selectedGroup: string | null;
  hoveredGroup: string | null;
  exploded: number;
  onPointerOver: (group: string, name: string) => void;
  onPointerOut: () => void;
  onClick: (group: string) => void;
}

export const RearEnd: React.FC<PartProps> = ({
  selectedGroup,
  hoveredGroup,
  exploded,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  // Exploded offset: pushes rear assembly back (-X) and down slightly
  const explodeOffset = useMemo(
    () => new THREE.Vector3(-0.20 * exploded, -0.04 * exploded, 0),
    [exploded]
  );

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

  // 10-Spoke alloy pattern for rear rim
  const spokeAngles = useMemo(() => Array.from({ length: 10 }, (_, i) => (i * Math.PI * 2) / 10), []);

  // Swingarm arm length & pitch
  const swingarmLength = Math.hypot(
    REAR_AXLE_X - SWINGARM_PIVOT_X,
    REAR_AXLE_Y - SWINGARM_PIVOT_Y
  );
  const swingarmPitch = Math.atan2(
    REAR_AXLE_Y - SWINGARM_PIVOT_Y,
    REAR_AXLE_X - SWINGARM_PIVOT_X
  );

  // Monoshock coil spring geometry
  const springGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const coils = 7;
    const pointsPerCoil = 16;
    const totalPoints = coils * pointsPerCoil;
    const length = 0.16;
    const radius = 0.026;

    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const angle = t * coils * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = t * length - length / 2;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 90, 0.006, 8, false);
  }, []);

  return (
    <group position={[explodeOffset.x, explodeOffset.y, explodeOffset.z]}>
      {/* ========================================================
          BOX-SECTION SWINGARM (Pivot at frame to rear axle)
          ======================================================== */}
      <group position={[SWINGARM_PIVOT_X, SWINGARM_PIVOT_Y, 0]}>
        {/* Pivot cross-shaft sleeve */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.22, 16]} />
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#1e293b', true)}
            roughness={0.3}
            metalness={0.9}
          />
        </mesh>

        {/* Dual box-section arms extending back to rear axle */}
        {[-0.10, 0.10].map((z, idx) => (
          <group
            key={idx}
            position={[0, 0, z]}
            rotation={[0, 0, swingarmPitch + Math.PI]}
          >
            {/* Main arm beam */}
            <mesh position={[swingarmLength / 2, 0, 0]}>
              <boxGeometry args={[swingarmLength, 0.045, 0.025]} />
              <meshStandardMaterial
                {...getMaterialProps('non_monitored', '#1e2430', true)}
                roughness={0.35}
                metalness={0.85}
              />
            </mesh>

            {/* Rear Axle Dropout Slot / Chain Tensioner Block */}
            <mesh position={[swingarmLength, 0, 0]}>
              <boxGeometry args={[0.065, 0.05, 0.028]} />
              <meshStandardMaterial
                {...getMaterialProps('non_monitored', '#334155', true)}
                roughness={0.3}
                metalness={0.9}
              />
            </mesh>
            {/* Tensioner adjuster bolt */}
            <mesh position={[swingarmLength + 0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.005, 0.005, 0.03, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Swingarm Cross-Brace Gusset */}
        <mesh position={[-0.14, -0.01, 0]}>
          <boxGeometry args={[0.06, 0.035, 0.19]} />
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#181b22', true)}
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* ========================================================
          MONOSHOCK REAR SUSPENSION (Between frame backbone & swingarm)
          ======================================================== */}
      {(() => {
        const shockBottomX = -0.27;
        const shockBottomY = 0.35;
        const dx = shockBottomX - MONOSHOCK_TOP_X;
        const dy = shockBottomY - MONOSHOCK_TOP_Y;
        const shockLength = Math.hypot(dx, dy);
        const shockAngle = Math.atan2(dy, dx);

        return (
          <group
            position={[MONOSHOCK_TOP_X, MONOSHOCK_TOP_Y, 0]}
            rotation={[0, 0, shockAngle + Math.PI / 2]}
          >
            {/* Top eyelet mount */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.03, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
            </mesh>

            {/* Upper hydraulic damper body */}
            <mesh position={[0, -shockLength * 0.32, 0]}>
              <cylinderGeometry args={[0.022, 0.022, shockLength * 0.45, 20]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.25} />
            </mesh>

            {/* High-Tensile Coil Spring (Sport Yellow / Gold) */}
            <group position={[0, -shockLength * 0.52, 0]}>
              <mesh geometry={springGeometry}>
                <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.6} />
              </mesh>
            </group>

            {/* Lower chrome damper shaft & eyelet */}
            <mesh position={[0, -shockLength * 0.78, 0]}>
              <cylinderGeometry args={[0.009, 0.009, shockLength * 0.35, 16]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.1} />
            </mesh>
            <mesh position={[0, -shockLength, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.03, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
            </mesh>
          </group>
        );
      })()}

      {/* ========================================================
          REAR WHEEL & TYRE (Strictly Vertical in XY Plane, contact at Y = 0)
          ======================================================== */}
      <group position={[REAR_AXLE_X, REAR_AXLE_Y, REAR_AXLE_Z]}>
        {/* Rear Tyre (140/70-17 tubeless road pattern, 100% vertical in XY plane) */}
        <group
          userData={{ group: 'non_monitored', name: 'Rear Tyre (140/70-17)' }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver('non_monitored', 'Rear Tyre (140/70-17)'); }}
          onPointerOut={onPointerOut}
          onClick={(e) => { e.stopPropagation(); onClick('non_monitored'); }}
        >
          {/* Main tyre tread & crown: Torus in vertical XY plane (no X tilt) */}
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[REAR_TYRE_RADIUS - REAR_TYRE_WIDTH * 0.44, REAR_TYRE_WIDTH * 0.44, 32, 64]} />
            <meshStandardMaterial
              {...getMaterialProps('non_monitored', '#15171a')}
              roughness={0.92}
              metalness={0.05}
            />
          </mesh>
          {/* Sidewall shoulder bead rings (Left and Right) */}
          {[-REAR_RIM_WIDTH / 2 - 0.006, REAR_RIM_WIDTH / 2 + 0.006].map((z, idx) => (
            <mesh key={idx} position={[0, 0, z]} rotation={[0, 0, 0]}>
              <torusGeometry args={[REAR_RIM_RADIUS + 0.018, 0.008, 16, 48]} />
              <meshStandardMaterial
                {...getMaterialProps('non_monitored', '#111315')}
                roughness={0.95}
                metalness={0.03}
              />
            </mesh>
          ))}
        </group>

        {/* Rear Rim Outer Barrel (Cylinder coaxial with Z-axle) */}
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          userData={{ group: 'non_monitored', name: 'Rear 17-inch Alloy Rim' }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver('non_monitored', 'Rear 17" Alloy Rim'); }}
          onPointerOut={onPointerOut}
          onClick={(e) => { e.stopPropagation(); onClick('non_monitored'); }}
        >
          <cylinderGeometry args={[REAR_RIM_RADIUS, REAR_RIM_RADIUS, REAR_RIM_WIDTH, 48, 1, true]} />
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#1e2430', true)}
            roughness={0.3}
            metalness={0.88}
          />
        </mesh>

        {/* Machined outer rim flanges / retaining lips (Left & Right) */}
        {[-REAR_RIM_WIDTH / 2, REAR_RIM_WIDTH / 2].map((z, idx) => (
          <mesh key={idx} position={[0, 0, z]} rotation={[0, 0, 0]}>
            <torusGeometry args={[REAR_RIM_RADIUS, 0.0055, 16, 48]} />
            <meshStandardMaterial
              {...getMaterialProps('non_monitored', '#94a3b8', true)}
              roughness={0.2}
              metalness={0.95}
            />
          </mesh>
        ))}

        {/* Drop-centre inner rim well barrel */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[REAR_RIM_RADIUS - 0.018, REAR_RIM_RADIUS - 0.018, REAR_RIM_WIDTH * 0.72, 36, 1, true]} />
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#0f172a', true)}
            roughness={0.4}
            metalness={0.85}
          />
        </mesh>

        {/* 10-Spoke Directional Alloy Pattern (Radiating in vertical XY plane) */}
        {spokeAngles.map((angle, idx) => {
          const spokeLen = REAR_RIM_RADIUS - 0.06;
          const rMid = 0.054 + spokeLen / 2;
          return (
            <mesh
              key={idx}
              position={[Math.cos(angle) * rMid, Math.sin(angle) * rMid, 0]}
              rotation={[0, 0, angle - Math.PI / 2]}
              userData={{ group: 'non_monitored', name: 'Rear Rim Spoke' }}
            >
              <cylinderGeometry args={[0.007, 0.013, spokeLen, 12]} />
              <meshStandardMaterial
                {...getMaterialProps('non_monitored', '#2a2f38', true)}
                roughness={0.28}
                metalness={0.9}
              />
            </mesh>
          );
        })}

        {/* ========================================================
            DIAGNOSTIC COMPONENT: WHEEL BEARINGS & REAR HUB
            ======================================================== */}
        <group
          userData={{ group: 'wheel_bearing', name: 'Rear Wheel Bearings, Cush Drive & Hub' }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver('wheel_bearing', 'Rear Wheel Bearings, Cush Drive & Hub'); }}
          onPointerOut={onPointerOut}
          onClick={(e) => { e.stopPropagation(); onClick('wheel_bearing'); }}
        >
          {/* Central cast hub body (coaxial with Z-axle) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.054, 0.054, 0.15, 28]} />
            <meshStandardMaterial
              {...getMaterialProps('wheel_bearing', '#3b4252', true)}
              roughness={0.25}
              metalness={0.92}
            />
          </mesh>

          {/* Deep-groove sealed bearing races (Left & Right, vertical in XY plane) */}
          {[-0.065, 0.065].map((z, idx) => (
            <group key={idx} position={[0, 0, z]}>
              <mesh rotation={[0, 0, 0]}>
                <ringGeometry args={[0.024, 0.048, 28]} />
                <meshStandardMaterial
                  {...getMaterialProps('wheel_bearing', '#94a3b8', true)}
                  roughness={0.2}
                  metalness={0.95}
                  side={THREE.DoubleSide}
                />
              </mesh>
              {/* Rubber dust seal */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.046, 0.046, 0.006, 24, 1, true]} />
                <meshStandardMaterial color="#0284c7" roughness={0.7} metalness={0.1} />
              </mesh>
            </group>
          ))}

          {/* Rear Axle Through-Spindle */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.010, 0.010, 0.26, 16]} />
            <meshStandardMaterial
              {...getMaterialProps('wheel_bearing', '#cbd5e1', true)}
              roughness={0.15}
              metalness={0.95}
            />
          </mesh>

          {/* Castle Nut & Split Pin (left side -Z) */}
          <mesh position={[0, 0, -0.125]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.02, 6]} />
            <meshStandardMaterial
              {...getMaterialProps('wheel_bearing', '#94a3b8', true)}
              roughness={0.25}
              metalness={0.9}
            />
          </mesh>
        </group>

        {/* Rear Brake Rotor (220 mm disc on right side +Z, vertical in XY plane) */}
        <group position={[0, 0, 0.058]}>
          <mesh
            rotation={[0, 0, 0]}
            userData={{ group: 'non_monitored', name: 'Rear Solid Ventilated Brake Rotor (220mm)' }}
            onPointerOver={(e) => { e.stopPropagation(); onPointerOver('non_monitored', 'Rear Brake Rotor'); }}
            onPointerOut={onPointerOut}
            onClick={(e) => { e.stopPropagation(); onClick('non_monitored'); }}
          >
            <ringGeometry args={[0.065, REAR_DISC_RADIUS, 36]} />
            <meshStandardMaterial
              {...getMaterialProps('non_monitored', '#cbd5e1', true)}
              roughness={0.25}
              metalness={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Inner 5-bolt mounting spider */}
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[0.035, 0.065, 5]} />
            <meshStandardMaterial
              {...getMaterialProps('non_monitored', '#334155', true)}
              roughness={0.35}
              metalness={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* Rear Brake Caliper (Nissin single-piston floating) */}
        <mesh
          position={[0.075, 0.07, 0.058]}
          userData={{ group: 'non_monitored', name: 'Rear Single-Piston Brake Caliper' }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver('non_monitored', 'Rear Brake Caliper'); }}
          onPointerOut={onPointerOut}
          onClick={(e) => { e.stopPropagation(); onClick('non_monitored'); }}
        >
          <boxGeometry args={[0.065, 0.055, 0.038]} />
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#0f172a', true)}
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* Rear Hugger Mudguard (arches over rear wheel vertically in XY plane) */}
      <group position={[REAR_AXLE_X, REAR_AXLE_Y, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry
            args={[
              REAR_TYRE_RADIUS + 0.022,
              REAR_TYRE_RADIUS + 0.022,
              REAR_TYRE_WIDTH + 0.02,
              32,
              1,
              true,
              0.45,
              2.0,
            ]}
          />
          <meshStandardMaterial
            color="#0f141c"
            roughness={0.7}
            metalness={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Hugger mounting stay to swingarm */}
        <mesh position={[0.16, 0.08, -0.075]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.12, 0.015, 0.008]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};
