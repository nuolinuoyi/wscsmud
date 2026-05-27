# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Chinese-language MUD (Multi-User Dungeon) game server with a web-based client. Dual-server architecture: an Express web server (`web.js`) and a custom WebSocket game server (`main.js`).

## Commands

```bash
npm install          # Install dependencies
npm start            # Run both web + game servers
npm run web          # Web server only (Express, default port 8088)
npm run os           # Game server only (WebSocket, default port 31300)
npm run dev          # Vite dev server for frontend (port 3333)
npm run build        # Build frontend to www/
```

No test suite or linter is configured.

## Environment

Requires Node.js >= 24.10.0. A `.env` file is needed with: `WEB_PORT`, `WS_PORT`, `MD5_PREFIX`, `SESSION_SECRET`, `DESIV`.

Default admin login: `administrator/123456`.

## Architecture

### Dual-Server Design
- **`web.js`** — Express HTTP server. Serves static frontend from `www/`, exposes REST API at `/api/:className/:methodName` and SSE at `/sse/:className/:methodName`.
- **`main.js`** — Game server. Recursively loads all JS from `os/`, initializes the `WORLD` global, starts WebSocket server.
- **`config.js`** — Shared config. Reads `.env`, validates settings, connects SQLite.

### Game Object Inheritance
`BASE` → `ITEM` → `CHARACTER` → `USER` / `NPC` / `MONSTER`
`BASE` → `ROOM`, `BASE` → `SKILL`, `BASE` → `COMMAND`, `BASE` → `FAMILY`

`BASE.CREATE()` in `os/base.js` loads game objects from JS files using `vm.compileFunction()` for sandboxed execution. Hot-reload is supported via `BASE.UPDATE()`.

### Key Directories
- **`os/`** — Game engine core (world, characters, rooms, skills, items, combat, networking). The README notes this is older code.
- **`world/`** — Game content definitions loaded at runtime by `BASE.CREATE()`:
  - `world/cmd/` — Player commands (action/, skill/, obj/, battle/, comm/, admin/, extend/)
  - `world/map/` — Room definitions by location (yz=Yangzhou, bj=Beijing, etc.)
  - `world/npc/` — NPC definitions by location/faction
  - `world/skill/` — Skill definitions by type and family
  - `world/family/` — Martial arts families (shaolin, wudang, emei, huashan, gaibang, etc.)
  - `world/obj/` — Item/equipment definitions
  - `world/task/` — Quest definitions
  - `world/area/` — Area definitions including dungeons (fb1-fb8)
  - **`world/extends/`** — Hot-reloadable extensions for modifying core engine behavior. Preferred place for new modifications.
- **`src/`** — Frontend (Vite + jQuery). Custom page/component system in `src/base/page.js`. Entry point: `src/startup.js`.
- **`api/`** — Web API layer (user auth, game data). `api/base.js` handles auth via AES-128-CBC + MD5 + sessions.
- **`data/`** — SQLite database layer (`data/sql.js` for DB interface, `data/db.js` for queries).

### Communication Protocol
Frontend connects via WebSocket, sending text commands and receiving either plain text messages or JSON data structures. The `WORLD` global manages the heartbeat loop, connected users, and all game state.

### Key Globals
- `WORLD` — Central game state object (`os/world.js`)
- `BASE` — Root class for all game objects (`os/base.js`)
- `COMMAND` — Base class for player commands, self-registers into `WORLD.COMMANDS`

## Conventions

- Game content (commands, rooms, NPCs, skills, items) is defined as standalone JS files in `world/` — do not put game logic in `os/`.
- Prefer `world/extends/` for modifications to core engine behavior rather than editing `os/` directly.
- Commands in `world/cmd/` self-register when loaded; add new commands by creating a new file in the appropriate subdirectory.
- The frontend uses a custom Page class with `template()` and `mount()` lifecycle methods, not a framework like React.
