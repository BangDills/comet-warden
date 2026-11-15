/**
 * Comet Warden - Game Entities
 * Factories and update lifecycles for Comet, Gravity Wells, Asteroids, Star Gates, and Stardust.
 */

import { TUNING } from './config.js';

/**
 * Creates the primary comet entity Ember.
 */
export function createComet(x = 240, y = 360, vx = 160, vy = 0) {
  return {
    x,
    y,
    vx,
    vy,
    radius: TUNING.cometRadius,
    invulnerableTimer: 0,
    trail: [],
    trailTimer: 0,
    alive: true,
  };
}

/**
 * Respawns Ember safely near the specified anchor gate with forward impetus and temporary shielding.
 */
export function respawnComet(comet, anchorGate) {
  if (anchorGate) {
    comet.x = anchorGate.x;
    comet.y = anchorGate.y;
    // Launch towards the center or slightly offset
    const toCenterX = 640 - anchorGate.x;
    const toCenterY = 360 - anchorGate.y;
    const dist = Math.hypot(toCenterX, toCenterY) || 1;
    comet.vx = (toCenterX / dist) * TUNING.cometInitialSpeed;
    comet.vy = (toCenterY / dist) * TUNING.cometInitialSpeed;
  } else {
    comet.x = 220;
    comet.y = 360;
    comet.vx = TUNING.cometInitialSpeed;
    comet.vy = 0;
  }
  comet.invulnerableTimer = TUNING.cometInvulnerableTime;
  comet.trail = [];
  comet.alive = true;
}

/**
 * Instantiates a single gravitational well.
 */
export function createWell(x, y, holdSeconds = 0) {
  const clampedHold = Math.min(Math.max(holdSeconds, TUNING.wellMinHoldSeconds), TUNING.wellMaxHoldSeconds);
  const holdRatio = (clampedHold - TUNING.wellMinHoldSeconds) / (TUNING.wellMaxHoldSeconds - TUNING.wellMinHoldSeconds || 1);
  const mass = TUNING.wellBaseMass + holdRatio * (TUNING.wellMaxMass - TUNING.wellBaseMass);
  const visualRadius = TUNING.wellBaseRadius + holdRatio * 20;

  return {
    x,
    y,
    mass,
    visualRadius,
    pullRadius: TUNING.wellPullRadius,
    life: TUNING.wellDuration,
    maxLife: TUNING.wellDuration,
    holdRatio,
    pulseTimer: 0,
    active: true,
  };
}

/**
 * Attempts to place a gravity well spending one charge from the warden budget.
 */
export function placeWell(wells, x, y, holdSeconds, chargeBudget) {
  if (chargeBudget.charges < 1) {
    return null;
  }
  chargeBudget.charges -= 1;
  const well = createWell(x, y, holdSeconds);
  wells.push(well);
  return well;
}

/**
 * Dissolves all active gravity wells instantly.
 */
export function clearAllWells(wells) {
  const count = wells.length;
  wells.length = 0;
  return count;
}

/**
 * Updates well lifespans and animation pulsing.
 */
export function updateWells(wells, dt) {
  for (let i = wells.length - 1; i >= 0; i--) {
    const well = wells[i];
    well.life -= dt;
    well.pulseTimer += dt * 3.5;
    if (well.life <= 0) {
      wells.splice(i, 1);
    }
  }
}

/**
 * Procedurally generates a realistic faceted slate asteroid.
 */
export function createAsteroid(x, y, vx, vy, radius, rng) {
  const vertexCount = rng.int(9, 13);
  const polygon = [];
  for (let i = 0; i < vertexCount; i++) {
    const angle = (i / vertexCount) * Math.PI * 2;
    const offset = rng.range(0.78, 1.22);
    polygon.push({
      x: Math.cos(angle) * radius * offset,
      y: Math.sin(angle) * radius * offset,
    });
  }

  // Internal crater details
  const craters = [];
  const craterCount = rng.int(1, 3);
  for (let c = 0; c < craterCount; c++) {
    craters.push({
      cx: rng.range(-radius * 0.45, radius * 0.45),
      cy: rng.range(-radius * 0.45, radius * 0.45),
      cr: rng.range(radius * 0.16, radius * 0.32),
    });
  }

  return {
    x,
    y,
    vx,
    vy,
    radius,
    rotation: rng.angle(),
    rotationSpeed: rng.range(-0.4, 0.4),
    polygon,
    craters,
  };
}

/**
 * Updates asteroid positions and wraps smoothly across screen margins.
 */
export function updateAsteroids(asteroids, dt) {
  const margin = 50;
  const width = TUNING.viewWidth;
  const height = TUNING.viewHeight;

  for (let i = 0; i < asteroids.length; i++) {
    const ast = asteroids[i];
    ast.x += ast.vx * dt;
    ast.y += ast.vy * dt;
    ast.rotation += ast.rotationSpeed * dt;

    if (ast.x < -margin) ast.x = width + margin;
    else if (ast.x > width + margin) ast.x = -margin;

    if (ast.y < -margin) ast.y = height + margin;
    else if (ast.y > height + margin) ast.y = -margin;
  }
}

/**
 * Creates a star gate entity.
 */
export function createGate(id, x, y, orderIndex) {
  return {
    id,
    x,
    y,
    orderIndex,
    radius: TUNING.gateRadius,
    isPassed: false,
    isHighlighted: false,
    pulsePhase: 0,
    ringAngle: 0,
    flashTimer: 0,
  };
}

/**
 * Updates gate animations and highlight status.
 */
export function updateGates(gates, currentTargetIndex, dt) {
  for (let i = 0; i < gates.length; i++) {
    const gate = gates[i];
    gate.isHighlighted = gate.orderIndex === currentTargetIndex && !gate.isPassed;
    gate.ringAngle += (gate.isHighlighted ? 2.2 : 0.8) * dt;
    gate.pulsePhase += (gate.isHighlighted ? 4.5 : 1.5) * dt;
    if (gate.flashTimer > 0) {
      gate.flashTimer -= dt;
    }
  }
}

/**
 * Triggers the gate crossing event when Ember passes through the active star gate.
 */
export function passGate(gate) {
  gate.isPassed = true;
  gate.flashTimer = 0.55;
  return {
    scoreBonus: TUNING.gateBaseScore,
  };
}

/**
 * Creates a floating stardust mote.
 */
export function createStardust(x, y, rng) {
  return {
    x,
    y,
    baseX: x,
    baseY: y,
    vx: rng ? rng.range(-6, 6) : 0,
    vy: rng ? rng.range(-6, 6) : 0,
    radius: TUNING.stardustRadius,
    twinklePhase: rng ? rng.angle() : Math.random() * Math.PI * 2,
    bobPhase: rng ? rng.angle() : Math.random() * Math.PI * 2,
    collected: false,
  };
}

/**
 * Updates stardust drift and gentle harmonic oscillation.
 */
export function updateStardust(stardustList, dt) {
  for (let i = stardustList.length - 1; i >= 0; i--) {
    const mote = stardustList[i];
    if (mote.collected) {
      stardustList.splice(i, 1);
      continue;
    }
    mote.twinklePhase += dt * 4.0;
    mote.bobPhase += dt * 2.2;
    mote.x += mote.vx * dt + Math.cos(mote.bobPhase) * 0.35;
    mote.y += mote.vy * dt + Math.sin(mote.bobPhase) * 0.35;
  }
}
