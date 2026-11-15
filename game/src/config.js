/**
 * Comet Warden - Configuration & Palette
 * Holds every color palette value and tuning constant for the game.
 */

export const PALETTE = {
  // Luminous celestial backgrounds (elevated from deep pitch toward rich mid-violet-blue)
  space: '#181e42',
  spaceDeep: '#121633',
  spaceGradTop: '#1e2658',
  spaceGradMid: '#161c42',
  spaceGradBot: '#191f48',

  // Vibrant drifting cosmic nebulae
  nebulaIndigo: 'rgba(68, 82, 185, 0.40)',
  nebulaPlum: 'rgba(145, 52, 175, 0.34)',
  nebulaCyan: 'rgba(42, 155, 185, 0.30)',
  nebulaViolet: 'rgba(105, 65, 195, 0.36)',

  // Starfield
  starWarm: '#fffde8',
  starMint: '#b8fff2',
  starDim: '#6576ad',

  // Radiant comet Ember & sweeping trail
  cometCore: '#ffffff',
  cometMint: '#7ff2e0',
  cometMintBright: '#c8fff7',
  cometHalo: 'rgba(127, 242, 224, 0.65)',
  cometGlowOuter: 'rgba(127, 242, 224, 0.22)',
  trailCore: '#ffffff',
  trailMint: '#7ff2e0',
  trailOuter: 'rgba(127, 242, 224, 0.38)',
  trailStart: 'rgba(200, 255, 247, 0.98)',
  trailEnd: 'rgba(127, 242, 224, 0.0)',

  // Gravitational wells with wide warm amber halos
  wellCore: '#ffffff',
  wellAmber: '#ff9d3b',
  wellAmberLight: '#ffd48f',
  wellRing: 'rgba(255, 170, 65, 0.85)',
  wellDistort: 'rgba(255, 185, 75, 0.35)',
  wellWave: 'rgba(255, 215, 130, 0.28)',
  wellSingularity: 'rgba(255, 245, 220, 0.95)',
  wellHaloInner: 'rgba(255, 200, 100, 0.45)',
  wellHaloOuter: 'rgba(255, 140, 30, 0.0)',

  // Large unmistakable cosmic star gates
  gateWhite: '#ffffff',
  gateMagenta: '#ff4d94',
  gateMagentaLight: '#ffa8cb',
  gateRing: 'rgba(255, 77, 148, 0.92)',
  gateInnerPulse: 'rgba(255, 110, 175, 0.45)',
  gateGlow: 'rgba(255, 80, 150, 0.32)',
  gateInactive: 'rgba(165, 115, 155, 0.80)',
  gateInactiveGlow: 'rgba(140, 95, 130, 0.25)',
  gateBeam: 'rgba(255, 168, 203, 0.45)',

  // Slate asteroids with crisp directional rim lighting
  asteroidBody: '#4e5874',
  asteroidDark: '#32394d',
  asteroidShadow: '#202534',
  asteroidRimLight: '#e4efff',
  asteroidHighlight: '#ffffff',

  // Stardust motes
  stardustCore: '#ffffff',
  stardustAmber: '#ffe875',
  stardustHalo: 'rgba(255, 232, 117, 0.65)',

  // Repulsor & shockwave
  repulsorRing: '#7ff2e0',
  repulsorGlow: 'rgba(127, 242, 224, 0.45)',

  // HUD interface & high-contrast panels
  hudText: '#ffffff',
  hudTextDim: '#dbe4f5',
  hudTextMuted: '#a5b4d4',
  hudShadow: 'rgba(0, 0, 0, 0.92)',
  hudPanelBg: 'rgba(12, 17, 42, 0.82)',
  hudPanelBorder: 'rgba(127, 242, 224, 0.38)',
  hudPanelBorderGold: 'rgba(255, 200, 87, 0.45)',
  hudLifePip: '#7ff2e0',
  hudLifeLost: 'rgba(95, 110, 145, 0.45)',
  hudChargeBar: '#ffaa3b',
  hudChargeEmpty: 'rgba(65, 48, 32, 0.65)',

  // Status indicators
  alertRed: '#ff3b60',
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
  cometRadius: 9.0,
  cometInitialSpeed: 170,
  cometMinSpeed: 70,
  cometMaxSpeed: 420,
  cometDrag: 0.9985,
  cometInvulnerableTime: 2.2, // seconds after respawn
  cometTrailSampleRate: 0.014,
  cometTrailMaxLength: 85, // Long sweeping bright trail

  // Gravity well placement & physics
  wellMaxCharges: 5,
  wellChargeRefillSeconds: 4.2,
  wellDuration: 4.8,
  wellMinHoldSeconds: 0.12,
  wellMaxHoldSeconds: 1.1,
  wellBaseMass: 26000,
  wellMaxMass: 78000,
  wellBaseRadius: 40,
  wellPullRadius: 360,
  gravitySofteningSq: 1400, // epsilon^2 to prevent infinite singularity spikes

  // Star gates (enlarged for instant recognition)
  gateRadius: 42,
  gateProximityDistance: 190,
  gateBaseScore: 350,

  // Stardust motes
  stardustRadius: 8,
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

  // Feel & polish timers
  firstRunHintDuration: 6.5,
  sectorBannerDuration: 2.5,
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
