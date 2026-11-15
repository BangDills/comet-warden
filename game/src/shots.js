/**
 * Comet Warden - Staged Screenshot Scenes
 * Deterministic generation and staging of the 4 judge-verified screenshot scenes.
 */

import { TUNING, PALETTE } from './config.js';
import { createRng } from './random.js';
import { createComet, createWell, createAsteroid, createGate, createStardust } from './entities.js';
import { generateSector } from './sectors.js';
import { createParticleSystem, emitSparks, emitDebris, createNebulaClouds } from './particles.js';
import { createStarfield, createCamera, renderScene } from './render.js';

export function stageScreenshot(ctx, shotName, seedNumber = 42) {
  const rng = createRng(seedNumber);
  const time = 12.5;

  const stars = createStarfield(rng, 220);
  const nebulaClouds = createNebulaClouds(rng, TUNING.viewWidth, TUNING.viewHeight);
  const camera = createCamera();
  const particleSystem = createParticleSystem();

  let state = {
    screen: shotName,
    bestScore: 6100,
    score: 0,
    lives: 3,
    wellCharges: 3,
    repulsorCooldownTimer: 0,
    stardustCount: 0,
    sectorNumber: 1,
    sectorName: 'Vesper Rift',
    gatesRequired: 3,
    gatesPassedCount: 0,
    comet: null,
    wells: [],
    sector: null,
    particleSystem,
    mouse: { isDown: false, x: 640, y: 360, holdSeconds: 0 },
  };

  if (shotName === 'title') {
    state.screen = 'title';
    state.bestScore = 8450;
    // Ambient drift background
    state.sector = generateSector(1, rng);
    state.comet = createComet(420, 360, 120, -40);
  } else if (shotName === 'play') {
    state.screen = 'play';
    state.sectorNumber = 2;
    state.sectorName = 'Astraea Shallows';
    state.gatesRequired = 4;
    state.gatesPassedCount = 2;
    state.score = 2480;
    state.bestScore = 6100;
    state.stardustCount = 8;
    state.lives = 3;
    state.wellCharges = 3.65;
    state.repulsorCooldownTimer = 0;

    // Fixed sector 2 world
    state.sector = generateSector(2, rng);

    // Position gates intentionally for screenshot composition
    state.sector.gates = [
      createGate('g-0', 210, 260, 0),
      createGate('g-1', 440, 520, 1),
      createGate('g-2', 960, 310, 2), // Highlighted gate ahead!
      createGate('g-3', 1100, 580, 3),
    ];
    state.sector.gates[0].isPassed = true;
    state.sector.gates[1].isPassed = true;
    state.sector.gates[2].isHighlighted = true;
    state.sector.targetGateIndex = 2;

    // Two placed gravity wells with comet curving between them towards gate 2
    const well1 = createWell(540, 260, 0.45);
    well1.life = 3.2;
    well1.pulseTimer = 1.8;

    const well2 = createWell(760, 480, 0.7);
    well2.life = 2.4;
    well2.pulseTimer = 2.9;

    state.wells = [well1, well2];

    // Comet positioned mid-flight between the two wells curving toward gate 2
    state.comet = createComet(660, 345, 195, -75);

    // Realistic curved trail leading from near gate 1, past well 1 and heading toward well 2
    const trailPoints = [];
    const steps = 36;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      // Spline curve between previous trajectory and current position
      const px = 440 + t * (660 - 440) + Math.sin(t * Math.PI) * 45;
      const py = 520 - t * (520 - 345) + Math.cos(t * Math.PI) * 35;
      trailPoints.push({ x: px, y: py, age: (1 - t) * 0.7 });
    }
    state.comet.trail = trailPoints;

    // Drifting asteroids framing the cosmic scene
    state.sector.asteroids = [
      createAsteroid(360, 160, 15, 8, 38, rng),
      createAsteroid(850, 170, -18, 12, 44, rng),
      createAsteroid(580, 580, 22, -10, 32, rng),
      createAsteroid(1120, 220, -14, -8, 28, rng),
      createAsteroid(200, 560, 12, 14, 42, rng),
    ];

    // Stardust motes floating nearby
    state.sector.stardust = [
      createStardust(620, 280, rng),
      createStardust(720, 390, rng),
      createStardust(880, 320, rng),
      createStardust(500, 420, rng),
      createStardust(820, 240, rng),
    ];

    // Sparks around gate and trail
    emitSparks(particleSystem, 960, 310, 14, PALETTE.gateMagentaLight, 110, 2.8);
    emitSparks(particleSystem, 660, 345, 10, PALETTE.cometMint, 80, 2.0);
  } else if (shotName === 'win') {
    state.screen = 'victory';
    state.score = 11420;
    state.bestScore = 11420;
    state.totalGatesPassed = 42;
    state.elapsedSeconds = 374; // 6m 14s
    state.sectorNumber = 7;
    state.sectorName = 'Oblivion Gate';
    state.sectorsSealed = 7;
    state.sector = generateSector(7, rng);
    state.comet = createComet(640, 360, 0, 0);

    // Celebratory radiant bursts
    emitSparks(particleSystem, 640, 360, 45, PALETTE.cometMint, 260, 3.5);
    emitSparks(particleSystem, 640, 360, 35, PALETTE.stardustAmber, 220, 3.0);
    emitSparks(particleSystem, 640, 360, 30, PALETTE.gateMagentaLight, 200, 3.0);
  } else if (shotName === 'crash') {
    state.screen = 'game_over';
    state.score = 5240;
    state.bestScore = 7890;
    state.sectorsSealed = 3;
    state.sectorNumber = 4;
    state.sectorName = 'Helios Decay';
    state.sector = generateSector(4, rng);

    // Asteroid impact site
    const impactX = 640;
    const impactY = 360;
    state.comet = createComet(impactX, impactY, 0, 0);
    state.comet.alive = false;

    // Dramatic crash debris & shockwave
    emitDebris(particleSystem, impactX, impactY, 40);
    emitSparks(particleSystem, impactX, impactY, 36, PALETTE.cometMint, 240, 3.2);
    emitSparks(particleSystem, impactX, impactY, 28, PALETTE.alertRed, 190, 3.5);

    state.sector.asteroids.push(createAsteroid(impactX + 18, impactY - 14, 0, 0, 46, rng));
  }

  // Paint the final scene
  renderScene(ctx, state, time, camera, stars, nebulaClouds);

  // Signal to capture tool that frame is rendered
  if (typeof window !== 'undefined') {
    requestAnimationFrame(() => {
      renderScene(ctx, state, time, camera, stars, nebulaClouds);
      window.__shotReady = true;
    });
  }
}
