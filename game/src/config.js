/**
 * Comet Warden - Configuration & Palette
 * Holds every color palette value and tuning constant for the game.
 */

export const PALETTE = {
  // Deep celestial backgrounds
  space: '#0b1026',
  spaceDeep: '#050814',
  nebulaIndigo: 'rgba(28, 38, 92, 0.22)',
  nebulaPlum: 'rgba(72, 24, 96, 0.18)',
  nebulaCyan: 'rgba(32, 94, 110, 0.15)',
  starWarm: '#fff9e6',
  starMint: '#a6f7ea',
  starDim: '#3a4468',

  // Ember comet & trail
  cometCore: '#ffffff',
  cometMint: '#7ff2e0',
  cometHalo: 'rgba(127, 242, 224, 0.45)',
  cometGlowOuter: 'rgba(127, 242, 224, 0.12)',
  trailStart: 'rgba(127, 242, 224, 0.95)',
  trailEnd: 'rgba(127, 242, 224, 0.0)',

  // Gravitational wells
  wellCore: '#ffffff',
  wellAmber: '#ffb35c',
  wellAmberLight: '#ffcf8a',
  wellRing: 'rgba(255, 179, 92, 0.7)',
  wellDistort: 'rgba(255, 179, 92, 0.22)',
  wellWave: 'rgba(255, 210, 140, 0.15)',
  wellSingularity: 'rgba(255, 245, 220, 0.9)',

  // Cosmic star gates
  gateWhite: '#ffffff',
  gateMagenta: '#ff5fa2',
  gateMagentaLight: '#ff8fb8',
  gateRing: 'rgba(255, 95, 162, 0.85)',
  gateInnerPulse: 'rgba(255, 95, 162, 0.3)',
  gateGlow: 'rgba(255, 95, 162, 0.18)',
  gateInactive: 'rgba(110, 70, 95, 0.55)',
  gateBeam: 'rgba(255, 143, 184, 0.35)',

  // Slate asteroids & rim light
  asteroidBody: '#5a6480',
  asteroidDark: '#363d50',
  asteroidShadow: '#222735',
  asteroidRimLight: '#94a2c7',
  asteroidHighlight: '#cbd5e8',

  // Stardust motes
  stardustCore: '#ffffff',
  stardustAmber: '#ffe875',
  stardustHalo: 'rgba(255, 232, 117, 0.55)',

  // Repulsor & shockwave
  repulsorRing: '#7ff2e0',
  repulsorGlow: 'rgba(127, 242, 224, 0.3)',

  // HUD interface & text
  hudText: '#f2e6cf',
  hudTextDim: 'rgba(242, 230, 207, 0.65)',
  hudTextMuted: 'rgba(242, 230, 207, 0.38)',
  hudShadow: 'rgba(5, 8, 20, 0.85)',
  hudPanelBg: 'rgba(9, 14, 34, 0.72)',
  hudPanelBorder: 'rgba(127, 242, 224, 0.25)',
  hudLifePip: '#7ff2e0',
  hudLifeLost: 'rgba(90, 100, 128, 0.4)',
  hudChargeBar: '#ffb35c',
  hudChargeEmpty: 'rgba(70, 50, 30, 0.45)',

  // Status indicators
  alertRed: '#ff4d6d',
  accentCyan: '#7ff2e0',
  accentGold: '#ffc857',
};

export const TUNING = {
  // Screen and viewport
  viewWidth: 1280,
  viewHeight: 720,
  simDelta: 1 / 60,

  // Campaign progression
  totalSectors: 7,
  maxLives: 3,

  // Comet dynamics
  cometRadius: 8.5,
  cometInitialSpeed: 170,
  cometMinSpeed: 70,
  cometMaxSpeed: 420,
  cometDrag: 0.9985,
  cometInvulnerableTime: 2.2, // seconds after respawn
  cometTrailSampleRate: 0.016,
  cometTrailMaxLength: 55,

  // Gravity well placement & physics
  wellMaxCharges: 5,
  wellChargeRefillSeconds: 4.2,
  wellDuration: 4.8,
  wellMinHoldSeconds: 0.12,
  wellMaxHoldSeconds: 1.1,
  wellBaseMass: 26000,
  wellMaxMass: 78000,
  wellBaseRadius: 38,
  wellPullRadius: 360,
  gravitySofteningSq: 1400, // epsilon^2 to prevent infinite singularity spikes

  // Star gates
  gateRadius: 34,
  gateProximityDistance: 190,
  gateBaseScore: 350,

  // Stardust motes
  stardustRadius: 7,
  stardustCountPerSector: 9,
  stardustScore: 80,
  stardustChargeBonus: 1.0,

  // Repulsor & thrust
  repulsorCooldown: 5.5, // seconds
  repulsorRadius: 280,
  repulsorForce: 460,
  thrustDrainPerSecond: 0.22, // drains repulsor gauge
  thrustPower: 160,

  // Asteroid drift
  asteroidMinRadius: 18,
  asteroidMaxRadius: 46,
  asteroidMinSpeed: 25,
  asteroidMaxSpeed: 85,

  // Camera & juice
  cameraTraumaDecay: 1.8,
  maxScreenShakeOffset: 16,
};

export const SECTOR_CONFIGS = [
  { index: 1, name: 'Vesper Rift', gatesRequired: 3, asteroidCount: 5, asteroidSpeedMult: 0.8 },
  { index: 2, name: 'Astraea Shallows', gatesRequired: 4, asteroidCount: 7, asteroidSpeedMult: 1.0 },
  { index: 3, name: 'Onyx Nebula', gatesRequired: 5, asteroidCount: 9, asteroidSpeedMult: 1.15 },
  { index: 4, name: 'Helios Decay', gatesRequired: 6, asteroidCount: 11, asteroidSpeedMult: 1.3 },
  { index: 5, name: 'Phobos Belt', gatesRequired: 7, asteroidCount: 13, asteroidSpeedMult: 1.45 },
  { index: 6, name: 'Chronos Deep', gatesRequired: 8, asteroidCount: 15, asteroidSpeedMult: 1.6 },
  { index: 7, name: 'Oblivion Gate', gatesRequired: 9, asteroidCount: 17, asteroidSpeedMult: 1.8 },
];
