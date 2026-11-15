import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = resolve(import.meta.dirname);
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

console.log(`Comet Warden entry build`);
console.log(`Source repository: ${repoRoot}`);
console.log(`Destination output directory: ${outputDir}`);

// Ensure target output directory exists
mkdirSync(outputDir, { recursive: true });

// Copy game/ tree
const srcGame = join(repoRoot, 'game');
const dstGame = join(outputDir, 'game');
if (!existsSync(srcGame)) {
  console.error(`Missing required game directory: ${srcGame}`);
  process.exit(1);
}
mkdirSync(dstGame, { recursive: true });
cpSync(srcGame, dstGame, { recursive: true });

// Copy screenshots/ tree
const srcScreenshots = join(repoRoot, 'screenshots');
const dstScreenshots = join(outputDir, 'screenshots');
if (!existsSync(srcScreenshots)) {
  console.error(`Missing required screenshots directory: ${srcScreenshots}`);
  process.exit(1);
}
mkdirSync(dstScreenshots, { recursive: true });
cpSync(srcScreenshots, dstScreenshots, { recursive: true });

// Build and write dossier.json according to exact bounty specification
const dossierBytes = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(dossierPath, dossierBytes);

console.log(`Wrote dossier.json (${dossierBytes.length} bytes) to ${dossierPath}`);
console.log(`Entry packaging completed successfully.`);
