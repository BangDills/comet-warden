/**
 * Comet Warden - Canvas Rendering & Camera Pipeline
 * Parallax starfields, procedural celestial objects, screen shake trauma, and layered draw order.
 */

import { PALETTE, TUNING } from './config.js';
import { drawNebula, drawParticleSystem } from './particles.js';
import { drawHUD, drawTitleScreen, drawPauseScreen, drawGameOverScreen, drawVictoryScreen } from './hud.js';

/**
 * Creates 3 parallax layers of twinkling stars.
 */
export function createStarfield(rng, count = 220, width = TUNING.viewWidth, height = TUNING.viewHeight) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const layer = rng.int(1, 3); // 1 = distant dim, 2 = mid, 3 = near bright
    const baseSize = layer === 1 ? 1 : layer === 2 ? 1.6 : 2.4;
    stars.push({
      x: rng.range(0, width),
      y: rng.range(0, height),
      layer,
      size: baseSize,
      color: layer === 3 && rng.boolean(0.3) ? PALETTE.starMint : PALETTE.starWarm,
      twinkleSpeed: rng.range(1.5, 4.5),
      twinklePhase: rng.angle(),
      speed: layer * 4,
    });
  }
  return stars;
}

export function drawStarfield(ctx, stars, time = 0) {
  ctx.save();
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinklePhase);
    const alpha = (s.layer === 1 ? 0.35 : s.layer === 2 ? 0.65 : 0.95) * twinkle;

    ctx.fillStyle = s.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * (0.8 + 0.3 * twinkle), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Creates the camera controller with nonlinear trauma shake.
 */
export function createCamera() {
  return {
    trauma: 0,
    offsetX: 0,
    offsetY: 0,
    time: 0,
  };
}

export function addCameraTrauma(camera, amount) {
  camera.trauma = Math.min(1.0, camera.trauma + amount);
}

export function updateCamera(camera, dt) {
  camera.time += dt;
  if (camera.trauma > 0) {
    camera.trauma = Math.max(0, camera.trauma - TUNING.cameraTraumaDecay * dt);
    const shake = camera.trauma * camera.trauma * TUNING.maxScreenShakeOffset;
    camera.offsetX = (Math.sin(camera.time * 48) + Math.cos(camera.time * 62)) * 0.5 * shake;
    camera.offsetY = (Math.cos(camera.time * 52) + Math.sin(camera.time * 71)) * 0.5 * shake;
  } else {
    camera.offsetX = 0;
    camera.offsetY = 0;
  }
}

/**
 * Draws the celestial comet Ember with its fading mint trail.
 */
