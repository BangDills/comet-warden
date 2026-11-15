/**
 * Comet Warden - Particle & Visual Effects Engine
 * Procedural sparks, debris bursts, expanding shockwave rings, and drifting cosmic nebula haze.
 */

import { PALETTE } from './config.js';

export function createParticleSystem() {
  return {
    particles: [],
    shockwaves: [],
  };
}

export function emitSparks(system, x, y, count = 22, color = PALETTE.cometMint, maxSpeed = 180, baseSize = 3.5) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.25 + Math.random() * 0.75) * maxSpeed;
    system.particles.push({
      type: 'spark',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.4 + Math.random() * 0.5,
      maxLife: 0.9,
      size: baseSize * (0.6 + Math.random() * 0.8),
      color,
      decay: 0.96,
    });
  }
}

export function emitDebris(system, x, y, count = 28) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 240;
    const isSlate = Math.random() < 0.65;
    system.particles.push({
      type: 'debris',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.7 + Math.random() * 1.0,
      maxLife: 1.7,
      size: 2.5 + Math.random() * 5.0,
      color: isSlate ? PALETTE.asteroidBody : PALETTE.cometMint,
      decay: 0.94,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 8,
    });
  }
}

export function emitShockwave(system, x, y, maxRadius = 160, color = PALETTE.gateMagenta, lineWidth = 5) {
  system.shockwaves.push({
    x,
    y,
    radius: 10,
    maxRadius,
    life: 0.65,
    maxLife: 0.65,
    color,
    lineWidth,
  });
}

export function emitGateFlash(system, x, y) {
  emitShockwave(system, x, y, 200, PALETTE.gateMagenta, 7);
  emitShockwave(system, x, y, 120, PALETTE.gateWhite, 4);
  emitShockwave(system, x, y, 60, PALETTE.gateMagentaLight, 3);
  emitSparks(system, x, y, 42, PALETTE.gateMagentaLight, 260, 4.2);
  emitSparks(system, x, y, 24, PALETTE.gateWhite, 200, 3.2);
  emitSparks(system, x, y, 20, PALETTE.cometMint, 160, 2.8);
}

export function emitWellPlacement(system, x, y, holdRatio = 0) {
  const maxR = 110 + holdRatio * 110;
  emitShockwave(system, x, y, maxR, PALETTE.wellAmber, 4.5);
  emitShockwave(system, x, y, maxR * 0.55, PALETTE.wellAmberLight, 2.5);
  emitSparks(system, x, y, 26, PALETTE.wellAmberLight, 150 + holdRatio * 100, 3.0);
}

export function updateParticleSystem(system, dt) {
  // Update linear sparks and debris
  for (let i = system.particles.length - 1; i >= 0; i--) {
    const p = system.particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      system.particles.splice(i, 1);
      continue;
    }
    p.vx *= p.decay;
    p.vy *= p.decay;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.rotSpeed) {
      p.rot += p.rotSpeed * dt;
    }
  }

  // Update expanding shockwaves
  for (let i = system.shockwaves.length - 1; i >= 0; i--) {
    const s = system.shockwaves[i];
    s.life -= dt;
    if (s.life <= 0) {
      system.shockwaves.splice(i, 1);
      continue;
    }
    const progress = 1 - s.life / s.maxLife;
    s.radius = 10 + progress * (s.maxRadius - 10);
  }
}

export function drawParticleSystem(ctx, system) {
  // Draw shockwaves
  for (let i = 0; i < system.shockwaves.length; i++) {
    const s = system.shockwaves[i];
    const alpha = Math.max(0, s.life / s.maxLife);
    ctx.save();
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.strokeStyle = s.color;
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = s.lineWidth * (0.3 + 0.7 * alpha);
    ctx.stroke();
    ctx.restore();
  }

  // Draw point and debris particles
  for (let i = 0; i < system.particles.length; i++) {
    const p = system.particles[i];
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;

    if (p.type === 'debris') {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot || 0);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * alpha), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/**
 * Creates procedural layered nebula clouds for background depth and vibrancy.
 */
export function createNebulaClouds(rng, width, height) {
  const clouds = [];
  const cloudCount = 8;
  const colors = [
    PALETTE.nebulaIndigo,
    PALETTE.nebulaPlum,
    PALETTE.nebulaCyan,
    PALETTE.nebulaViolet,
    PALETTE.nebulaIndigo,
    PALETTE.nebulaPlum,
    PALETTE.nebulaCyan,
    PALETTE.nebulaViolet,
  ];

  for (let i = 0; i < cloudCount; i++) {
    clouds.push({
      x: rng.range(width * 0.08, width * 0.92),
      y: rng.range(height * 0.08, height * 0.92),
      radius: rng.range(320, 560),
      color: colors[i % colors.length],
      driftSpeed: rng.range(0.015, 0.04),
      driftAngle: rng.angle(),
    });
  }
  return clouds;
}

/**
 * Paints smooth radial gradient nebula clouds onto the background.
 */
export function drawNebula(ctx, clouds, time = 0) {
  ctx.save();
  for (let i = 0; i < clouds.length; i++) {
    const c = clouds[i];
    const offsetX = Math.cos(time * c.driftSpeed + c.driftAngle) * 25;
    const offsetY = Math.sin(time * c.driftSpeed + c.driftAngle) * 25;

    const grad = ctx.createRadialGradient(
      c.x + offsetX,
      c.y + offsetY,
      c.radius * 0.05,
      c.x + offsetX,
      c.y + offsetY,
      c.radius
    );
    grad.addColorStop(0, c.color);
    grad.addColorStop(0.55, c.color.replace(/[\d\.]+\)$/, (m) => `${(parseFloat(m) * 0.5).toFixed(3)})`));
    grad.addColorStop(1, 'rgba(24, 30, 66, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(c.x + offsetX, c.y + offsetY, c.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
