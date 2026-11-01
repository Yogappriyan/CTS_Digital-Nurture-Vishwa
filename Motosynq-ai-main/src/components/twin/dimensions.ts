/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOTOSYNQ AI — Digital Twin Procedural Motorcycle Dimensions
 * Retro-modern 150cc roadster (Yamaha FZ-X class)
 * Coordinate system:
 *   Origin (0,0,0) = Ground plane at the midpoint of the wheelbase.
 *   +X = Forward
 *   +Y = Up
 *   +Z = Left (Motorcycle is mirrored / symmetric about Z = 0)
 * 
 * Tyre contact patches MUST touch the ground at Y = 0.
 */

// Wheelbase and primary stance
export const WHEELBASE = 1.33; // 1330 mm
export const GROUND_CLEARANCE = 0.165; // 165 mm
export const SEAT_HEIGHT = 0.80; // 800 mm
export const HANDLEBAR_HEIGHT = 1.02; // 1020 mm
export const HANDLEBAR_WIDTH = 0.74; // 740 mm

// Front wheel (100/80-17 tubeless)
export const FRONT_TYRE_RADIUS = 0.30; // 600 mm overall diameter -> 300 mm radius
export const FRONT_TYRE_WIDTH = 0.10; // 100 mm width
export const FRONT_RIM_RADIUS = 0.216; // 17 inch rim ~ 432 mm dia -> 216 mm radius
export const FRONT_RIM_WIDTH = 0.07;
export const FRONT_DISC_RADIUS = 0.141; // 282 mm front disc

// Rear wheel (140/70-17 tubeless)
export const REAR_TYRE_RADIUS = 0.32; // 640 mm overall diameter -> 320 mm radius
export const REAR_TYRE_WIDTH = 0.14; // 140 mm width
export const REAR_RIM_RADIUS = 0.216; // 17 inch rim
export const REAR_RIM_WIDTH = 0.095;
export const REAR_DISC_RADIUS = 0.11; // 220 mm rear disc

// Axle positions in world coordinates
// Front wheel contact patch is at (WHEELBASE/2, 0, 0)
export const FRONT_AXLE_X = WHEELBASE / 2; // +0.665 m
export const FRONT_AXLE_Y = FRONT_TYRE_RADIUS; // +0.300 m
export const FRONT_AXLE_Z = 0.0;

// Rear wheel contact patch is at (-WHEELBASE/2, 0, 0)
export const REAR_AXLE_X = -WHEELBASE / 2; // -0.665 m
export const REAR_AXLE_Y = REAR_TYRE_RADIUS; // +0.320 m
export const REAR_AXLE_Z = 0.0;

// Fork geometry (Telescopic 41mm forks with retro rubber gaiters)
export const FORK_RAKE_DEG = 26; // 26 degrees from vertical
export const FORK_RAKE = FORK_RAKE_DEG * (Math.PI / 180); // 0.453786 radians
export const FORK_SPACING = 0.18; // 180 mm centre-to-centre between stanchions
export const FORK_TUBE_RADIUS = 0.0205; // 41 mm diameter fork tubes
export const GAITER_RADIUS = 0.028;

// Steering head tube & Triple Clamps
export const HEAD_TUBE_Y = 0.92;
// Head tube X derived so fork line through front axle at 26° intersects head tube:
export const HEAD_TUBE_X = FRONT_AXLE_X - (HEAD_TUBE_Y - FRONT_AXLE_Y) * Math.tan(FORK_RAKE); // ~ 0.3626 m
export const HEAD_TUBE_LENGTH = 0.18;
export const TRIPLE_CLAMP_OFFSET = 0.035; // 35 mm fork offset

// Swingarm & Rear Suspension
export const SWINGARM_PIVOT_X = -0.16;
export const SWINGARM_PIVOT_Y = 0.34;
export const SWINGARM_PIVOT_Z = 0.0;
export const MONOSHOCK_TOP_X = -0.11;
export const MONOSHOCK_TOP_Y = 0.62;

// Drivetrain & Sprockets (mounted on rider's left: -Z)
export const SPROCKET_Z = -0.072;
export const FRONT_SPROCKET_X = -0.13;
export const FRONT_SPROCKET_Y = 0.35;
export const FRONT_SPROCKET_TEETH = 14;
export const FRONT_SPROCKET_RADIUS = 0.038;

export const REAR_SPROCKET_X = REAR_AXLE_X; // -0.665 m
export const REAR_SPROCKET_Y = REAR_AXLE_Y; // +0.320 m
export const REAR_SPROCKET_TEETH = 41;
export const REAR_SPROCKET_RADIUS = 0.108;

// Engine Envelope (149 cc Air-cooled SOHC 2-valve single cylinder)
export const CRANKCASE_CENTER_X = 0.04;
export const CRANKCASE_CENTER_Y = 0.33;
export const CRANKCASE_WIDTH = 0.28; // Z span
export const CYLINDER_INCLINE_DEG = 15; // 15 deg forward slant
export const CYLINDER_INCLINE = CYLINDER_INCLINE_DEG * (Math.PI / 180);
export const CYLINDER_BASE_Y = 0.40;
export const CYLINDER_HEAD_Y = 0.58;

// Exhaust & Muffler (swept on rider's right: +Z)
export const EXHAUST_HEADER_START_X = 0.17;
export const EXHAUST_HEADER_START_Y = 0.53;
export const EXHAUST_PIPE_RADIUS = 0.019;
export const MUFFLER_Z = 0.175;
export const MUFFLER_START_X = -0.12;
export const MUFFLER_START_Y = 0.28;
export const MUFFLER_END_X = -0.62;
export const MUFFLER_END_Y = 0.44;
export const MUFFLER_RADIUS = 0.055;

// Fuel Tank & Ergonomics
export const TANK_CENTER_X = 0.14;
export const TANK_CENTER_Y = 0.81;
export const TANK_LENGTH = 0.46;
export const TANK_WIDTH = 0.33;
export const TANK_HEIGHT = 0.22;

// Seat
export const SEAT_FRONT_X = -0.08;
export const SEAT_REAR_X = -0.58;
export const SEAT_WIDTH = 0.24;

// Default colorway tints
export const COLORWAY_PRESETS = {
  cyan: {
    name: 'Metallic Cyan / Matte Black',
    tankColor: '#0ea5e9',
    tankAccent: '#1e293b',
    roughness: 0.25,
    metalness: 0.65,
    clearcoat: 0.9,
  },
  blue: {
    name: 'FZ-X Racing Blue Metallic',
    tankColor: '#1e5bb8',
    tankAccent: '#0f172a',
    roughness: 0.22,
    metalness: 0.7,
    clearcoat: 0.95,
  },
  copper: {
    name: 'Copper Matte Metallic',
    tankColor: '#b45309',
    tankAccent: '#27272a',
    roughness: 0.38,
    metalness: 0.55,
    clearcoat: 0.6,
  },
  titan: {
    name: 'Dark Titan Matte',
    tankColor: '#334155',
    tankAccent: '#090d16',
    roughness: 0.45,
    metalness: 0.4,
    clearcoat: 0.4,
  },
} as const;
