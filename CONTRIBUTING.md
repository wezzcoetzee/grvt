# Contributing to @wezzcoetzee/grvt

Thank you for your interest in contributing! You can contribute in several ways:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## Development Setup

1. Install [Deno](https://deno.com) (1.40+)
2. Clone the repository
3. Set up your editor with [Deno LSP](https://docs.deno.com/runtime/getting_started/setup_your_environment/)

```bash
# Clone
git clone https://github.com/wezzcoetzee/grvt.git
cd grvt

# Verify setup
deno task check
```

## Project Structure

```text
src/
├── mod.ts              # Main entry point, re-exports all modules
├── _base.ts            # Base error class (GrvtError)
├── types/              # Enums and type definitions
│   ├── mod.ts
│   └── enums.ts
├── config/             # Environment and endpoint configuration
│   ├── mod.ts
│   ├── environment.ts
│   └── endpoints.ts
├── transport/          # HTTP and WebSocket transports
│   ├── mod.ts
│   ├── _base.ts
│   ├── http/
│   └── websocket/
├── signing/            # Order signing utilities
│   ├── mod.ts
│   ├── eip712.ts
│   ├── orderSigning.ts
│   ├── _abstractWallet.ts
│   └── _privateKeySigner.ts
├── raw/                # Low-level API client
│   ├── mod.ts
│   ├── client.ts
│   └── types.ts
└── ccxt/               # High-level CCXT-style client
    ├── mod.ts
    ├── client.ts
    ├── types.ts
    └── utils.ts
```

## Testing

```bash
# Run all tests
deno test -A

# Run specific test file
deno test -A tests/raw/client.test.ts
```

For integration tests, set `GRVT_PRIVATE_KEY` and `GRVT_API_KEY` environment variables with testnet credentials.

## Code Style

Run these commands before submitting:

```bash
# Format code
deno fmt

# Lint
deno lint

# Type check
deno check src/mod.ts
```

## Guidelines

- **Dependencies**: Minimize dependencies. Prefer small, auditable packages (e.g., `@noble/hashes`,
  `@paulmillr/micro-eth-signer`).
- **Types**: Use explicit TypeScript types. Avoid `any`.
- **Testing**: Add tests for new functionality.
- **Documentation**: Update JSDoc comments for public APIs.
- **Commits**: Write clear, concise commit messages.

## Common Tasks

### Add a new API method to GrvtRawClient

1. Add the request/response types to `src/raw/types.ts`
2. Implement the method in `src/raw/client.ts`
3. Add tests in `tests/raw/`
4. Update documentation if needed

### Add a new CCXT-style method to GrvtClient

1. Add parameter types to `src/ccxt/types.ts`
2. Implement the method in `src/ccxt/client.ts`
3. Add tests in `tests/ccxt/`

### Update transport layer

1. Modify files in `src/transport/http/` or `src/transport/websocket/`
2. Update the base interfaces in `src/transport/_base.ts` if needed
3. Re-export new types from `src/transport/mod.ts`

### Add new configuration

1. Update `src/config/environment.ts` or `src/config/endpoints.ts`
2. Re-export from `src/config/mod.ts`
3. Re-export from `src/mod.ts` if it's a public API

## Questions?

Open an issue or discussion if you have questions about contributing.
