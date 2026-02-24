# AGENTS.md — @wezzcoetzee/grvt

Deno-first TypeScript SDK for the GRVT crypto derivatives exchange. Dual-published to JSR and NPM.

## Tech Stack

- **Runtime**: Deno (1.40+)
- **Language**: TypeScript (strict, no `any`, explicit return types)
- **Dependencies**: `@noble/hashes`, `@paulmillr/micro-eth-signer`, `@valibot/valibot`
- **Publishing**: JSR (`npx jsr publish`) + NPM (via `dnt` build in `scripts/build_npm.ts`)

## Module Dependency Order

```
types → config → transport → signing → raw → ccxt
```

Each module has a `mod.ts` barrel export. Root `src/mod.ts` re-exports everything flat.

## Key Commands

```bash
deno fmt              # Format (120 char line width)
deno lint             # Lint (recommended + jsr tags, custom plugins in .dev/)
deno check src/mod.ts # Type check
deno test -A          # Run all tests
```

## Testing Conventions

- Pattern: `Deno.test("suite", async (t) => { await t.step("case", ...) })`
- Assertions: `assertEquals`, `assertExists`, `assertRejects`, `assertThrows` from `jsr:@std/assert@1`
- HTTP tests mock `globalThis.fetch` directly
- Integration tests need `GRVT_PRIVATE_KEY` and `GRVT_API_KEY` env vars (testnet)

## Code Conventions

- Private fields use `#` syntax, not `private` keyword
- Top-level functions use `function` declarations, not arrow syntax
- PascalCase for types/interfaces/enums/classes; camelCase for functions/methods
- Error messages: start uppercase, no trailing period, no contractions
- Internal files prefixed with `_` (e.g., `_base.ts`, `_privateKeySigner.ts`)
- Minimize dependencies — prefer small, auditable packages
- All timestamps: unix nanoseconds as strings. All prices: 9-decimal fixed-point as strings.

## Architecture Overview

Two client tiers:

- **`GrvtRawClient`** (`src/raw/`) — 1:1 API mapping, returns raw response types
- **`GrvtClient`** (`src/ccxt/`) — CCXT-style ergonomic wrapper, handles signing/markets

Transport layer (`src/transport/`):

- `HttpTransport` — cookie-based auth, auto-refresh
- `WebSocketTransport` — pub/sub with auto-resubscribe, 30s keepalive

Signing (`src/signing/`):

- EIP-712 typed data signing for orders
- Wallet-agnostic: supports viem, ethers v5/v6, or built-in `PrivateKeySigner`
- Chain IDs: PROD=325, TESTNET=326, DEV/STG=327

## CI/CD

| Workflow            | Trigger | Purpose                                |
| ------------------- | ------- | -------------------------------------- |
| `deno_fmt_lint.yml` | PR      | Format + lint check                    |
| `deno_tests.yml`    | PR      | Full test suite + coverage (Coveralls) |
| `publish_jsr.yml`   | Release | Publish to JSR                         |
| `publish_npm.yml`   | Release | Build via dnt + publish to NPM         |

## Adding New Functionality

See [CONTRIBUTING.md](CONTRIBUTING.md) for step-by-step guides on adding API methods, transport changes, and config
updates.

## Related Docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — detailed technical architecture
- [docs/SECURITY.md](docs/SECURITY.md) — auth model and signing
- [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) — quality standards
