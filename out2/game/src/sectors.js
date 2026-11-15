/**
 * Comet Warden - Sector Progression & Level Generation
 * Constructs procedural gate layouts, asteroid drift belts, and stardust clusters from seed.
 */

import { SECTOR_CONFIGS, TUNING } from './config.js';
import { createGate, createAsteroid, createStardust } from './entities.js';

export function getSectorConfig(sectorNumber) {
  const clamped = Math.max(1, Math.min(SECTOR_CONFIGS.length, sectorNumber));
  return SECTOR_CONFIGS[clamped - 1];
}

/**
 * Builds a deterministic sector layout given the sector number and seeded RNG.
 */
export function generateSector(sectorNumber, rng) {
  const config = getSectorConfig(sectorNumber);
  const gatesRequired = config.gatesRequired;
  const gates = [];

  const marginX = 140;
  const marginY = 120;
  const minGateDist = 210;

  // Generate well-distributed star gate positions
  for (let i = 0; i < gatesRequired; i++) {
    let attempts = 0;
    let gx = 0;
    let gy = 0;
    let valid = false;

    while (attempts < 60 && !valid) {
      attempts++;
      gx = rng.range(marginX, TUNING.viewWidth - marginX);
      gy = rng.range(marginY, TUNING.viewHeight - marginY);

      valid = true;
      for (let j = 0; j < gates.length; j++) {
        const d = Math.hypot(gx - gates[j].x, gy - gates[j].y);
        if (d < minGateDist) {
          valid = false;
          break;
        }
      }
    }

    // Fallback if random placement clustered
    if (!valid) {
      const angle = (i / gatesRequired) * Math.PI * 2;
      gx = 640 + Math.cos(angle) * 380;
      gy = 360 + Math.sin(angle) * 200;
    }

    const gate = createGate(`gate-${sectorNumber}-${i}`, gx, gy, i);
    gates.push(gate);
  }

  // Highlight initial gate
  if (gates.length > 0) {
    gates[0].isHighlighted = true;
  }

  // Generate drifting slate asteroids
  const asteroids = [];
  const asteroidCount = config.asteroidCount;
  const speedMult = config.asteroidSpeedMult;

  for (let i = 0; i < asteroidCount; i++) {
    const radius = rng.range(TUNING.asteroidMinRadius, TUNING.asteroidMaxRadius);
    let ax = 0;
    let ay = 0;
    let safeFromGates = false;
    let attempts = 0;

    while (attempts < 40 && !safeFromGates) {
      attempts++;
      ax = rng.range(60, TUNING.viewWidth - 60);
      ay = rng.range(60, TUNING.viewHeight - 60);

      safeFromGates = true;
      for (let g = 0; g < gates.length; g++) {
        if (Math.hypot(ax - gates[g].x, ay - gates[g].y) < gates[g].radius + radius + 70) {
          safeFromGates = false;
          break;
        }
      }
    }

    const speed = rng.range(TUNING.asteroidMinSpeed, TUNING.asteroidMaxSpeed) * speedMult;
    const moveAngle = rng.angle();
    const vx = Math.cos(moveAngle) * speed;
    const vy = Math.sin(moveAngle) * speed;

    asteroids.push(createAsteroid(ax, ay, vx, vy, radius, rng));
  }

  // Generate stardust motes along cosmic lanes
  const stardust = [];
  const moteCount = TUNING.stardustCountPerSector;

  for (let i = 0; i < moteCount; i++) {
    // Cluster stardust between gates or in open drift space
    let mx, my;
    if (gates.length >= 2 && rng.boolean(0.65)) {
      const g1 = rng.choice(gates);
      const g2 = rng.choice(gates);
      const t = rng.range(0.2, 0.8);
      mx = g1.x + (g2.x - g1.x) * t + rng.range(-45, 45);
      my = g1.y + (g2.y - g1.y) * t + rng.range(-45, 45);
    } else {
      mx = rng.range(100, TUNING.viewWidth - 100);
      my = rng.range(90, TUNING.viewHeight - 90);
    }
    stardust.push(createStardust(mx, my, rng));
  }

  return {
    number: sectorNumber,
    name: config.name,
    gatesRequired,
    gates,
    targetGateIndex: 0,
    gatesPassedCount: 0,
    asteroids,
    stardust,
    isComplete: false,
  };
}

/**
 * Seals the current sector upon reaching required gate count.
 */
export function sealSector(sectorState) {
  sectorState.isComplete = true;
  const isFinal = sectorState.number >= TUNING.totalSectors;
  const bonus = 1000 * sectorState.number;

  return {
    won: isFinal,
    bonusScore: bonus,
    nextSectorNumber: sectorState.number + 1,
  };
}
