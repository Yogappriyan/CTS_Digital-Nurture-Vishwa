/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOTOSYNQ AI — Digital Twin: Front End Assembly
 * Includes front wheel, tyre, rim, hub/wheel bearings, brake disc/caliper,
 * telescopic fork stanchions, lower sliders, gaiters, triple clamps, head tube,
 * handlebars, levers, mirrors, retro round headlight, and front fender.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  FRONT_AXLE_X,
  FRONT_AXLE_Y,
  FRONT_AXLE_Z,
  FRONT_TYRE_RADIUS,
  FRONT_TYRE_WIDTH,
  FRONT_RIM_RADIUS,
  FRONT_RIM_WIDTH,
  FRONT_DISC_RADIUS,
  FORK_RAKE,
  FORK_SPACING,
  FORK_TUBE_RADIUS,
  GAITER_RADIUS,
  HEAD_TUBE_X,
  HEAD_TUBE_Y,
  HANDLEBAR_HEIGHT,
  HANDLEBAR_WIDTH,
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

export const FrontEnd: React.FC<PartProps> = ({
  selectedGroup,
  hoveredGroup,
  exploded,
  paintColor,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  // Exploded offset along fork rake vector (forward and slightly up)
  const explodeOffset = useMemo(() => {
    const dist = 0.22 * exploded;
    return new THREE.Vector3(
      Math.sin(FORK_RAKE) * dist + 0.12 * exploded,
      Math.cos(FORK_RAKE) * dist * 0.4,
      0
    );
  }, [exploded]);

  // Status helper for opacity / highlight
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

  // Fork tube geometry calculations
  // Lower sliders reach down to FRONT_AXLE_Y at FRONT_AXLE_X
  // Fork axis tilts back by FORK_RAKE from vertical
  const forkLength = Math.hypot(HEAD_TUBE_X - FRONT_AXLE_X, HEAD_TUBE_Y - FRONT_AXLE_Y) + 0.08;

  // Spoke angles for 10-spoke alloy wheel
  const spokeAngles = useMemo(() => Array.from({ length: 10 }, (_, i) => (i * Math.PI * 2) / 10), []);

  return (
    <group position={[explodeOffset.x, explodeOffset.y, explodeOffset.z]}>
      {/* ========================================================
          FRONT WHEEL & TYRE (Strictly Vertical in XY Plane, contact at Y = 0)
          ======================================================== */}
      <group position={[FRONT_AXLE_X, FRONT_AXLE_Y, FRONT_AXLE_Z]}>
        {/* Tyre (100/80-17 tubeless road pattern, 100% vertical in XY plane) */}
        <group
          userData={{ group: 'non_monitored', name: 'Front Tyre (100/80-17)' }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver('non_monitored', 'Front Tyre (100/80-17)'); }}
          onPointerOut={onPointerOut}
          onClick={(e) => { e.stopPropagation(); onClick('non_monitored'); }}
        >
          {/* Main tyre tread & crown: Torus in vertical XY plane (no X tilt) */}
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[FRONT_TYRE_RADIUS - FRONT_TYRE_WIDTH * 0.44, FRONT_TYRE_WIDTH * 0.44, 32, 64]} />
            <meshStandardMaterial
              {...getMaterialProps('non_monitored', '#15171a')}
              roughness={0.92}
              metalness={0.05}
            />
          </mesh>
          {/* Sidewall shoulder bead rings (Left and Right) */}
          {[-FRONT_RIM_WIDTH / 2 - 0.005, FRONT_RIM_WIDTH / 2 + 0.005].map((z, idx) => (
            <mesh key={idx} position={[0, 0, z]} rotation={[0, 0, 0]}>
              <torusGeometry args={[FRONT_RIM_RADIUS + 0.015, 0.007, 16, 48]} />
              <meshStandardMaterial
                {...getMaterialProps('non_monitored', '#111315')}
                roughness={0.95}
                metalness={0.03}
              />
            </mesh>
          ))}
        </group>

        {/* Rim outer barrel (Cylinder coaxial with Z-axle) */}
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          userData={{ group: 'non_monitored', name: 'Front 17-inch Alloy Rim' }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver('non_monitored', 'Front 17" Alloy Rim'); }}
          onPointerOut={onPointerOut}
          onClick={(e) => { e.stopPropagation(); onClick('non_monitored'); }}
        >
          <cylinderGeometry args={[FRONT_RIM_RADIUS, FRONT_RIM_RADIUS, FRONT_RIM_WIDTH, 48, 1, true]} />
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#1e2430', true)}
            roughness={0.3}
            metalness={0.88}
          />
        </mesh>

        {/* Machined outer rim flanges / retaining lips (Left & Right) */}
        {[-FRONT_RIM_WIDTH / 2, FRONT_RIM_WIDTH / 2].map((z, idx) => (
          <mesh key={idx} position={[0, 0, z]} rotation={[0, 0, 0]}>
            <torusGeometry args={[FRONT_RIM_RADIUS, 0.005, 16, 48]} />
            <meshStandardMaterial
              {...getMaterialProps('non_monitored', '#94a3b8', true)}
              roughness={0.2}
              metalness={0.95}
            />
          </mesh>
        ))}

        {/* Drop-centre inner rim well barrel */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[FRONT_RIM_RADIUS - 0.018, FRONT_RIM_RADIUS - 0.018, FRONT_RIM_WIDTH * 0.72, 36, 1, true]} />
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#0f172a', true)}
            roughness={0.4}
            metalness={0.85}
          />
        </mesh>

        {/* 10-Spoke Directional Alloy Pattern (Radiating in vertical XY plane) */}
        {spokeAngles.map((angle, idx) => {
          const spokeLen = FRONT_RIM_RADIUS - 0.055;
          const rMid = 0.048 + spokeLen / 2;
          return (
            <mesh
              key={idx}
              position={[Math.cos(angle) * rMid, Math.sin(angle) * rMid, 0]}
              rotation={[0, 0, angle - Math.PI / 2]}
              userData={{ group: 'non_monitored', name: 'Front Rim Spoke' }}
            >
              <cylinderGeometry args={[0.006, 0.011, spokeLen, 12]} />
              <meshStandardMaterial
                {...getMaterialProps('non_monitored', '#2a2f38', true)}
                roughness={0.28}
                metalness={0.9}
              />
            </mesh>
          );
        })}

        {/* ========================================================
            DIAGNOSTIC COMPONENT: WHEEL BEARINGS & FRONT HUB
            ======================================================== */}
        <group
          userData={{ group: 'wheel_bearing', name: 'Front Wheel Bearings & Sealed Hub' }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver('wheel_bearing', 'Front Wheel Bearings & Sealed Hub'); }}
          onPointerOut={onPointerOut}
          onClick={(e) => { e.stopPropagation(); onClick('wheel_bearing'); }}
        >
          {/* Central hub housing (coaxial with Z-axle) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.12, 28]} />
            <meshStandardMaterial
              {...getMaterialProps('wheel_bearing', '#3b4252', true)}
              roughness={0.25}
              metalness={0.92}
            />
          </mesh>

          {/* Precision bearing race rings (Left and Right, vertical in XY plane) */}
          {[-0.052, 0.052].map((z, idx) => (
            <group key={idx} position={[0, 0, z]}>
              <mesh rotation={[0, 0, 0]}>
                <ringGeometry args={[0.022, 0.044, 28]} />
                <meshStandardMaterial
                  {...getMaterialProps('wheel_bearing', '#94a3b8', true)}
                  roughness={0.2}
                  metalness={0.95}
                  side={THREE.DoubleSide}
                />
              </mesh>
              {/* Rubber dust seal */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.042, 0.042, 0.005, 24, 1, true]} />
                <meshStandardMaterial color="#0284c7" roughness={0.7} metalness={0.1} />
              </mesh>
            </group>
          ))}

          {/* Front Axle Through-Bolt */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.010, 0.010, FORK_SPACING + 0.04, 16]} />
            <meshStandardMaterial
              {...getMaterialProps('wheel_bearing', '#cbd5e1', true)}
              roughness={0.15}
              metalness={0.95}
            />
          </mesh>

          {/* Axle Nut (right side) */}
          <mesh position={[0, 0, FORK_SPACING / 2 + 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.018, 6]} />
            <meshStandardMaterial
              {...getMaterialProps('wheel_bearing', '#94a3b8', true)}
              roughness={0.25}
              metalness={0.9}
            />
          </mesh>
        </group>

        {/* Front Brake Rotor (282 mm drilled disc on right side +Z, vertical in XY plane) */}
        <group position={[0, 0, 0.046]}>
          <mesh
            rotation={[0, 0, 0]}
            userData={{ group: 'non_monitored', name: 'Front Ventilated Brake Disc (282mm)' }}
            onPointerOver={(e) => { e.stopPropagation(); onPointerOver('non_monitored', 'Front Brake Disc'); }}
            onPointerOut={onPointerOut}
            onClick={(e) => { e.stopPropagation(); onClick('non_monitored'); }}
          >
            <ringGeometry args={[0.075, FRONT_DISC_RADIUS, 36]} />
            <meshStandardMaterial
              {...getMaterialProps('non_monitored', '#cbd5e1', true)}
              roughness={0.25}
              metalness={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Inner carrier spider (5-arm floating mount) */}
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[0.046, 0.076, 5]} />
            <meshStandardMaterial
              {...getMaterialProps('non_monitored', '#1e293b', true)}
              roughness={0.35}
              metalness={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* Front Caliper (mounted to lower fork slider bracket) */}
        <mesh
          position={[-0.09, 0.08, 0.046]}
          userData={{ group: 'non_monitored', name: 'ByBre Dual-Piston Front Caliper' }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver('non_monitored', 'Front Brake Caliper'); }}
          onPointerOut={onPointerOut}
          onClick={(e) => { e.stopPropagation(); onClick('non_monitored'); }}
        >
          <boxGeometry args={[0.075, 0.08, 0.040]} />
          <meshStandardMaterial
            {...getMaterialProps('non_monitored', '#0f172a', true)}
            roughness={0.35}
            metalness={0.85}
          />
        </mesh>
      </group>

      {/* ========================================================
          FRONT ROADSTER FENDER (Arches directly over front tyre)
          ======================================================== */}
      <group position={[FRONT_AXLE_X, FRONT_AXLE_Y, 0]}>
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          userData={{ group: 'non_monitored', name: 'Front Roadster Fender' }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver('non_monitored', 'Front Fender'); }}
          onPointerOut={onPointerOut}
          onClick={(e) => { e.stopPropagation(); onClick('non_monitored'); }}
        >
          <cylinderGeometry
            args={[
              FRONT_TYRE_RADIUS + 0.020,
              FRONT_TYRE_RADIUS + 0.020,
              FRONT_TYRE_WIDTH + 0.02,
              32,
              1,
              true,
              0.35,
              2.3,
            ]}
          />
          <meshPhysicalMaterial
            color={paintColor}
            roughness={0.24}
            metalness={0.7}
            clearcoat={0.95}
            clearcoatRoughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Metal mounting stays connecting fender to fork sliders */}
        {[-FORK_SPACING / 2 + 0.015, FORK_SPACING / 2 - 0.015].map((z, idx) => (
          <mesh key={idx} position={[-0.04, 0.22, z]} rotation={[0, 0, FORK_RAKE]}>
            <boxGeometry args={[0.012, 0.14, 0.008]} />
            <meshStandardMaterial
              {...getMaterialProps('non_monitored', '#475569', true)}
              roughness={0.3}
              metalness={0.9}
            />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          TELESCOPIC FRONT FORK ASSEMBLY (Rake 26 degrees)
          From front axle up to upper triple clamp
          ======================================================== */}
      {/* Rotated group around the front axle axis */}
      <group position={[FRONT_AXLE_X, FRONT_AXLE_Y, 0]}>
        <group rotation={[0, 0, FORK_RAKE]}>
          {/* Pair of lower sliders (cast aluminum) */}
          {[-FORK_SPACING / 2, FORK_SPACING / 2].map((z, idx) => (
            <group key={idx} position={[0, 0, z]}>
              {/* Lower slider cylinder */}
              <mesh
                position={[0, 0.17, 0]}
                userData={{ group: 'non_monitored', name: 'Fork Lower Slider' }}
              >
                <cylinderGeometry args={[0.026, 0.024, 0.34, 20]} />
                <meshStandardMaterial
                  {...getMaterialProps('non_monitored', '#1e232d', true)}
                  roughness={0.35}
                  metalness={0.85}
                />
              </mesh>

              {/* Bottom axle lug clamping the axle */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.052, 0.05, 0.045]} />
                <meshStandardMaterial
                  {...getMaterialProps('non_monitored', '#1e232d', true)}
                  roughness={0.35}
                  metalness={0.85}
                />
              </mesh>

              {/* Retro Rubber Gaiters (bellows over stanchion) */}
              <mesh
                position={[0, 0.38, 0]}
                userData={{ group: 'non_monitored', name: 'Retro Rubber Fork Gaiter' }}
              >
                <cylinderGeometry args={[GAITER_RADIUS, GAITER_RADIUS, 0.16, 16, 8]} />
                <meshStandardMaterial
                  {...getMaterialProps('non_monitored', '#111317')}
                  roughness={0.92}
                  metalness={0.05}
                />
              </mesh>

              {/* Upper Hard-Chrome Stanchion Tubes */}
              <mesh
                position={[0, 0.58, 0]}
                userData={{ group: 'non_monitored', name: 'Hard-Chrome Fork Stanchion (41mm)' }}
              >
                <cylinderGeometry args={[FORK_TUBE_RADIUS, FORK_TUBE_RADIUS, 0.32, 20]} />
                <meshStandardMaterial
                  {...getMaterialProps('non_monitored', '#e2e8f0', true)}
                  roughness={0.12}
                  metalness={0.98}
                />
              </mesh>
            </group>
          ))}

          {/* Lower Triple Clamp (connecting both fork tubes at bottom of head tube) */}
          <group position={[0, 0.69, 0]}>
            <mesh position={[-0.02, 0, 0]}>
              <boxGeometry args={[0.06, 0.028, FORK_SPACING + 0.06]} />
              <meshStandardMaterial
                {...getMaterialProps('non_monitored', '#181b20', true)}
                roughness={0.32}
                metalness={0.9}
              />
            </mesh>
          </group>

          {/* Upper Triple Clamp (top fork yoke) */}
          <group position={[0, 0.86, 0]}>
            <mesh position={[-0.02, 0, 0]}>
              <boxGeometry args={[0.055, 0.024, FORK_SPACING + 0.05]} />
              <meshStandardMaterial
                {...getMaterialProps('non_monitored', '#181b20', true)}
                roughness={0.32}
                metalness={0.9}
              />
            </mesh>

            {/* Handlebar Risers */}
            {[-0.05, 0.05].map((z, idx) => (
              <mesh key={idx} position={[-0.02, 0.035, z]}>
                <cylinderGeometry args={[0.014, 0.016, 0.05, 16]} />
                <meshStandardMaterial
                  {...getMaterialProps('non_monitored', '#334155', true)}
                  roughness={0.3}
                  metalness={0.9}
                />
              </mesh>
            ))}

            {/* Handlebar (Swept Road Tube Ø22mm) */}
            <group position={[-0.02, 0.06, 0]} rotation={[0, 0, -FORK_RAKE]}>
              {/* Center bar section */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.011, 0.011, 0.32, 16]} />
                <meshStandardMaterial
                  {...getMaterialProps('non_monitored', '#0f172a', true)}
                  roughness={0.25}
                  metalness={0.9}
                />
              </mesh>

              {/* Left & Right angled sweeps with grips */}
              {[-1, 1].map((sign, idx) => (
                <group key={idx} position={[-0.02, 0.02, (sign * 0.16)]} rotation={[0, sign * 0.18, 0]}>
                  {/* Outer bar tube */}
                  <mesh position={[0, 0, sign * 0.1]}>
                    <boxGeometry args={[0.022, 0.022, 0.2]} />
                    <meshStandardMaterial
                      {...getMaterialProps('non_monitored', '#0f172a', true)}
                      roughness={0.25}
                      metalness={0.9}
                    />
                  </mesh>

                  {/* Rubber Hand Grips */}
                  <mesh position={[-0.01, 0, sign * 0.14]}>
                    <cylinderGeometry args={[0.017, 0.017, 0.12, 16]} />
                    <meshStandardMaterial
                      {...getMaterialProps('non_monitored', '#18181b')}
                      roughness={0.95}
                      metalness={0.05}
                    />
                  </mesh>

                  {/* Levers (Clutch on left, Brake on right) */}
                  <mesh position={[0.04, -0.01, sign * 0.09]} rotation={[0, 0, -0.15]}>
                    <boxGeometry args={[0.11, 0.008, 0.012]} />
                    <meshStandardMaterial
                      {...getMaterialProps('non_monitored', '#cbd5e1', true)}
                      roughness={0.2}
                      metalness={0.95}
                    />
                  </mesh>

                  {/* Round Bar-End / Stalk Mirrors */}
                  <group position={[-0.04, 0.08, sign * 0.19]}>
                    <mesh rotation={[0, 0, 0.35 * sign]}>
                      <cylinderGeometry args={[0.005, 0.005, 0.11, 12]} />
                      <meshStandardMaterial
                        {...getMaterialProps('non_monitored', '#334155', true)}
                        roughness={0.3}
                        metalness={0.9}
                      />
                    </mesh>
                    <mesh position={[0, 0.06, 0]} rotation={[0, sign * 0.4, 0]}>
                      <cylinderGeometry args={[0.042, 0.042, 0.014, 24]} />
                      <meshStandardMaterial
                        {...getMaterialProps('non_monitored', '#090d16', true)}
                        roughness={0.3}
                        metalness={0.8}
                      />
                    </mesh>
                  </group>
                </group>
              ))}

              {/* Digital Instrument Console (Round Retro Pod) */}
              <group position={[0.04, 0.04, 0]} rotation={[0.4, 0, 0]}>
                <mesh rotation={[Math.PI / 4, 0, 0]}>
                  <cylinderGeometry args={[0.046, 0.042, 0.035, 24]} />
                  <meshStandardMaterial
                    {...getMaterialProps('non_monitored', '#111827', true)}
                    roughness={0.3}
                    metalness={0.85}
                  />
                </mesh>
                {/* LCD Screen Face */}
                <mesh position={[0, 0.018, 0.018]} rotation={[-Math.PI / 4, 0, 0]}>
                  <circleGeometry args={[0.038, 24]} />
                  <meshBasicMaterial color="#06b6d4" />
                </mesh>
              </group>
            </group>
          </group>

          {/* Retro Round LED Headlight (FZ-X Signature Round Ring with Bi-LED lens) */}
          <group position={[0.11, 0.72, 0]} rotation={[0, 0, -FORK_RAKE]}>
            {/* Outer bucket housing */}
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.086, 0.078, 0.09, 32]} />
              <meshStandardMaterial
                {...getMaterialProps('non_monitored', '#0f172a', true)}
                roughness={0.3}
                metalness={0.88}
              />
            </mesh>
            {/* Chrome bezel ring */}
            <mesh position={[0.046, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <ringGeometry args={[0.076, 0.088, 32]} />
              <meshStandardMaterial
                {...getMaterialProps('non_monitored', '#e2e8f0', true)}
                roughness={0.15}
                metalness={0.98}
              />
            </mesh>
            {/* Glass Lens & Emissive DRL Ring */}
            <mesh position={[0.047, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <circleGeometry args={[0.075, 32]} />
              <meshStandardMaterial
                color="#e0f2fe"
                emissive={new THREE.Color('#38bdf8')}
                emissiveIntensity={0.85}
                roughness={0.1}
                metalness={0.1}
                transparent
                opacity={0.88}
              />
            </mesh>
            {/* Center Projector Lens */}
            <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <sphereGeometry args={[0.032, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive={new THREE.Color('#f0f9ff')}
                emissiveIntensity={1.2}
              />
            </mesh>
            {/* Headlight mounting side stays */}
            {[-FORK_SPACING / 2 + 0.015, FORK_SPACING / 2 - 0.015].map((z, idx) => (
              <mesh key={idx} position={[-0.04, 0, z]}>
                <boxGeometry args={[0.08, 0.018, 0.008]} />
                <meshStandardMaterial
                  {...getMaterialProps('non_monitored', '#334155', true)}
                  roughness={0.35}
                  metalness={0.9}
                />
              </mesh>
            ))}

            {/* Front Amber Bullet Turn Indicators */}
            {[-FORK_SPACING / 2 - 0.045, FORK_SPACING / 2 + 0.045].map((z, idx) => (
              <group key={idx} position={[-0.02, -0.04, z]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.016, 0.016, 0.035, 16]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0, (z > 0 ? 0.018 : -0.018)]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.012, 16]} />
                  <meshStandardMaterial
                    color="#f59e0b"
                    emissive={new THREE.Color('#f59e0b')}
                    emissiveIntensity={0.6}
                  />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
};
