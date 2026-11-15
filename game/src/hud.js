/**
 * Comet Warden - HUD & Screen Overlays
 * Crisp, legible HUD during gameplay and deliberate distinct screens for Title, Pause, Victory, and Game Over.
 */

import { PALETTE, TUNING } from './config.js';

function formatNumber(num) {
  return Math.floor(num).toLocaleString('en-US');
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws the high-visibility tactical HUD during active gameplay.
 * Every line is at least 20px tall on a translucent dark panel with crisp borders.
 * Sector & gates sealed is the largest line.
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

  // ----------------- TOP LEFT: Sector & Gates Sealed (Largest Line) -----------------
  const tlW = 490;
  const tlH = 100;
  const tlX = 24;
  const tlY = 18;

  // Translucent dark panel
  drawRoundedRect(ctx, tlX, tlY, tlW, tlH, 12);
  ctx.fillStyle = 'rgba(10, 15, 38, 0.82)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.50)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Sector title banner (20px bold)
  ctx.textAlign = 'left';
  ctx.font = '800 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.accentCyan;
  ctx.fillText(`SECTOR ${state.sectorNumber || 1} · ${(state.sectorName || '').toUpperCase()}`, tlX + 20, tlY + 34);

  // GATES SEALED (32px bold - LARGEST LINE IN HUD)
  const req = state.gatesRequired || 3;
  const passed = state.gatesPassedCount || 0;
  ctx.font = '900 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  const gatesText = `GATES SEALED: ${passed} / ${req}`;
  ctx.fillText(gatesText, tlX + 20, tlY + 76);

  // Gate progress pips beside gates text
  const textWidth = ctx.measureText(gatesText).width;
  const pipsX = tlX + 20 + textWidth + 18;
  const pipsY = tlY + 66;

  for (let i = 0; i < req; i++) {
    const cx = pipsX + i * 22;
    ctx.beginPath();
    ctx.arc(cx, pipsY, 7.5, 0, Math.PI * 2);
    if (i < passed) {
      ctx.fillStyle = PALETTE.gateMagenta;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (i === passed) {
      ctx.fillStyle = PALETTE.gateMagentaLight;
      ctx.fill();
      ctx.strokeStyle = PALETTE.gateWhite;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = PALETTE.gateInactive;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // ----------------- TOP RIGHT: Score, Best, Stardust -----------------
  const trW = 420;
  const trH = 114;
  const trX = width - trW - 24;
  const trY = 18;

  // Translucent dark panel
  drawRoundedRect(ctx, trX, trY, trW, trH, 12);
  ctx.fillStyle = 'rgba(10, 15, 38, 0.82)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.50)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'right';
  const textRightX = trX + trW - 20;

  // Score (26px bold)
  ctx.font = '900 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`SCORE: ${formatNumber(state.score || 0)}`, textRightX, trY + 36);

  // Best (20px bold)
  ctx.font = '800 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.accentGold;
  ctx.fillText(`RECORD BEST: ${formatNumber(state.bestScore || 0)}`, textRightX, trY + 68);

  // Stardust (20px bold)
  ctx.font = '800 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.stardustAmber;
  ctx.fillText(`✦ STARDUST: ${state.stardustCount || 0}`, textRightX, trY + 100);

  // ----------------- BOTTOM LEFT: Lives & Well Charges -----------------
  const blW = 510;
  const blH = 88;
  const blX = 24;
  const blY = height - blH - 20;

  // Translucent dark panel
  drawRoundedRect(ctx, blX, blY, blW, blH, 12);
  ctx.fillStyle = 'rgba(10, 15, 38, 0.82)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.50)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';

  // Warden lives (20px bold)
  ctx.font = '800 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  const lives = state.lives !== undefined ? state.lives : 3;
  ctx.fillText(`LIVES: ${lives}`, blX + 20, blY + 34);

  // Diamond life pips
  for (let i = 0; i < TUNING.maxLives; i++) {
    const px = blX + 32 + i * 32;
    const py = blY + 62;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.rect(-9, -9, 18, 18);
    if (i < lives) {
      ctx.fillStyle = PALETTE.hudLifePip;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = PALETTE.hudLifeLost;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Well Charges (20px bold)
  ctx.font = '800 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.wellAmberLight;
  const maxCharges = TUNING.wellMaxCharges;
  const currentCharges = Math.floor(state.wellCharges || 0);
  const rechargeFrac = (state.wellCharges || 0) % 1;
  ctx.fillText(`CHARGES: ${currentCharges} / ${maxCharges}`, blX + 230, blY + 34);

  // Large Charge bars
  for (let i = 0; i < maxCharges; i++) {
    const bx = blX + 230 + i * 46;
    const by = blY + 48;
    const bw = 38;
    const bh = 22;

    ctx.fillStyle = PALETTE.hudChargeEmpty;
    ctx.fillRect(bx, by, bw, bh);

    if (i < currentCharges) {
      ctx.fillStyle = PALETTE.hudChargeBar;
      ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
    } else if (i === currentCharges && rechargeFrac > 0.05) {
      ctx.fillStyle = 'rgba(255, 179, 92, 0.55)';
      ctx.fillRect(bx + 1, by + 1 + (1 - rechargeFrac) * (bh - 2), bw - 2, rechargeFrac * (bh - 2));
    }

    ctx.strokeStyle = 'rgba(255, 179, 92, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, bw, bh);
  }

  // ----------------- BOTTOM RIGHT: Pulse Cooldown & Thrust -----------------
  const brW = 440;
  const brH = 88;
  const brX = width - brW - 24;
  const brY = height - brH - 20;

  // Translucent dark panel
  drawRoundedRect(ctx, brX, brY, brW, brH, 12);
  ctx.fillStyle = 'rgba(10, 15, 38, 0.82)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.50)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  const pulseReady = (state.repulsorCooldownTimer || 0) <= 0;
  const pulseFrac = Math.max(0, Math.min(1, 1 - (state.repulsorCooldownTimer || 0) / TUNING.repulsorCooldown));

  // Pulse Cooldown line (20px bold)
  ctx.font = '800 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = pulseReady ? PALETTE.accentCyan : PALETTE.alertRed;
  ctx.fillText(pulseReady ? 'REPULSOR [SPACE]: READY' : `REPULSOR [SPACE]: ${Math.ceil(state.repulsorCooldownTimer)}s`, brX + 20, brY + 34);

  // Pulse energy meter
  const meterW = brW - 40;
  const meterH = 12;
  const meterX = brX + 20;
  const meterY = brY + 44;

  ctx.fillStyle = 'rgba(20, 30, 60, 0.85)';
  ctx.fillRect(meterX, meterY, meterW, meterH);
  ctx.fillStyle = pulseReady ? PALETTE.accentCyan : 'rgba(127, 242, 224, 0.55)';
  ctx.fillRect(meterX, meterY, meterW * pulseFrac, meterH);
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.75)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(meterX, meterY, meterW, meterH);

  // Thrust line (20px bold)
  ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudTextDim;
  ctx.fillText('EMERGENCY THRUST: [W A S D]', brX + 20, brY + 76);

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
    ctx.strokeStyle = 'rgba(255, 179, 92, 0.22)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.stroke();

    // Central core
    ctx.beginPath();
    ctx.arc(mx, my, 7 + holdRatio * 9, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.wellAmber;
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws the title screen.
 * Bold, high-contrast typography designed to be clear and readable when scaled to 768x480.
 */
export function drawTitleScreen(ctx, bestScore = 0, time = 0) {
  ctx.save();
  const width = TUNING.viewWidth;
  const height = TUNING.viewHeight;

  ctx.shadowColor = PALETTE.hudShadow;
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;

  // Title logo
  ctx.textAlign = 'center';
  ctx.font = '900 76px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.shadowColor = 'rgba(127, 242, 224, 0.85)';
  ctx.shadowBlur = 28;
  const titleGrad = ctx.createLinearGradient(0, 100, 0, 180);
  titleGrad.addColorStop(0, '#ffffff');
  titleGrad.addColorStop(0.5, '#c8fff7');
  titleGrad.addColorStop(1, PALETTE.cometMint);
  ctx.fillStyle = titleGrad;
  ctx.fillText('COMET WARDEN', width / 2, 160);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.strokeText('COMET WARDEN', width / 2, 160);

  // Subtitle
  ctx.shadowBlur = 8;
  ctx.font = '800 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.gateMagentaLight;
  ctx.letterSpacing = '4px';
  ctx.fillText('BEND THE RIFT · PRESERVE THE DRIFT', width / 2, 202);

  // One-line premise
  ctx.letterSpacing = 'normal';
  ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('You are the Warden of a dying star system. Place gravity wells to curve Ember through star gates.', width / 2, 246);

  // Controls card (enlarged for 768x480 legibility)
  const cardW = 860;
  const cardH = 240;
  const cardX = (width - cardW) / 2;
  const cardY = 280;

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 14);
  ctx.fillStyle = 'rgba(12, 18, 48, 0.82)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.50)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const controls = [
    { key: '[LMB HOLD]', desc: 'Place Gravity Well (longer hold = stronger mass pull)' },
    { key: '[RMB / X]', desc: 'Dissolve All Active Gravity Wells instantly' },
    { key: '[SPACE]', desc: 'Repulsor Pulse (pushes asteroids away from Ember)' },
    { key: '[WASD]', desc: 'Emergency Ion Thrust (minor trajectory adjustments)' },
    { key: '[P / ESC]', desc: 'Pause Drift   ·   [M] Toggle Audio Mute' },
  ];

  ctx.textAlign = 'left';
  controls.forEach((c, idx) => {
    const cy = cardY + 38 + idx * 42;
    ctx.font = '800 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = PALETTE.wellAmberLight;
    ctx.fillText(c.key, cardX + 36, cy);

    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(c.desc, cardX + 225, cy);
  });

  // Best score
  ctx.textAlign = 'center';
  ctx.font = '800 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.stardustAmber;
  ctx.fillText(`✦ RECORD DRIFT SCORE: ${formatNumber(bestScore)} ✦`, width / 2, 566);

  // Blinking call to action
  const pulseAlpha = 0.55 + 0.45 * Math.sin(time * 4);
  ctx.font = '900 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = `rgba(127, 242, 224, ${pulseAlpha})`;
  ctx.shadowColor = 'rgba(127, 242, 224, 0.8)';
  ctx.shadowBlur = 16;
  ctx.fillText('PRESS [ENTER] TO COMMENCE WARDEN PROTOCOL', width / 2, 630);

  ctx.restore();
}

/**
 * Draws the pause screen overlay.
 */
export function drawPauseScreen(ctx) {
  ctx.save();
  const width = TUNING.viewWidth;
  const height = TUNING.viewHeight;

  ctx.fillStyle = 'rgba(8, 12, 32, 0.78)';
  ctx.fillRect(0, 0, width, height);

  ctx.shadowColor = PALETTE.hudShadow;
  ctx.shadowBlur = 12;
  ctx.textAlign = 'center';

  ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.accentCyan;
  ctx.fillText('DRIFT SUSPENDED', width / 2, height / 2 - 25);

  ctx.font = '600 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.hudText;
  ctx.fillText('Press [P] or [ESC] to resume drift', width / 2, height / 2 + 25);

  ctx.restore();
}

/**
 * Draws the game-over screen when 3 lives are lost.
 * Features a very large, bright headline "RIFT CONSUMED", a one-line subtitle,
 * high-contrast stats cards with big numbers, a clear restart line,
 * and a rich luminous backdrop keeping mean luma above 45.
 */
export function drawGameOverScreen(ctx, stats, time = 0) {
  ctx.save();
  const width = TUNING.viewWidth;
  const height = TUNING.viewHeight;

  // 1. Fiery Supernova & Rift Collapse Radiant Backdrop (high luma)
  const rad1 = ctx.createRadialGradient(width / 2, 220, 40, width / 2, 220, 680);
  rad1.addColorStop(0, 'rgba(255, 59, 96, 0.45)');
  rad1.addColorStop(0.4, 'rgba(185, 45, 120, 0.30)');
  rad1.addColorStop(0.8, 'rgba(70, 30, 95, 0.22)');
  rad1.addColorStop(1, 'rgba(25, 15, 45, 0.0)');
  ctx.fillStyle = rad1;
  ctx.fillRect(0, 0, width, height);

  const rad2 = ctx.createRadialGradient(width / 2, 500, 30, width / 2, 500, 520);
  rad2.addColorStop(0, 'rgba(255, 140, 40, 0.32)');
  rad2.addColorStop(0.6, 'rgba(140, 35, 75, 0.18)');
  rad2.addColorStop(1, 'rgba(15, 10, 30, 0.0)');
  ctx.fillStyle = rad2;
  ctx.fillRect(0, 0, width, height);

  // 2. Main Translucent Glass Frame
  const frameX = 40;
  const frameY = 24;
  const frameW = width - 80;
  const frameH = height - 48;

  drawRoundedRect(ctx, frameX, frameY, frameW, frameH, 20);
  ctx.fillStyle = 'rgba(32, 16, 36, 0.72)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 77, 109, 0.75)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 3. Very large, bright headline "RIFT CONSUMED" (~1/3 of frame height)
  ctx.textAlign = 'center';
  ctx.font = '900 144px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.shadowColor = 'rgba(255, 59, 96, 0.95)';
  ctx.shadowBlur = 36;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  const headGrad = ctx.createLinearGradient(0, 40, 0, 180);
  headGrad.addColorStop(0, '#ffffff');
  headGrad.addColorStop(0.45, '#ffd0dc');
  headGrad.addColorStop(1, '#ff3b60');
  ctx.fillStyle = headGrad;
  ctx.fillText('RIFT CONSUMED', width / 2, 165);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 2;
  ctx.strokeText('RIFT CONSUMED', width / 2, 165);

  // 4. One-line subtitle
  ctx.shadowColor = PALETTE.hudShadow;
  ctx.shadowBlur = 8;
  ctx.font = '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffd48f';
  ctx.fillText(
    `EMBER SHATTERED IN SECTOR ${stats.sectorNumber || 1}: ${(stats.sectorName || 'ANOMALY').toUpperCase()} · GRAVITATIONAL MATRIX COLLAPSED`,
    width / 2,
    212
  );

  // 5. Stats Cards with Big Numbers (Score, Best, Sectors Sealed)
  const cardY = 245;
  const cardH = 210;
  const cardW = 360;

  // Card 1: Final Score
  const c1X = 70;
  drawRoundedRect(ctx, c1X, cardY, cardW, cardH, 14);
  ctx.fillStyle = 'rgba(52, 20, 42, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 77, 109, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffb8c6';
  ctx.fillText('FINAL DRIFT SCORE', c1X + 24, cardY + 40);

  ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ff4d6d';
  ctx.shadowBlur = 14;
  ctx.fillText(formatNumber(stats.score || 0), c1X + 24, cardY + 110);

  ctx.shadowBlur = 4;
  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#dbe4f5';
  ctx.fillText(`SECTOR GATES: ${stats.gatesPassedCount || 0} / ${stats.gatesRequired || 3}`, c1X + 24, cardY + 172);

  // Card 2: All-Time Record Best
  const c2X = 460;
  drawRoundedRect(ctx, c2X, cardY, cardW, cardH, 14);
  ctx.fillStyle = 'rgba(52, 20, 42, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 200, 87, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffd48f';
  ctx.fillText('ALL-TIME RECORD', c2X + 24, cardY + 40);

  ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.accentGold;
  ctx.shadowColor = '#ffd48f';
  ctx.shadowBlur = 14;
  ctx.fillText(formatNumber(stats.bestScore || 0), c2X + 24, cardY + 110);

  ctx.shadowBlur = 4;
  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffe875';
  ctx.fillText('SYSTEM RECORD PRESERVED', c2X + 24, cardY + 172);

  // Card 3: Sectors Sealed
  const c3X = 850;
  drawRoundedRect(ctx, c3X, cardY, cardW, cardH, 14);
  ctx.fillStyle = 'rgba(52, 20, 42, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#a5b4d4';
  ctx.fillText('SECTORS SEALED', c3X + 24, cardY + 40);

  ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.accentCyan;
  ctx.shadowColor = '#7ff2e0';
  ctx.shadowBlur = 14;
  ctx.fillText(`${stats.sectorsSealed || 0} / ${TUNING.totalSectors}`, c3X + 24, cardY + 110);

  ctx.shadowBlur = 4;
  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.accentCyan;
  ctx.fillText(`REACHED SECTOR ${stats.sectorNumber || 1}`, c3X + 24, cardY + 172);

  // 6. Clear "PRESS R TO DRIFT AGAIN" line
  const btnW = 600;
  const btnH = 62;
  const btnX = (width - btnW) / 2;
  const btnY = 525;

  drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 31);
  ctx.fillStyle = 'rgba(80, 25, 45, 0.88)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 77, 109, 0.90)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const pulseAlpha = 0.65 + 0.35 * Math.sin(time * 4);
  ctx.textAlign = 'center';
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
  ctx.shadowColor = '#ff4d6d';
  ctx.shadowBlur = 18;
  ctx.fillText('▶  PRESS R TO DRIFT AGAIN  ◀', width / 2, btnY + 42);

  // Secondary hint
  ctx.shadowBlur = 6;
  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffb8c6';
  ctx.fillText('PRESS [ENTER] OR [R] TO REIGNITE THE EMBER PROTOCOL', width / 2, 630);

  ctx.restore();
}

/**
 * Draws the victory screen upon sealing all 7 sectors.
 * Features a very large, bright headline "RIFT SEALED" (~1/3 of frame height),
 * a one-line subtitle, high-contrast stats cards with big numbers
 * (score, best, sectors sealed, gates passed, drift time),
 * a clear "PRESS R TO DRIFT AGAIN" line, and a luminous backdrop keeping mean luma above 45.
 */
export function drawVictoryScreen(ctx, stats, time = 0) {
  ctx.save();
  const width = TUNING.viewWidth;
  const height = TUNING.viewHeight;

  // 1. Radiant Celestial Aurora & Nebula Backdrop (high luma)
  const rad1 = ctx.createRadialGradient(width / 2, 220, 50, width / 2, 220, 720);
  rad1.addColorStop(0, 'rgba(127, 242, 224, 0.45)');
  rad1.addColorStop(0.4, 'rgba(145, 52, 175, 0.32)');
  rad1.addColorStop(0.8, 'rgba(45, 60, 140, 0.22)');
  rad1.addColorStop(1, 'rgba(20, 25, 60, 0.0)');
  ctx.fillStyle = rad1;
  ctx.fillRect(0, 0, width, height);

  const rad2 = ctx.createRadialGradient(width / 2, 500, 40, width / 2, 500, 550);
  rad2.addColorStop(0, 'rgba(255, 200, 87, 0.35)');
  rad2.addColorStop(0.6, 'rgba(127, 242, 224, 0.20)');
  rad2.addColorStop(1, 'rgba(15, 20, 50, 0.0)');
  ctx.fillStyle = rad2;
  ctx.fillRect(0, 0, width, height);

  // 2. Main Translucent Glass Frame
  const frameX = 40;
  const frameY = 24;
  const frameW = width - 80;
  const frameH = height - 48;

  drawRoundedRect(ctx, frameX, frameY, frameW, frameH, 20);
  ctx.fillStyle = 'rgba(16, 24, 58, 0.70)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.75)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 3. Very large, bright headline "RIFT SEALED" (~1/3 of frame height)
  ctx.textAlign = 'center';
  ctx.font = '900 150px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.shadowColor = 'rgba(127, 242, 224, 0.95)';
  ctx.shadowBlur = 38;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  const headGrad = ctx.createLinearGradient(0, 40, 0, 180);
  headGrad.addColorStop(0, '#ffffff');
  headGrad.addColorStop(0.45, '#d4fff8');
  headGrad.addColorStop(1, PALETTE.cometMint);
  ctx.fillStyle = headGrad;
  ctx.fillText('RIFT SEALED', width / 2, 165);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.90)';
  ctx.lineWidth = 2;
  ctx.strokeText('RIFT SEALED', width / 2, 165);

  // 4. One-line subtitle
  ctx.shadowColor = PALETTE.hudShadow;
  ctx.shadowBlur = 8;
  ctx.font = '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffe875';
  ctx.fillText('ALL 7 SECTORS STABILIZED · COSMIC EQUILIBRIUM RESTORED', width / 2, 210);

  // 5. Stats Cards with Big Numbers (Score, Best, Sectors, Gates, Time)
  // Row 1: Score & Best Record
  const r1Y = 238;
  const r1H = 114;
  const r1W = 560;

  // Score Card
  const sCardX = 70;
  drawRoundedRect(ctx, sCardX, r1Y, r1W, r1H, 12);
  ctx.fillStyle = 'rgba(24, 38, 85, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#a5b4d4';
  ctx.fillText('FINAL DRIFT SCORE', sCardX + 24, r1Y + 34);

  ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#7ff2e0';
  ctx.shadowBlur = 14;
  ctx.fillText(formatNumber(stats.score || 0), sCardX + 24, r1Y + 92);

  // Best Record Card
  const bCardX = 650;
  drawRoundedRect(ctx, bCardX, r1Y, r1W, r1H, 12);
  ctx.fillStyle = 'rgba(24, 38, 85, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 200, 87, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffd48f';
  ctx.fillText('ALL-TIME RECORD', bCardX + 24, r1Y + 34);

  ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.accentGold;
  ctx.shadowColor = '#ffd48f';
  ctx.shadowBlur = 14;
  ctx.fillText(formatNumber(stats.bestScore || 0), bCardX + 24, r1Y + 92);

  // Row 2: Sectors Sealed, Gates Passed, Drift Time
  const r2Y = 372;
  const r2H = 114;
  const r2W = 360;

  // Sectors Sealed Card
  const secCardX = 70;
  drawRoundedRect(ctx, secCardX, r2Y, r2W, r2H, 12);
  ctx.fillStyle = 'rgba(24, 38, 85, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '700 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#a5b4d4';
  ctx.fillText('SECTORS SEALED', secCardX + 24, r2Y + 33);

  ctx.font = '900 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.accentCyan;
  ctx.shadowColor = '#7ff2e0';
  ctx.shadowBlur = 12;
  ctx.fillText(`${stats.sectorsSealed || 7} / ${TUNING.totalSectors}`, secCardX + 24, r2Y + 88);

  // Gates Passed Card
  const gateCardX = 460;
  drawRoundedRect(ctx, gateCardX, r2Y, r2W, r2H, 12);
  ctx.fillStyle = 'rgba(24, 38, 85, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 77, 148, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '700 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#a5b4d4';
  ctx.fillText('GATES PASSED', gateCardX + 24, r2Y + 33);

  ctx.font = '900 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = PALETTE.gateMagentaLight;
  ctx.shadowColor = '#ff4d94';
  ctx.shadowBlur = 12;
  ctx.fillText(`${stats.totalGatesPassed || 42}`, gateCardX + 24, r2Y + 88);

  // Drift Time Card
  const timeCardX = 850;
  drawRoundedRect(ctx, timeCardX, r2Y, r2W, r2H, 12);
  ctx.fillStyle = 'rgba(24, 38, 85, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '700 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#a5b4d4';
  ctx.fillText('DRIFT DURATION', timeCardX + 24, r2Y + 33);

  const durationMin = Math.floor((stats.elapsedSeconds || 0) / 60);
  const durationSec = Math.floor((stats.elapsedSeconds || 0) % 60).toString().padStart(2, '0');

  ctx.font = '900 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 10;
  ctx.fillText(`${durationMin}m ${durationSec}s`, timeCardX + 24, r2Y + 88);

  // 6. Clear "PRESS R TO DRIFT AGAIN" line
  const btnW = 600;
  const btnH = 62;
  const btnX = (width - btnW) / 2;
  const btnY = 525;

  drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 31);
  ctx.fillStyle = 'rgba(30, 55, 120, 0.88)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(127, 242, 224, 0.90)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const pulseAlpha = 0.65 + 0.35 * Math.sin(time * 4);
  ctx.textAlign = 'center';
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
  ctx.shadowColor = 'rgba(127, 242, 224, 0.8)';
  ctx.shadowBlur = 18;
  ctx.fillText('▶  PRESS R TO DRIFT AGAIN  ◀', width / 2, btnY + 42);

  // Secondary hint
  ctx.shadowBlur = 6;
  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#a5b4d4';
  ctx.fillText('PRESS [ENTER] OR [R] TO COMMENCE NEW DRIFT', width / 2, 630);

  ctx.restore();
}
