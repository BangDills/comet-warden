[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/BangDills/comet-warden/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/BangDills/comet-warden/reward.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

# Comet Warden

**Comet Warden** is an original gravity-well arcade game built for the [make.fun](https://make.fun) bounty `best-game-01`.

## Premise

You are the Warden of a dying star system. One celestial comet, **Ember**, drifts endlessly across the Drift. You never steer Ember directly: instead, you place localized gravitational wells with your mouse pointer and Ember curves around them. 

Bend Ember's cosmic trajectory through ancient star gates that punctuate the rift. Sector after sector, as gates are activated, the cosmic rift stabilizes. Colliding with a drifting asteroid shatters Ember and forfeits one of your three warden lives, restarting the sector near your last passed gate. Floating stardust motes offer valuable score bonuses and hasten gravity well charge replenishment. Seal all seven sectors to preserve the star system before oblivion claims the rift.

## Controls

- **Left Mouse Button (Click & Hold)**: Place a gravity well at the cursor. Holding the button charges the well, expanding its pull radius and gravitational mass upon release.
- **Right Mouse Button / X Key**: Instantly dissolve all active gravity wells to release Ember from gravitational pull.
- **Space**: Fire the emergency repulsor pulse, dispersing nearby asteroids away from Ember (subject to a recharging cooldown gauge).
- **W / A / S / D or Arrow Keys**: Engage low-power emergency ion thrust, expending repulsor energy to make micro-adjustments to Ember's vector.
- **P / Escape**: Toggle game pause.
- **M**: Toggle synthesized audio mute.
- **R / Enter**: Restart run or commence protocol from menu screens.

## Visual & Audio Aesthetics

- **Procedural Canvas Rendering**: 1280x720 canvas rendering with deep indigo space (`#0b1026`), mint comet trail (`#7ff2e0`), warm amber gravity wells (`#ffb35c`), vibrant magenta star gates (`#ff5fa2`), and slate asteroids (`#5a6480`) with luminous rim illumination.
- **Synthesized WebAudio**: 100% procedurally synthesized sound effects without external media files—warm gravity well plucks, resonant gate chimes, deep seismic crash impacts, and celestial victory fanfare.
- **Dynamic Physics & Particles**: Continuous $n$-body gravitational integration, velocity damping, particle shockwaves, and multi-layered parallax starfields.

## Local Development & Play

Run the included standalone standard-library static server with Node 22+:

```bash
node serve.ts
```

Then navigate to `http://localhost:8080` in desktop Google Chrome.

## Entry Submission & Packaging

The repository root entrypoint `main.ts` automates bundling and validation:

```bash
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` replicates `game/` and `screenshots/` into the destination directory and compiles `dossier.json` using `buildDossier` from `vendor/makefun-game.ts`, adhering strictly to make.fun verification constraints:
- `text_max_bytes`: 163,840
- `screenshots`: `{ max: 4, max_bytes: 262,144 }`
- `game_max_files`: 993
- `game_max_bytes`: 50,331,648
- `game_path_max_bytes`: 1,000
