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
export function createStarfield(rng, count = 240, width = TUNING.viewWidth, height = TUNING.viewHeight) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const layer = rng.int(1, 3); // 1 = distant dim, 2 = mid, 3 = near bright
    const baseSize = layer === 1 ? 1.2 : layer === 2 ? 1.9 : 2.8;
    stars.push({
      x: rng.range(0, width),
      y: rng.range(0, height),
      layer,
      size: baseSize,
      color: layer === 3 && rng.boolean(0.35) ? PALETTE.starMint : PALETTE.starWarm,
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
    const alpha = (s.layer === 1 ? 0.45 : s.layer === 2 ? 0.75 : 0.98) * twinkle;

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
 * Draws the celestial comet Ember with its long, luminous trail and pulse cooldown ring.
 */
export function drawComet(ctx, comet, time = 0, repulsorTimer = 0) {
  ctx.save();

  // 1. Long, luminous multi-layered comet trail
  if (comet.trail && comet.trail.length > 1) {
    const trail = comet.trail;
    const len = trail.length;

    // Layer A: Wide soft outer cyan bloom
    for (let i = 1; i < len; i++) {
      const p1 = trail[i - 1];
      const p2 = trail[i];
      const frac = i / len;
      const alpha = frac * frac * 0.55;
      const width = 3.0 + frac * 16.0;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = PALETTE.trailOuter;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Layer B: Intense mint trail body
    for (let i = 1; i < len; i++) {
      const p1 = trail[i - 1];
      const p2 = trail[i];
      const frac = i / len;
      const alpha = frac * frac * 0.95;
      const width = 2.0 + frac * 8.0;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = PALETTE.cometMint;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Layer C: Brilliant pure white spine
    for (let i = Math.floor(len * 0.4); i < len; i++) {
      const p1 = trail[i - 1];
      const p2 = trail[i];
      const frac = i / len;
      const alpha = Math.pow(frac, 3) * 0.9;
      const width = 1.2 + frac * 3.5;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = PALETTE.trailCore;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  // 2. Wide radiant corona glow
  const coronaRadius = comet.radius * 4.2;
  const coronaGrad = ctx.createRadialGradient(comet.x, comet.y, comet.radius * 0.3, comet.x, comet.y, coronaRadius);
  coronaGrad.addColorStop(0, PALETTE.cometHalo);
  coronaGrad.addColorStop(0.5, 'rgba(127, 242, 224, 0.32)');
  coronaGrad.addColorStop(1, PALETTE.cometGlowOuter);

  ctx.globalAlpha = 1.0;
  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.arc(comet.x, comet.y, coronaRadius, 0, Math.PI * 2);
  ctx.fill();

  // 3. Pulse Cooldown Ring around Ember (Clear tactical indicator)
  const pulseRingRadius = comet.radius + 15;
  const isPulseReady = repulsorTimer <= 0;
  if (!isPulseReady) {
    const pulseFrac = Math.max(0, Math.min(1, 1 - repulsorTimer / TUNING.repulsorCooldown));
    ctx.beginPath();
    ctx.arc(comet.x, comet.y, pulseRingRadius, -Math.PI / 2, -Math.PI / 2 + pulseFrac * Math.PI * 2);
    ctx.strokeStyle = PALETTE.accentCyan;
    ctx.lineWidth = 2.4;
    ctx.globalAlpha = 0.85;
    ctx.stroke();

    // Background track
    ctx.beginPath();
    ctx.arc(comet.x, comet.y, pulseRingRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(127, 242, 224, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
  } else {
    // Pulse READY halo ring with gentle breathing glow
    const breath = 0.5 + 0.5 * Math.sin(time * 6);
    ctx.beginPath();
    ctx.arc(comet.x, comet.y, pulseRingRadius, 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.accentCyan;
    ctx.lineWidth = 2.0;
    ctx.globalAlpha = 0.45 + 0.45 * breath;
    ctx.stroke();
  }

  // 4. Invulnerability shield ring (if active)
  if (comet.invulnerableTimer > 0) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 16);
    ctx.beginPath();
    ctx.arc(comet.x, comet.y, comet.radius + 9 + pulse * 5, 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.cometMintBright;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.6 + 0.4 * pulse;
    ctx.stroke();
  }

  // 5. Comet central nucleus
  ctx.beginPath();
  ctx.arc(comet.x, comet.y, comet.radius, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.cometMint;
  ctx.globalAlpha = 0.98;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(comet.x, comet.y, comet.radius * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.cometCore;
  ctx.globalAlpha = 1.0;
  ctx.fill();

  ctx.restore();
}

/**
 * Draws a gravitational well with a wide amber halo and contracting wave horizons.
 */
export function drawWell(ctx, well, time = 0) {
  ctx.save();
  const lifeRatio = Math.max(0, well.life / well.maxLife);
  const fadeAlpha = Math.min(1, lifeRatio * 1.8);

  // 1. Wide warm amber ambient halo (dramatically boosts scene radiance)
  const haloR = well.visualRadius * 3.4;
  const haloGrad = ctx.createRadialGradient(well.x, well.y, 4, well.x, well.y, haloR);
  haloGrad.addColorStop(0, 'rgba(255, 215, 125, 0.62)');
  haloGrad.addColorStop(0.35, 'rgba(255, 165, 55, 0.35)');
  haloGrad.addColorStop(0.7, 'rgba(255, 130, 25, 0.15)');
  haloGrad.addColorStop(1, 'rgba(255, 110, 10, 0)');

  ctx.fillStyle = haloGrad;
  ctx.globalAlpha = 0.95 * fadeAlpha;
  ctx.beginPath();
  ctx.arc(well.x, well.y, haloR, 0, Math.PI * 2);
  ctx.fill();

  // 2. Pull horizon boundary
  ctx.beginPath();
  ctx.arc(well.x, well.y, well.pullRadius, 0, Math.PI * 2);
  ctx.strokeStyle = PALETTE.wellWave;
  ctx.globalAlpha = 0.45 * fadeAlpha;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([6, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  // 3. Inward contracting gravity wave rings
  const ringCount = 4;
  for (let r = 0; r < ringCount; r++) {
    const wavePhase = (well.pulseTimer * 0.45 + r / ringCount) % 1;
    const waveRadius = well.pullRadius * (1 - wavePhase);
    ctx.beginPath();
    ctx.arc(well.x, well.y, waveRadius, 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.wellDistort;
    ctx.globalAlpha = (1 - wavePhase) * 0.65 * fadeAlpha;
    ctx.lineWidth = 2.0;
    ctx.stroke();
  }

  // 4. Inner glowing mass core
  const coreR = well.visualRadius * (0.88 + 0.14 * Math.sin(well.pulseTimer * 2.2));
  const coreGrad = ctx.createRadialGradient(well.x, well.y, 2, well.x, well.y, coreR);
  coreGrad.addColorStop(0, PALETTE.wellCore);
  coreGrad.addColorStop(0.28, PALETTE.wellAmberLight);
  coreGrad.addColorStop(0.68, PALETTE.wellAmber);
  coreGrad.addColorStop(1, 'rgba(255, 157, 59, 0)');

  ctx.fillStyle = coreGrad;
  ctx.globalAlpha = 0.95 * fadeAlpha;
  ctx.beginPath();
  ctx.arc(well.x, well.y, coreR, 0, Math.PI * 2);
  ctx.fill();

  // Core solid singularity pip
  ctx.beginPath();
  ctx.arc(well.x, well.y, 7, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.wellCore;
  ctx.globalAlpha = 1.0 * fadeAlpha;
  ctx.fill();

  ctx.restore();
}

/**
 * Draws an ancient star gate with large unmistakable glyph rings and portal energy.
 */
export function drawGateRing(ctx, gate, time = 0) {
  ctx.save();
  ctx.translate(gate.x, gate.y);

  const isHigh = gate.isHighlighted;
  const isPassed = gate.isPassed;
  const pulse = Math.sin(gate.pulsePhase);

  // 1. Central portal glow & aura
  const portalR = gate.radius * (isHigh ? 1.25 + 0.12 * pulse : 0.95);
  const portalGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, portalR);

  if (isPassed) {
    portalGrad.addColorStop(0, 'rgba(255, 168, 203, 0.55)');
    portalGrad.addColorStop(0.6, 'rgba(255, 77, 148, 0.22)');
    portalGrad.addColorStop(1, 'rgba(255, 77, 148, 0)');
  } else if (isHigh) {
    portalGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    portalGrad.addColorStop(0.4, PALETTE.gateInnerPulse);
    portalGrad.addColorStop(0.8, 'rgba(255, 77, 148, 0.32)');
    portalGrad.addColorStop(1, 'rgba(255, 77, 148, 0)');
  } else {
    portalGrad.addColorStop(0, 'rgba(165, 115, 155, 0.45)');
    portalGrad.addColorStop(0.7, 'rgba(140, 95, 130, 0.18)');
    portalGrad.addColorStop(1, 'rgba(140, 95, 130, 0)');
  }

  ctx.fillStyle = portalGrad;
  ctx.beginPath();
  ctx.arc(0, 0, portalR, 0, Math.PI * 2);
  ctx.fill();

  // Highlight Beacon Halo (Extra prominent for target gate)
  if (isHigh) {
    const beaconR = gate.radius * (1.35 + 0.08 * pulse);
    ctx.beginPath();
    ctx.arc(0, 0, beaconR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 120, 180, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 2. Outer celestial ring with nodes
  ctx.rotate(gate.ringAngle);
  ctx.beginPath();
  ctx.arc(0, 0, gate.radius, 0, Math.PI * 2);
  ctx.strokeStyle = isPassed ? PALETTE.gateMagentaLight : isHigh ? PALETTE.gateMagenta : PALETTE.gateInactive;
  ctx.lineWidth = isHigh ? 4.5 : 3.0;
  ctx.stroke();

  // Orbiting glyph nodes
  const nodeCount = 8;
  for (let n = 0; n < nodeCount; n++) {
    const angle = (n / nodeCount) * Math.PI * 2;
    const nx = Math.cos(angle) * gate.radius;
    const ny = Math.sin(angle) * gate.radius;

    ctx.beginPath();
    ctx.arc(nx, ny, isHigh ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = isHigh ? PALETTE.gateWhite : PALETTE.gateMagentaLight;
    ctx.fill();

    if (isHigh) {
      ctx.beginPath();
      ctx.arc(nx, ny, 8, 0, Math.PI * 2);
      ctx.strokeStyle = PALETTE.gateMagenta;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // 3. Counter-rotating inner ring
  ctx.rotate(-gate.ringAngle * 2.2);
  ctx.beginPath();
  ctx.arc(0, 0, gate.radius * 0.65, 0, Math.PI * 2);
  ctx.strokeStyle = isHigh ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 120, 180, 0.55)';
  ctx.lineWidth = 2.0;
  ctx.setLineDash([5, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Gate flash effect upon passing
  if (gate.flashTimer > 0) {
    const flashRatio = gate.flashTimer / 0.55;
    ctx.beginPath();
    ctx.arc(0, 0, gate.radius * (1 + (1 - flashRatio) * 1.8), 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.gateWhite;
    ctx.lineWidth = 6 * flashRatio;
    ctx.globalAlpha = flashRatio;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws a faceted slate asteroid with a clear, brilliant directional rim light.
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

  // 2. Dark facet shading outline
  ctx.strokeStyle = PALETTE.asteroidDark;
  ctx.lineWidth = 2.0;
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
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }

  // 4. Directional brilliant rim light along upper-left silhouette
  ctx.beginPath();
  const halfLen = Math.floor(poly.length * 0.52);
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i <= halfLen; i++) {
    ctx.lineTo(poly[i].x, poly[i].y);
  }

  // Base bold rim stroke
  ctx.strokeStyle = PALETTE.asteroidRimLight;
  ctx.lineWidth = 4.8;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Crisp pure-white inner highlight
  ctx.strokeStyle = PALETTE.asteroidHighlight;
  ctx.lineWidth = 2.0;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a floating stardust mote with spinning 4-point star sparkle.
 */
export function drawStardust(ctx, mote, time = 0) {
  ctx.save();
  ctx.translate(mote.x, mote.y);

  // Soft radiant amber halo
  const haloGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, mote.radius * 3.2);
  haloGrad.addColorStop(0, PALETTE.stardustHalo);
  haloGrad.addColorStop(1, 'rgba(255, 232, 117, 0)');

  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(0, 0, mote.radius * 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Spinning 4-point diamond sparkle
  ctx.rotate(mote.twinklePhase);
  const rOuter = mote.radius * 1.8;
  const rInner = mote.radius * 0.5;

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

  // Core bright pip
  ctx.beginPath();
  ctx.arc(0, 0, mote.radius * 0.4, 0, Math.PI * 2);
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

  // 1. Luminous celestial background fill (mid-violet-blue gradient)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, PALETTE.spaceGradTop);
  bgGrad.addColorStop(0.5, PALETTE.spaceGradMid);
  bgGrad.addColorStop(1, PALETTE.spaceGradBot);
  ctx.fillStyle = bgGrad;
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
    drawComet(ctx, state.comet, time, state.repulsorCooldownTimer || 0);
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
    drawGameOverScreen(ctx, state, time);
  } else if (state.screen === 'victory') {
    drawVictoryScreen(ctx, state, time);
  }
}
