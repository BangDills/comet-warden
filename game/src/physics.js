/**
 * Comet Warden - Physics Engine
 * Gravitational pull computation, numerical integration, trail interpolation, and collision queries.
 */

import { TUNING } from './config.js';

/**
 * Computes the gravitational acceleration exerted by a single well onto a test position.
 */
export function pullAt(pos, well) {
  const dx = well.x - pos.x;
  const dy = well.y - pos.y;
  const distSq = dx * dx + dy * dy;
  const pullRadius = well.pullRadius || TUNING.wellPullRadius;

  if (distSq > pullRadius * pullRadius || distSq < 0.001) {
    return { fx: 0, fy: 0, dist: Math.sqrt(distSq) };
  }

  const dist = Math.sqrt(distSq);
  const nx = dx / dist;
  const ny = dy / dist;

  // Smooth quadratic falloff towards zero at boundary of pull radius
  const normalizedDist = dist / pullRadius;
  const smoothFalloff = (1 - normalizedDist) * (1 - normalizedDist);

  // Softened Newtonian gravity preventing infinite acceleration singularities
  const acceleration = (well.mass / (distSq + TUNING.gravitySofteningSq)) * smoothFalloff;

  return {
    fx: nx * acceleration,
    fy: ny * acceleration,
    dist,
  };
}

/**
 * Performs fixed-step numerical integration for the comet under gravity wells and optional thrust.
 */
export function integrateComet(comet, wells, dt, thrustVector = null) {
  let totalFx = 0;
  let totalFy = 0;

  // Sum pulls from all active wells
  for (let i = 0; i < wells.length; i++) {
    const well = wells[i];
    if (well.active && well.life > 0) {
      const pull = pullAt(comet, well);
      totalFx += pull.fx;
      totalFy += pull.fy;
    }
  }

  // Add micro-thrust if active
  if (thrustVector && thrustVector.active) {
    totalFx += thrustVector.x * TUNING.thrustPower;
    totalFy += thrustVector.y * TUNING.thrustPower;
  }

  // Update velocities
  comet.vx += totalFx * dt;
  comet.vy += totalFy * dt;

  // Apply cosmic drag
  const dragFactor = Math.pow(TUNING.cometDrag, dt * 60);
  comet.vx *= dragFactor;
  comet.vy *= dragFactor;

  // Clamp velocity within comfortable drift envelope
  let speed = Math.hypot(comet.vx, comet.vy);
  if (speed > TUNING.cometMaxSpeed) {
    const ratio = TUNING.cometMaxSpeed / speed;
    comet.vx *= ratio;
    comet.vy *= ratio;
    speed = TUNING.cometMaxSpeed;
  } else if (speed < TUNING.cometMinSpeed && speed > 0.001) {
    const ratio = TUNING.cometMinSpeed / speed;
    comet.vx *= ratio;
    comet.vy *= ratio;
    speed = TUNING.cometMinSpeed;
  }

  // Integrate position
  comet.x += comet.vx * dt;
  comet.y += comet.vy * dt;

  // Soft boundary deflection to keep Ember safely inside the drift horizon
  const pad = 28;
  const restitution = 0.82;
  let bounced = false;

  if (comet.x < pad) {
    comet.x = pad;
    comet.vx = Math.abs(comet.vx) * restitution;
    bounced = true;
  } else if (comet.x > TUNING.viewWidth - pad) {
    comet.x = TUNING.viewWidth - pad;
    comet.vx = -Math.abs(comet.vx) * restitution;
    bounced = true;
  }

  if (comet.y < pad) {
    comet.y = pad;
    comet.vy = Math.abs(comet.vy) * restitution;
    bounced = true;
  } else if (comet.y > TUNING.viewHeight - pad) {
    comet.y = TUNING.viewHeight - pad;
    comet.vy = -Math.abs(comet.vy) * restitution;
    bounced = true;
  }

  return { bounced, speed };
}

/**
 * Samples recent comet positions into a fading curved trail history.
 */
export function updateTrail(comet, dt) {
  if (!comet.trail) {
    comet.trail = [];
  }

  const trail = comet.trail;
  comet.trailTimer = (comet.trailTimer || 0) + dt;

  const lastPoint = trail[trail.length - 1];
  const distSinceLast = lastPoint ? Math.hypot(comet.x - lastPoint.x, comet.y - lastPoint.y) : 999;

  if (distSinceLast > 5 || comet.trailTimer >= TUNING.cometTrailSampleRate) {
    trail.push({
      x: comet.x,
      y: comet.y,
      vx: comet.vx,
      vy: comet.vy,
      age: 0,
    });
    comet.trailTimer = 0;
  }

  // Age points and remove dead segments
  for (let i = 0; i < trail.length; i++) {
    trail[i].age += dt;
  }

  while (trail.length > TUNING.cometTrailMaxLength) {
    trail.shift();
  }
}

/**
 * Circle-circle collision query.
 */
export function circlesOverlap(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const radiiSum = r1 + r2;
  return dx * dx + dy * dy <= radiiSum * radiiSum;
}

/**
 * Applies repulsor pulse pushing asteroids away and accelerating the comet safely away.
 */
export function applyRepulsorPulse(comet, asteroids) {
  const affected = [];
  let nearestAsteroid = null;
  let nearestDist = Infinity;

  for (let i = 0; i < asteroids.length; i++) {
    const ast = asteroids[i];
    const dx = ast.x - comet.x;
    const dy = ast.y - comet.y;
    const dist = Math.hypot(dx, dy);

    if (dist < nearestDist) {
      nearestDist = dist;
      nearestAsteroid = ast;
    }

    if (dist < TUNING.repulsorRadius && dist > 0.001) {
      const nx = dx / dist;
      const ny = dy / dist;
      const forceRatio = 1 - dist / TUNING.repulsorRadius;
      ast.vx += nx * TUNING.repulsorForce * forceRatio;
      ast.vy += ny * TUNING.repulsorForce * forceRatio;
      affected.push(ast);
    }
  }

  // Counter-kick comet away from nearest asteroid
  if (nearestAsteroid && nearestDist < TUNING.repulsorRadius * 1.2 && nearestDist > 0.001) {
    const awayX = (comet.x - nearestAsteroid.x) / nearestDist;
    const awayY = (comet.y - nearestAsteroid.y) / nearestDist;
    comet.vx += awayX * 180;
    comet.vy += awayY * 180;
  }

  return { affectedCount: affected.length, nearestDist };
}
