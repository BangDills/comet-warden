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

export function emitSparks(system, x, y, count = 18, color = PALETTE.cometMint, maxSpeed = 160, baseSize = 3) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.2 + Math.random() * 0.8) * maxSpeed;
    system.particles.push({
      type: 'spark',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.35 + Math.random() * 0.45,
      maxLife: 0.8,
      size: baseSize * (0.6 + Math.random() * 0.8),
      color,
      decay: 0.96,
    });
  }
}

export function emitDebris(system, x, y, count = 24) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 220;
    const isSlate = Math.random() < 0.65;
    system.particles.push({
      type: 'debris',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.6 + Math.random() * 0.9,
      maxLife: 1.5,
      size: 2 + Math.random() * 4.5,
      color: isSlate ? PALETTE.asteroidBody : PALETTE.cometMint,
      decay: 0.94,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 8,
    });
  }
}

export function emitShockwave(system, x, y, maxRadius = 140, color = PALETTE.gateMagenta, lineWidth = 4) {
  system.shockwaves.push({
    x,
    y,
    radius: 8,
    maxRadius,
    life: 0.6,
    maxLife: 0.6,
    color,
    lineWidth,
  });
}

export function emitGateFlash(system, x, y) {
  emitShockwave(system, x, y, 160, PALETTE.gateMagenta, 6);
  emitShockwave(system, x, y, 90, PALETTE.gateMagentaLight, 3);
  emitSparks(system, x, y, 32, PALETTE.gateMagentaLight, 240, 3.8);
  emitSparks(system, x, y, 16, PALETTE.cometMint, 140, 2.5);
}

export function emitWellPlacement(system, x, y, holdRatio = 0) {
  const maxR = 90 + holdRatio * 90;
  emitShockwave(system, x, y, maxR, PALETTE.wellAmber, 3.5);
  emitSparks(system, x, y, 20, PALETTE.wellAmberLight, 130 + holdRatio * 90, 2.6);
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
    s.radius = 8 + progress * (s.maxRadius - 8);
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
    ctx.globalAlpha = alpha * 0.85;
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
 * Creates procedural layered nebula clouds for background depth.
 */
export function createNebulaClouds(rng, width, height) {
  const clouds = [];
  const cloudCount = 6;
  const colors = [
    PALETTE.nebulaIndigo,
    PALETTE.nebulaPlum,
    PALETTE.nebulaCyan,
    PALETTE.nebulaIndigo,
  ];

  for (let i = 0; i < cloudCount; i++) {
    clouds.push({
      x: rng.range(width * 0.1, width * 0.9),
      y: rng.range(height * 0.1, height * 0.9),
      radius: rng.range(260, 480),
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
    const offsetX = Math.cos(time * c.driftSpeed + c.driftAngle) * 20;
    const offsetY = Math.sin(time * c.driftSpeed + c.driftAngle) * 20;

    const grad = ctx.createRadialGradient(
      c.x + offsetX,
      c.y + offsetY,
      c.radius * 0.1,
      c.x + offsetX,
      c.y + offsetY,
      c.radius
    );
    grad.addColorStop(0, c.color);
    grad.addColorStop(1, 'rgba(11, 16, 38, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(c.x + offsetX, c.y + offsetY, c.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
