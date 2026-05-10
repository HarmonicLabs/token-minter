# Token Minter

Standalone Cardano token minter. Compiles a plu-ts minting policy, lets you connect a CIP-30 wallet, and mints any asset name + amount under a policy parameterized by the bytestring you provide.

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

## Network

Set `VITE_BLOCKFROST_URL` and/or `VITE_BLOCKFROST_PROJECT_ID` in `.env.local` to point at any Blockfrost-compatible backend.
