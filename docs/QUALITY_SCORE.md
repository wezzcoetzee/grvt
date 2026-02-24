# Quality Standards

## TypeScript Strictness

- **No `any`**: Use explicit types everywhere. Valibot lint plugin enforces `v.unknown()` over `v.any()`.
- **Explicit return types**: `explicit-function-return-type` and `explicit-module-boundary-types` lint rules enabled.
- **JSR compatibility**: `jsr` lint tag enabled. Published types must not use slow types (opaque/inferred exports).

## Lint Rules

### Deno Built-in

`recommended` + `jsr` tags plus: `eqeqeq`, `no-console`, `no-eval`, `no-throw-literal`, `no-self-compare`, `default-param-last`, `no-inferrable-types`, `no-non-null-asserted-optional-chain`, `no-useless-rename`, `no-sparse-arrays`.

### Custom Plugins (`.dev/`)

**`deno_style_lint_plugin.ts`** — Deno Style Guide enforcement:
- `prefer-private-field` — use `#field` not `private field`
- `no-top-level-arrow-syntax` — use `function` declarations at module level
- `naming-convention` — PascalCase types, camelCase functions, CONSTANT_CASE constants
- `error-message` — uppercase start, no trailing period, no contractions

**`valibot_lint_plugin.ts`** — Valibot schema rules:
- `no-explicit-any` — use `v.unknown()` instead of `v.any()`

## Formatting

- `deno fmt` with 120-character line width
- Enforced in CI (`deno fmt --check`)

## Testing

- All tests run with `deno test -A`
- Coverage uploaded to Coveralls via CI
- Test pattern: nested `Deno.test` → `t.step()` for grouping
- HTTP tests mock `globalThis.fetch` directly
- Signing tests use deterministic keys for reproducible assertions

## CI Enforcement

Every PR must pass:

1. `deno fmt --check`
2. `deno lint`
3. `deno check --doc` (type-checks doc examples)
4. `deno test -A --coverage`

## Dependency Policy

Minimize dependencies. Current production deps:
- `@noble/hashes` — cryptographic hashing
- `@paulmillr/micro-eth-signer` — EIP-712 signing
- `@valibot/valibot` — schema validation

All are small, auditable, single-purpose packages from trusted authors in the crypto ecosystem.
