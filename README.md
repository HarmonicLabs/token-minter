# Token Minter

Standalone Cardano token minter. Compiles a plu-ts minting policy, lets you connect a CIP-30 wallet, and mints any asset name + amount under a policy parameterized by a name you provide.

## Setup

```bash
cp .env.example .env.local
# edit VITE_BLOCKFROST_URL / VITE_BLOCKFROST_PROJECT_ID / VITE_NETWORK
bun install
bun run dev
```

`bun run dev` first runs `contracts/compile.ts` (plu-ts → `out/tokenPolicy.precompiled.uplc`), then `scripts/uplcToWeb.ts` (binary → `out/scripts.json`), then starts Vite.

## How it works

The plu-ts policy in `contracts/tokenPolicy.ts` is a single function parameterized by a `ByteString`. At runtime the app:

1. Loads the precompiled UPLC body from `out/scripts.json`
2. Applies your input `bytestring` via `Application(body, UPLCConst.byteString(param))`
3. Compiles the result and wraps it in `Script.plutusV3` — so you can have a unique policy hash per parameter

The policy is a free-mint: any asset name and any quantity can be minted under it. The parameter only serves to make the policy id unique.

## Project layout

This repo is **two isolated node projects**:

| Project | Purpose | Key deps |
|---|---|---|
| `./` (root) | Vite/React runtime app | `buildooor`, `cardano-ledger-ts` 0.5.2 (local tgz) |
| `./contracts/` | One-shot plu-ts → UPLC compiler | `plu-ts` (pulls cardano-ledger-ts 0.2.x) |

Each has its own `package.json`, `bun.lock`, and `node_modules`. **Do not merge them.** `plu-ts-offchain` reads `defaultProtocolParameters` from `cardano-ledger-ts` at module-import time and expects the 0.2.x shape (`maxTxExecutionUnits = { steps, memory }`). The runtime app pins `cardano-ledger-ts` to 0.5.2 via `package.json` → `overrides` (different shape: `{ cpu, mem }`), and that override forces every instance — so plu-ts can't get its required version even nested. Trying to install plu-ts as a root devDep breaks `bun run compile` with `TypeError: Invalid argument type in ToBigInt operation`.

The two trees only meet through one artifact: the compiled UPLC bytes at `out/tokenPolicy.precompiled.uplc`, which `contracts/compile.ts` writes and `scripts/uplcToWeb.ts` reads back via buildooor's `parseUPLC`.

### Build pipeline

```
contracts/compile.ts (plu-ts)        →  out/tokenPolicy.precompiled.uplc
        ↓
scripts/uplcToWeb.ts (buildooor)     →  out/scripts.json
        ↓
src/minter/tokenPolicy.ts (buildooor) reads scripts.json at runtime
```

`bun run dev` and `bun run build` chain through `prebuild-scripts` which runs `compile` then `uplc` automatically — you rarely invoke either directly.

### When editing the policy

Edit `contracts/tokenPolicy.ts`, then `bun run compile && bun run uplc` (or just `bun run dev`) to regenerate `out/scripts.json`. The runtime app picks up the change on next reload.

## Network

Set `VITE_BLOCKFROST_URL` and/or `VITE_BLOCKFROST_PROJECT_ID` in `.env.local` to point at any Blockfrost-compatible backend.