export function drawComet(ctx, comet, time = 0) {
  ctx.save();

  // 1. Draw glowing mint trail
  if (comet.trail && comet.trail.length > 1) {
    const trail = comet.trail;
    const len = trail.length;

    for (let i = 1; i < len; i++) {
      const p1 = trail[i - 1];
      const p2 = trail[i];
      const frac = i / len;
      const alpha = frac * frac * 0.85;
      const width = 1.5 + frac * 8.5;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = PALETTE.cometMint;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  // 2. Outer corona glow
  const coronaRadius = comet.radius * 3.2;
  const coronaGrad = ctx.createRadialGradient(comet.x, comet.y, comet.radius * 0.4, comet.x, comet.y, coronaRadius);
  coronaGrad.addColorStop(0, PALETTE.cometHalo);
  coronaGrad.addColorStop(1, PALETTE.cometGlowOuter);

  ctx.globalAlpha = 1.0;
  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.arc(comet.x, comet.y, coronaRadius, 0, Math.PI * 2);
  ctx.fill();

  // 3. Invulnerability shield ring
  if (comet.invulnerableTimer > 0) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 16);
    ctx.beginPath();
    ctx.arc(comet.x, comet.y, comet.radius + 7 + pulse * 4, 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.cometMint;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.4 + 0.5 * pulse;
    ctx.stroke();
  }

  // 4. Comet central nucleus
  ctx.beginPath();
  ctx.arc(comet.x, comet.y, comet.radius, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.cometMint;
  ctx.globalAlpha = 0.95;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(comet.x, comet.y, comet.radius * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.cometCore;
  ctx.globalAlpha = 1.0;
  ctx.fill();

  ctx.restore();
}

/**
 * Draws a gravitational well with pulsing concentric horizon rings.
 */
export function drawWell(ctx, well, time = 0) {
  ctx.save();
  const lifeRatio = Math.max(0, well.life / well.maxLife);
  const fadeAlpha = Math.min(1, lifeRatio * 1.8);

  // 1. Pull horizon boundary
  ctx.beginPath();
  ctx.arc(well.x, well.y, well.pullRadius, 0, Math.PI * 2);
  ctx.strokeStyle = PALETTE.wellWave;
  ctx.globalAlpha = 0.35 * fadeAlpha;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Inward contracting gravity wave rings
  const ringCount = 3;
  for (let r = 0; r < ringCount; r++) {
    const wavePhase = (well.pulseTimer * 0.45 + r / ringCount) % 1;
    const waveRadius = well.pullRadius * (1 - wavePhase);
    ctx.beginPath();
    ctx.arc(well.x, well.y, waveRadius, 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.wellDistort;
    ctx.globalAlpha = (1 - wavePhase) * 0.55 * fadeAlpha;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // 3. Inner glowing mass core
  const coreR = well.visualRadius * (0.85 + 0.15 * Math.sin(well.pulseTimer * 2));
  const coreGrad = ctx.createRadialGradient(well.x, well.y, 2, well.x, well.y, coreR);
  coreGrad.addColorStop(0, PALETTE.wellCore);
  coreGrad.addColorStop(0.3, PALETTE.wellAmberLight);
  coreGrad.addColorStop(0.7, PALETTE.wellAmber);
  coreGrad.addColorStop(1, 'rgba(255, 179, 92, 0)');

  ctx.fillStyle = coreGrad;
  ctx.globalAlpha = 0.9 * fadeAlpha;
  ctx.beginPath();
  ctx.arc(well.x, well.y, coreR, 0, Math.PI * 2);
  ctx.fill();

  // Core solid pip
  ctx.beginPath();
  ctx.arc(well.x, well.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.wellCore;
  ctx.globalAlpha = 1.0 * fadeAlpha;
  ctx.fill();

  ctx.restore();
}

/**
 * Draws an ancient star gate with rotating concentric glyph rings and portal energy.
 */
export function drawGateRing(ctx, gate, time = 0) {
  ctx.save();
  ctx.translate(gate.x, gate.y);

  const isHigh = gate.isHighlighted;
  const isPassed = gate.isPassed;
  const pulse = Math.sin(gate.pulsePhase);

  // 1. Central portal glow
  const portalR = gate.radius * (isHigh ? 1.05 + 0.08 * pulse : 0.85);
  const portalGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, portalR);

  if (isPassed) {
    portalGrad.addColorStop(0, 'rgba(255, 143, 184, 0.4)');
    portalGrad.addColorStop(1, 'rgba(255, 95, 162, 0)');
  } else if (isHigh) {
    portalGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    portalGrad.addColorStop(0.35, PALETTE.gateInnerPulse);
    portalGrad.addColorStop(1, 'rgba(255, 95, 162, 0)');
  } else {
    portalGrad.addColorStop(0, 'rgba(110, 70, 95, 0.25)');
    portalGrad.addColorStop(1, 'rgba(110, 70, 95, 0)');
  }

  ctx.fillStyle = portalGrad;
  ctx.beginPath();
  ctx.arc(0, 0, portalR, 0, Math.PI * 2);
  ctx.fill();

  // 2. Outer celestial ring with nodes
  ctx.rotate(gate.ringAngle);
  ctx.beginPath();
  ctx.arc(0, 0, gate.radius, 0, Math.PI * 2);
  ctx.strokeStyle = isPassed ? PALETTE.gateMagentaLight : isHigh ? PALETTE.gateMagenta : PALETTE.gateInactive;
  ctx.lineWidth = isHigh ? 3 : 2;
  ctx.stroke();

  // Orbiting glyph nodes
  const nodeCount = 6;
  for (let n = 0; n < nodeCount; n++) {
    const angle = (n / nodeCount) * Math.PI * 2;
    const nx = Math.cos(angle) * gate.radius;
    const ny = Math.sin(angle) * gate.radius;

    ctx.beginPath();
    ctx.arc(nx, ny, isHigh ? 4 : 2.5, 0, Math.PI * 2);
    ctx.fillStyle = isHigh ? PALETTE.gateWhite : PALETTE.gateMagentaLight;
    ctx.fill();
  }

  // 3. Counter-rotating inner ring
  ctx.rotate(-gate.ringAngle * 2.2);
  ctx.beginPath();
  ctx.arc(0, 0, gate.radius * 0.65, 0, Math.PI * 2);
  ctx.strokeStyle = isHigh ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 95, 162, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Gate flash effect
  if (gate.flashTimer > 0) {
    const flashRatio = gate.flashTimer / 0.55;
    ctx.beginPath();
    ctx.arc(0, 0, gate.radius * (1 + (1 - flashRatio) * 1.5), 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.gateWhite;
    ctx.lineWidth = 4 * flashRatio;
    ctx.globalAlpha = flashRatio;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws a faceted slate asteroid with directional rim illumination.
 */
export function drawAsteroid(ctx, ast) {
  ctx.save();
  ctx.translate(ast.x, ast.y);
  ctx.rotate(ast.rotation);

  // 1. Shaded body polygon
  ctx.beginPath();
  const poly = ast.polygon;
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) {
    ctx.lineTo(poly[i].x, poly[i].y);
  }
  ctx.closePath();

  ctx.fillStyle = PALETTE.asteroidBody;
  ctx.fill();

  // 2. Dark facet shading
  ctx.strokeStyle = PALETTE.asteroidDark;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Craters
  if (ast.craters) {
    for (let c = 0; c < ast.craters.length; c++) {
      const cr = ast.craters[c];
      ctx.beginPath();
      ctx.arc(cr.cx, cr.cy, cr.cr, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.asteroidShadow;
      ctx.fill();
      ctx.strokeStyle = PALETTE.asteroidDark;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // 4. Directional rim light along upper-left silhouette
  ctx.beginPath();
  const halfLen = Math.floor(poly.length * 0.5);
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i <= halfLen; i++) {
    ctx.lineTo(poly[i].x, poly[i].y);
  }
  ctx.strokeStyle = PALETTE.asteroidRimLight;
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a floating stardust mote with spinning 4-point star sparkle.
 */
export function drawStardust(ctx, mote, time = 0) {
  ctx.save();
  ctx.translate(mote.x, mote.y);

  // Soft halo
  const haloGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, mote.radius * 2.8);
  haloGrad.addColorStop(0, PALETTE.stardustHalo);
  haloGrad.addColorStop(1, 'rgba(255, 232, 117, 0)');

  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(0, 0, mote.radius * 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Spinning 4-point diamond sparkle
  ctx.rotate(mote.twinklePhase);
  const rOuter = mote.radius * 1.6;
  const rInner = mote.radius * 0.45;

  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? rOuter : rInner;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = PALETTE.stardustAmber;
  ctx.fill();

  // Core pip
  ctx.beginPath();
  ctx.arc(0, 0, mote.radius * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.stardustCore;
  ctx.fill();

  ctx.restore();
}

/**
 * Master rendering coordinator.
 */
export function renderScene(ctx, state, time, camera, stars, nebulaClouds) {
  const width = TUNING.viewWidth;
  const height = TUNING.viewHeight;

  // 1. Base space fill
  ctx.fillStyle = PALETTE.space;
  ctx.fillRect(0, 0, width, height);

  // 2. Camera shake transform
  ctx.save();
  ctx.translate(camera.offsetX, camera.offsetY);

  // 3. Cosmic nebula haze
  if (nebulaClouds) {
    drawNebula(ctx, nebulaClouds, time);
  }

  // 4. Parallax starfield
  if (stars) {
    drawStarfield(ctx, stars, time);
  }

  // 5. Star gates
  if (state.sector && state.sector.gates) {
    const gates = state.sector.gates;
    for (let i = 0; i < gates.length; i++) {
      drawGateRing(ctx, gates[i], time);
    }
  }

  // 6. Stardust motes
  if (state.sector && state.sector.stardust) {
    const motes = state.sector.stardust;
    for (let i = 0; i < motes.length; i++) {
      if (!motes[i].collected) {
        drawStardust(ctx, motes[i], time);
      }
    }
  }

  // 7. Gravity wells
  if (state.wells) {
    for (let i = 0; i < state.wells.length; i++) {
      drawWell(ctx, state.wells[i], time);
    }
  }

  // 8. Comet Ember & Trail
  if (state.comet && state.comet.alive) {
    drawComet(ctx, state.comet, time);
  }

  // 9. Asteroids
  if (state.sector && state.sector.asteroids) {
    const asteroids = state.sector.asteroids;
    for (let i = 0; i < asteroids.length; i++) {
      drawAsteroid(ctx, asteroids[i]);
    }
  }

  // 10. Dynamic particles & shockwaves
  if (state.particleSystem) {
    drawParticleSystem(ctx, state.particleSystem);
  }

  ctx.restore(); // Restore camera shake

  // 11. Overlays based on state machine
  if (state.screen === 'title') {
    drawTitleScreen(ctx, state.bestScore, time);
  } else if (state.screen === 'play') {
    drawHUD(ctx, state);
  } else if (state.screen === 'paused') {
    drawHUD(ctx, state);
    drawPauseScreen(ctx);
  } else if (state.screen === 'game_over') {
    drawHUD(ctx, state);
    drawGameOverScreen(ctx, state, time);
  } else if (state.screen === 'victory') {
    drawHUD(ctx, state);
    drawVictoryScreen(ctx, state, time);
  }
}
