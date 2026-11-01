/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { validateAssembly } from '../validateAssembly';
import {
  WHEELBASE,
  FRONT_AXLE_X,
  FRONT_AXLE_Y,
  FRONT_TYRE_RADIUS,
  REAR_AXLE_X,
  REAR_AXLE_Y,
  REAR_TYRE_RADIUS,
} from '../dimensions';

describe('Motorcycle Digital Twin Assembly Invariants', () => {
  it('passes all kinematic and dimensional assembly checks', () => {
    const report = validateAssembly();
    expect(report.isValid).toBe(true);
    expect(report.tyreGroundErrorMm).toBeLessThanOrEqual(1.0);
    expect(report.wheelbaseErrorMm).toBeLessThanOrEqual(5.0);
    expect(report.totalTriangles).toBeLessThan(150000);
  });

  it('verifies both tyre contact patches sit exactly on ground plane Y = 0 (±1mm)', () => {
    const frontGround = FRONT_AXLE_Y - FRONT_TYRE_RADIUS;
    const rearGround = REAR_AXLE_Y - REAR_TYRE_RADIUS;

    expect(Math.abs(frontGround)).toBeLessThanOrEqual(0.001);
    expect(Math.abs(rearGround)).toBeLessThanOrEqual(0.001);
  });

  it('verifies axle distance matches the 1.33m wheelbase specification (±5mm)', () => {
    const distance = Math.abs(FRONT_AXLE_X - REAR_AXLE_X);
    expect(Math.abs(distance - WHEELBASE)).toBeLessThanOrEqual(0.005);
  });
});
