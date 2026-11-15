/**
 * Comet Warden - HUD & Screen Overlays
 * Crisp, legible HUD during gameplay and deliberate distinct screens for Title, Pause, Victory, and Game Over.
 */

import { PALETTE, TUNING } from './config.js';

function formatNumber(num) {
  return Math.floor(num).toLocaleString('en-US');
}

/**
 * Draws the high-visibility tactical HUD during active gameplay.
 */
export function drawHUD(ctx, state) {
  ctx.save();
  const width = TUNING.viewWidth;
  const height = TUNING.viewHeight;

  // Text shadow helper
  ctx.shadowColor = PALETTE.hudShadow;
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;

  // ----------------- TOP LEFT: Sector & Gate Progress -----------------
  ctx.fillStyle = PALETTE.hudPanelBg;
  ctx.strokeStyle = PALETTE.hudPanelBorder;
  ctx.lineWidth = 1;

  // Sector title banner
  ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.accentCyan;
  ctx.fillText(`SECTOR ${state.sectorNumber || 1} · ${(state.sectorName || '').toUpperCase()}`, 30, 38);

  ctx.font = '600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudText;
  const req = state.gatesRequired || 3;
  const passed = state.gatesPassedCount || 0;
  ctx.fillText(`GATES SEALED: ${passed} / ${req}`, 30, 64);

  // Small gate progress pips
  for (let i = 0; i < req; i++) {
    ctx.beginPath();
    ctx.arc(36 + i * 20, 80, 5.5, 0, Math.PI * 2);
    if (i < passed) {
      ctx.fillStyle = PALETTE.gateMagenta;
      ctx.fill();
    } else if (i === passed) {
      ctx.fillStyle = PALETTE.gateMagentaLight;
      ctx.fill();
      ctx.strokeStyle = PALETTE.gateWhite;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = PALETTE.gateInactive;
      ctx.fill();
    }
  }

  // ----------------- TOP RIGHT: Score, Best, Stardust -----------------
  ctx.textAlign = 'right';
  ctx.font = '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudText;
  ctx.fillText(`SCORE: ${formatNumber(state.score || 0)}`, width - 30, 40);

  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudTextDim;
  ctx.fillText(`BEST: ${formatNumber(state.bestScore || 0)}`, width - 30, 64);

  // Stardust counter
  ctx.font = '700 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.stardustAmber;
  ctx.fillText(`✦ STARDUST: ${state.stardustCount || 0}`, width - 30, 88);

  // ----------------- BOTTOM LEFT: Lives & Well Charges -----------------
  ctx.textAlign = 'left';

  // Warden lives (diamond pips)
  ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudTextDim;
  ctx.fillText('WARDEN LIVES', 30, height - 76);

  const lives = state.lives !== undefined ? state.lives : 3;
  for (let i = 0; i < TUNING.maxLives; i++) {
    const px = 38 + i * 26;
    const py = height - 58;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.rect(-7, -7, 14, 14);
    if (i < lives) {
      ctx.fillStyle = PALETTE.hudLifePip;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else {
      ctx.fillStyle = PALETTE.hudLifeLost;
      ctx.fill();
    }
    ctx.restore();
  }

  // Well Charges
  ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudTextDim;
  ctx.fillText('GRAVITY CHARGES', 130, height - 76);

  const maxCharges = TUNING.wellMaxCharges;
  const currentCharges = Math.floor(state.wellCharges || 0);
  const rechargeFrac = (state.wellCharges || 0) % 1;

  for (let i = 0; i < maxCharges; i++) {
    const bx = 130 + i * 22;
    const by = height - 66;
    const bw = 17;
    const bh = 14;

    ctx.fillStyle = PALETTE.hudChargeEmpty;
    ctx.fillRect(bx, by, bw, bh);

    if (i < currentCharges) {
      ctx.fillStyle = PALETTE.hudChargeBar;
      ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
    } else if (i === currentCharges && rechargeFrac > 0.05) {
      ctx.fillStyle = 'rgba(255, 179, 92, 0.45)';
      ctx.fillRect(bx + 1, by + 1 + (1 - rechargeFrac) * (bh - 2), bw - 2, rechargeFrac * (bh - 2));
    }

    ctx.strokeStyle = 'rgba(255, 179, 92, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
  }

  // ----------------- BOTTOM RIGHT: Pulse Cooldown & Thrust -----------------
  ctx.textAlign = 'right';
  const pulseReady = (state.repulsorCooldownTimer || 0) <= 0;
  const pulseFrac = Math.max(0, Math.min(1, 1 - (state.repulsorCooldownTimer || 0) / TUNING.repulsorCooldown));

  ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = pulseReady ? PALETTE.accentCyan : PALETTE.hudTextDim;
  ctx.fillText(pulseReady ? 'REPULSOR [SPACE]: READY' : `REPULSOR [SPACE]: ${Math.ceil(state.repulsorCooldownTimer)}s`, width - 30, height - 68);

  // Pulse energy meter
  const meterW = 160;
  const meterH = 8;
  const meterX = width - 30 - meterW;
  const meterY = height - 58;

  ctx.fillStyle = 'rgba(20, 30, 60, 0.7)';
  ctx.fillRect(meterX, meterY, meterW, meterH);
  ctx.fillStyle = pulseReady ? PALETTE.accentCyan : 'rgba(127, 242, 224, 0.45)';
  ctx.fillRect(meterX, meterY, meterW * pulseFrac, meterH);
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(meterX, meterY, meterW, meterH);

  ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudTextMuted;
  ctx.fillText('EMERGENCY THRUST [WASD]', width - 30, height - 38);

  // ----------------- BOTTOM CENTER: Action Hint Banner -----------------
  ctx.textAlign = 'center';
  ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudTextDim;
  ctx.fillText('HOLD [LMB] Place Well  ·  [RMB / X] Dissolve Wells  ·  [SPACE] Repulsor Pulse  ·  [P] Pause', width / 2, height - 24);

  // ----------------- Mouse Placement Preview -----------------
  if (state.mouse && state.mouse.isDown && state.wellCharges >= 1) {
    const mx = state.mouse.x;
    const my = state.mouse.y;
    const holdRatio = Math.min(1, state.mouse.holdSeconds / TUNING.wellMaxHoldSeconds);
    const radius = TUNING.wellBaseRadius + holdRatio * 25;

    ctx.save();
    ctx.beginPath();
    ctx.arc(mx, my, radius, 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.wellAmberLight;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);
    ctx.stroke();

    // Pull horizon circle
    ctx.beginPath();
    ctx.arc(mx, my, TUNING.wellPullRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 179, 92, 0.18)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.stroke();

    // Central core
    ctx.beginPath();
    ctx.arc(mx, my, 6 + holdRatio * 8, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.wellAmber;
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws the title screen.
 */
export function drawTitleScreen(ctx, bestScore = 0, time = 0) {
  ctx.save();
  const width = TUNING.viewWidth;
  const height = TUNING.viewHeight;

  ctx.shadowColor = PALETTE.hudShadow;
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;

  // Title logo
  ctx.textAlign = 'center';
  ctx.font = '900 58px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.cometMint;
  ctx.fillText('COMET WARDEN', width / 2, 190);

  // Subtitle
  ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.gateMagentaLight;
  ctx.letterSpacing = '4px';
  ctx.fillText('BEND THE RIFT · PRESERVE THE DRIFT', width / 2, 226);

  // One-line premise
  ctx.font = '400 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudText;
  ctx.fillText('You are the Warden of a dying star system. Place gravity wells to curve Ember through star gates.', width / 2, 275);

  // Controls card
  const cardW = 680;
  const cardH = 210;
  const cardX = (width - cardW) / 2;
  const cardY = 320;

  ctx.fillStyle = 'rgba(11, 16, 38, 0.85)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  const controls = [
    { key: '[LMB (HOLD)]', desc: 'Place Gravity Well (longer hold = stronger mass)' },
    { key: '[RMB / X]', desc: 'Dissolve All Active Gravity Wells' },
    { key: '[SPACE]', desc: 'Repulsor Pulse (pushes asteroids away from Ember)' },
    { key: '[W / A / S / D]', desc: 'Emergency Ion Thrust (minor trajectory adjustments)' },
    { key: '[P / ESC]', desc: 'Pause Drift   ·   [M] Mute Audio' },
  ];

  ctx.textAlign = 'left';
  controls.forEach((c, idx) => {
    const cy = cardY + 36 + idx * 34;
    ctx.font = '700 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = PALETTE.wellAmberLight;
    ctx.fillText(c.key, cardX + 32, cy);

    ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = PALETTE.hudText;
    ctx.fillText(c.desc, cardX + 175, cy);
  });

  // Best score
  ctx.textAlign = 'center';
  ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.stardustAmber;
  ctx.fillText(`RECORD DRIFT SCORE: ${formatNumber(bestScore)}`, width / 2, 570);

  // Blinking call to action
  const pulseAlpha = 0.5 + 0.5 * Math.sin(time * 4);
  ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = `rgba(127, 242, 224, ${pulseAlpha})`;
  ctx.fillText('PRESS [ENTER] TO COMMENCE WARDEN PROTOCOL', width / 2, 625);

  ctx.restore();
}

/**
 * Draws the pause screen overlay.
 */
export function drawPauseScreen(ctx) {
  ctx.save();
  const width = TUNING.viewWidth;
  const height = TUNING.viewHeight;

  ctx.fillStyle = 'rgba(5, 8, 20, 0.78)';
  ctx.fillRect(0, 0, width, height);

  ctx.shadowColor = PALETTE.hudShadow;
  ctx.shadowBlur = 10;
  ctx.textAlign = 'center';

  ctx.font = '800 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.accentCyan;
  ctx.fillText('DRIFT SUSPENDED', width / 2, height / 2 - 25);

  ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudText;
  ctx.fillText('Press [P] or [ESC] to resume drift', width / 2, height / 2 + 25);

  ctx.restore();
}

/**
 * Draws the game-over screen when 3 lives are lost.
 */
export function drawGameOverScreen(ctx, stats, time = 0) {
  ctx.save();
  const width = TUNING.viewWidth;
  const height = TUNING.viewHeight;

  // Darkened cosmic shroud
  ctx.fillStyle = 'rgba(8, 10, 24, 0.88)';
  ctx.fillRect(0, 0, width, height);

  ctx.shadowColor = PALETTE.hudShadow;
  ctx.shadowBlur = 12;
  ctx.textAlign = 'center';

  // Title
  ctx.font = '900 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.alertRed;
  ctx.fillText('RIFT CONSUMED', width / 2, 210);

  ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudTextDim;
  ctx.fillText(`Ember shattered in Sector ${stats.sectorNumber || 1}: ${(stats.sectorName || '').toUpperCase()}`, width / 2, 255);

  // Stats Card
  const cardW = 460;
  const cardH = 175;
  const cardX = (width - cardW) / 2;
  const cardY = 295;

  ctx.fillStyle = 'rgba(15, 20, 42, 0.9)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = 'rgba(255, 77, 109, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  ctx.textAlign = 'left';
  ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudTextDim;
  ctx.fillText('FINAL SCORE:', cardX + 36, cardY + 45);
  ctx.fillText('BEST SCORE:', cardX + 36, cardY + 85);
  ctx.fillText('SECTORS SEALED:', cardX + 36, cardY + 125);

  ctx.textAlign = 'right';
  ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudText;
  ctx.fillText(formatNumber(stats.score || 0), cardX + cardW - 36, cardY + 45);
  ctx.fillStyle = PALETTE.accentGold;
  ctx.fillText(formatNumber(stats.bestScore || 0), cardX + cardW - 36, cardY + 85);
  ctx.fillStyle = PALETTE.accentCyan;
  ctx.fillText(`${stats.sectorsSealed || 0} / ${TUNING.totalSectors}`, cardX + cardW - 36, cardY + 125);

  // Restart prompt
  const pulseAlpha = 0.5 + 0.5 * Math.sin(time * 4);
  ctx.textAlign = 'center';
  ctx.font = '700 19px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = `rgba(242, 230, 207, ${pulseAlpha})`;
  ctx.fillText('PRESS [ENTER] OR [R] TO REIGNITE EMBER', width / 2, 530);

  ctx.restore();
}

/**
 * Draws the victory screen upon sealing all 7 sectors.
 */
export function drawVictoryScreen(ctx, stats, time = 0) {
  ctx.save();
  const width = TUNING.viewWidth;
  const height = TUNING.viewHeight;

  // Luminous cosmic shroud
  ctx.fillStyle = 'rgba(7, 14, 32, 0.88)';
  ctx.fillRect(0, 0, width, height);

  ctx.shadowColor = PALETTE.hudShadow;
  ctx.shadowBlur = 12;
  ctx.textAlign = 'center';

  // Title
  ctx.font = '900 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.cometMint;
  ctx.fillText('RIFT SEALED', width / 2, 200);

  ctx.font = '600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.stardustAmber;
  ctx.fillText('ALL SEVEN SECTORS STABILIZED · THE STAR SYSTEM ENDURES', width / 2, 245);

  // Stats Card
  const cardW = 500;
  const cardH = 200;
  const cardX = (width - cardW) / 2;
  const cardY = 285;

  ctx.fillStyle = 'rgba(15, 24, 52, 0.9)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  ctx.textAlign = 'left';
  ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudTextDim;
  ctx.fillText('FINAL SCORE:', cardX + 40, cardY + 45);
  ctx.fillText('ALL-TIME BEST:', cardX + 40, cardY + 85);
  ctx.fillText('TOTAL GATES PASSED:', cardX + 40, cardY + 125);
  ctx.fillText('DRIFT DURATION:', cardX + 40, cardY + 165);

  const durationMin = Math.floor((stats.elapsedSeconds || 0) / 60);
  const durationSec = Math.floor((stats.elapsedSeconds || 0) % 60).toString().padStart(2, '0');

  ctx.textAlign = 'right';
  ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.cometMint;
  ctx.fillText(formatNumber(stats.score || 0), cardX + cardW - 40, cardY + 45);
  ctx.fillStyle = PALETTE.accentGold;
  ctx.fillText(formatNumber(stats.bestScore || 0), cardX + cardW - 40, cardY + 85);
  ctx.fillStyle = PALETTE.gateMagentaLight;
  ctx.fillText(`${stats.totalGatesPassed || 42}`, cardX + cardW - 40, cardY + 125);
  ctx.fillStyle = PALETTE.hudText;
  ctx.fillText(`${durationMin}m ${durationSec}s`, cardX + cardW - 40, cardY + 165);

  // Restart prompt
  const pulseAlpha = 0.5 + 0.5 * Math.sin(time * 4);
  ctx.textAlign = 'center';
  ctx.font = '700 19px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = `rgba(127, 242, 224, ${pulseAlpha})`;
  ctx.fillText('PRESS [ENTER] OR [R] TO COMMENCE NEW DRIFT', width / 2, 545);

  ctx.restore();
}
