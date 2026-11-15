/**
 * Comet Warden - Main Game Loop & State Machine
 * Coordinates input polling, fixed-step physics integration, entity lifecycles, and screen transitions.
 */

import { TUNING } from './config.js';
import { createRng } from './random.js';
import { createInput } from './input.js';
import { integrateComet, updateTrail, circlesOverlap, applyRepulsorPulse } from './physics.js';
import { createComet, respawnComet, placeWell, clearAllWells, updateWells, updateAsteroids, updateGates, passGate, updateStardust } from './entities.js';
import { generateSector, sealSector } from './sectors.js';
import { createParticleSystem, updateParticleSystem, emitSparks, emitDebris, emitGateFlash, emitWellPlacement, createNebulaClouds } from './particles.js';
import { playWellPlace, playGatePass, playCrash, playVictory, playMenuClick, playStardust, playRepulsor, toggleMute } from './audio.js';
import { createStarfield, createCamera, addCameraTrauma, updateCamera, renderScene } from './render.js';
import { stageScreenshot } from './shots.js';

function getStorageBestScore() {
  try {
    const val = localStorage.getItem('comet_warden_best_score');
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function saveStorageBestScore(score) {
  try {
    const current = getStorageBestScore();
    if (score > current) {
      localStorage.setItem('comet_warden_best_score', String(Math.floor(score)));
    }
  } catch {
    // LocalStorage unavailable in certain sandboxes
  }
}

function boot() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Parse URL query parameters
  const params = new URLSearchParams(window.location.search);
  const shotParam = params.get('shot');
  const seedParam = params.get('seed');
  const seedNumber = seedParam ? parseInt(seedParam, 10) || 42 : 42;

  // Staged screenshot mode for automated validation
  if (shotParam) {
    stageScreenshot(ctx, shotParam, seedNumber);
    return;
  }

  // Normal gameplay mode
  const rng = createRng(seedNumber);
  const input = createInput(canvas);
  const stars = createStarfield(rng, 220);
  const nebulaClouds = createNebulaClouds(rng, TUNING.viewWidth, TUNING.viewHeight);
  const camera = createCamera();
  const particleSystem = createParticleSystem();

  const state = {
    screen: 'title', // 'title' | 'play' | 'paused' | 'game_over' | 'victory'
    score: 0,
    bestScore: getStorageBestScore(),
    lives: TUNING.maxLives,
    wellCharges: TUNING.wellMaxCharges,
    repulsorCooldownTimer: 0,
    stardustCount: 0,
    totalGatesPassed: 0,
    sectorsSealed: 0,
    elapsedSeconds: 0,
    sectorNumber: 1,
    sectorName: 'Vesper Rift',
    gatesRequired: 3,
    gatesPassedCount: 0,
    comet: createComet(240, 360, TUNING.cometInitialSpeed, 0),
    wells: [],
    sector: null,
    particleSystem,
    mouse: input.mouse,
    lastPassedGate: null,
  };

  function startNewGame() {
    state.score = 0;
    state.lives = TUNING.maxLives;
    state.wellCharges = TUNING.wellMaxCharges;
    state.repulsorCooldownTimer = 0;
    state.stardustCount = 0;
    state.totalGatesPassed = 0;
    state.sectorsSealed = 0;
    state.elapsedSeconds = 0;
    state.sectorNumber = 1;
    state.wells.length = 0;
    loadSector(1);
    state.screen = 'play';
    playMenuClick();
  }

  function loadSector(sectorNum) {
    state.sectorNumber = sectorNum;
    state.sector = generateSector(sectorNum, rng);
    state.sectorName = state.sector.name;
    state.gatesRequired = state.sector.gatesRequired;
    state.gatesPassedCount = 0;
    state.wells.length = 0;
    state.lastPassedGate = state.sector.gates[0] || null;

    // Position comet initially heading towards the first gate
    const g0 = state.sector.gates[0];
    if (g0) {
      state.comet = createComet(g0.x - 140, g0.y, TUNING.cometInitialSpeed, 0);
    } else {
      state.comet = createComet(200, 360, TUNING.cometInitialSpeed, 0);
    }
  }

  // Pre-generate sector 1 for title screen background
  state.sector = generateSector(1, rng);

  let lastTime = performance.now();
  let accumulator = 0;
  let totalTime = 0;

  function updateSimulation(dt) {
    totalTime += dt;
    updateCamera(camera, dt);
    updateParticleSystem(particleSystem, dt);

    // Audio mute toggle
    if (input.pollMute()) {
      toggleMute();
      playMenuClick();
    }

    // State machine updates
    if (state.screen === 'title') {
      if (input.pollConfirm()) {
        startNewGame();
      }
      return;
    }

    if (state.screen === 'paused') {
      if (input.pollPause()) {
        state.screen = 'play';
        playMenuClick();
      }
      return;
    }

    if (state.screen === 'game_over' || state.screen === 'victory') {
      if (input.pollConfirm() || input.pollRestart()) {
        startNewGame();
      }
      return;
    }

    if (state.screen === 'play') {
      state.elapsedSeconds += dt;

      // Check Pause
      if (input.pollPause()) {
        state.screen = 'paused';
        playMenuClick();
        return;
      }

      // Check Restart
      if (input.pollRestart()) {
        startNewGame();
        return;
      }

      // 1. Gravity well placement
      const placement = input.pollWellPlacement();
      if (placement.triggered) {
        const chargeBudget = { charges: state.wellCharges };
        const newWell = placeWell(state.wells, placement.x, placement.y, placement.holdSeconds, chargeBudget);
        if (newWell) {
          state.wellCharges = chargeBudget.charges;
          playWellPlace(newWell.holdRatio);
          emitWellPlacement(particleSystem, newWell.x, newWell.y, newWell.holdRatio);
        }
      }

      // 2. Clear all wells
      if (input.pollClearWells()) {
        const count = clearAllWells(state.wells);
        if (count > 0) {
          playMenuClick();
        }
      }

      // 3. Repulsor pulse
      if (input.pollPulse() && state.repulsorCooldownTimer <= 0) {
        state.repulsorCooldownTimer = TUNING.repulsorCooldown;
        playRepulsor();
        addCameraTrauma(camera, 0.35);
        emitSparks(particleSystem, state.comet.x, state.comet.y, 24, '#7ff2e0', 220, 2.5);
        applyRepulsorPulse(state.comet, state.sector.asteroids);
      }

      // 4. Emergency ion thrust (WASD)
      const thrust = input.getThrustVector();
      if (thrust.active && state.repulsorCooldownTimer <= 0.8) {
        state.repulsorCooldownTimer = Math.min(TUNING.repulsorCooldown, state.repulsorCooldownTimer + TUNING.thrustDrainPerSecond * dt);
      }

      // 5. Physics integration
      const integ = integrateComet(state.comet, state.wells, dt, thrust);
      if (integ.bounced) {
        emitSparks(particleSystem, state.comet.x, state.comet.y, 8, '#7ff2e0', 100, 1.8);
      }
      updateTrail(state.comet, dt);

      // 6. Wells update & natural charge refill
      updateWells(state.wells, dt);
      state.wellCharges = Math.min(TUNING.wellMaxCharges, state.wellCharges + dt / TUNING.wellChargeRefillSeconds);
      if (state.repulsorCooldownTimer > 0) {
        state.repulsorCooldownTimer = Math.max(0, state.repulsorCooldownTimer - dt);
      }

      // 7. Update asteroids and stardust
      updateAsteroids(state.sector.asteroids, dt);
      updateStardust(state.sector.stardust, dt);
      updateGates(state.sector.gates, state.sector.targetGateIndex, dt);

      // Decrement invulnerability
      if (state.comet.invulnerableTimer > 0) {
        state.comet.invulnerableTimer -= dt;
      }

      // 8. Stardust collection
      for (let i = 0; i < state.sector.stardust.length; i++) {
        const mote = state.sector.stardust[i];
        if (!mote.collected && circlesOverlap(state.comet.x, state.comet.y, state.comet.radius, mote.x, mote.y, mote.radius + 8)) {
          mote.collected = true;
          state.stardustCount += 1;
          state.score += TUNING.stardustScore;
          state.wellCharges = Math.min(TUNING.wellMaxCharges, state.wellCharges + TUNING.stardustChargeBonus);
          playStardust();
          emitSparks(particleSystem, mote.x, mote.y, 14, '#ffe875', 120, 2.2);
        }
      }

      // 9. Star Gate traversal
      const targetGate = state.sector.gates[state.sector.targetGateIndex];
      if (targetGate && !targetGate.isPassed) {
        if (circlesOverlap(state.comet.x, state.comet.y, state.comet.radius, targetGate.x, targetGate.y, targetGate.radius)) {
          const pass = passGate(targetGate);
          state.score += pass.scoreBonus * state.sectorNumber;
          state.gatesPassedCount += 1;
          state.totalGatesPassed += 1;
          state.lastPassedGate = targetGate;
          state.wellCharges = Math.min(TUNING.wellMaxCharges, state.wellCharges + 1.0);
          playGatePass(state.sector.targetGateIndex);
          emitGateFlash(particleSystem, targetGate.x, targetGate.y);
          addCameraTrauma(camera, 0.22);

          // Advance gate target
          state.sector.targetGateIndex += 1;

          // Check sector completion
          if (state.sector.targetGateIndex >= state.sector.gatesRequired) {
            state.sectorsSealed += 1;
            const seal = sealSector(state.sector);
            state.score += seal.bonusScore;

            if (seal.won) {
              // Victory!
              state.screen = 'victory';
              if (state.score > state.bestScore) {
                state.bestScore = state.score;
                saveStorageBestScore(state.score);
              }
              playVictory();
            } else {
              // Next sector
              loadSector(seal.nextSectorNumber);
            }
          }
        }
      }

      // 10. Asteroid collisions
      if (state.comet.invulnerableTimer <= 0) {
        for (let i = 0; i < state.sector.asteroids.length; i++) {
          const ast = state.sector.asteroids[i];
          if (circlesOverlap(state.comet.x, state.comet.y, state.comet.radius, ast.x, ast.y, ast.radius * 0.9)) {
            state.lives -= 1;
            playCrash();
            addCameraTrauma(camera, 0.7);
            emitDebris(particleSystem, state.comet.x, state.comet.y, 28);
            emitSparks(particleSystem, state.comet.x, state.comet.y, 22, '#ff4d6d', 200, 3.0);

            if (state.lives <= 0) {
              // Rift Consumed (Game Over)
              state.screen = 'game_over';
              if (state.score > state.bestScore) {
                state.bestScore = state.score;
                saveStorageBestScore(state.score);
              }
            } else {
              // Respawn near last gate
              respawnComet(state.comet, state.lastPassedGate);
            }
            break;
          }
        }
      }
    }
  }

  function frame(timestamp) {
    const elapsed = Math.min(0.1, (timestamp - lastTime) / 1000);
    lastTime = timestamp;
    accumulator += elapsed;

    const fixedStep = TUNING.simDelta;
    while (accumulator >= fixedStep) {
      updateSimulation(fixedStep);
      input.update(fixedStep);
      accumulator -= fixedStep;
    }

    renderScene(ctx, state, totalTime, camera, stars, nebulaClouds);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

window.addEventListener('DOMContentLoaded', boot);
