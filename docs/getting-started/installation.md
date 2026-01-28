# Installation

## Package Managers

{% tabs %} {% tab title="npm" %}

```bash
npm install @wezzcoetzee/grvt
```

{% endtab %} {% tab title="pnpm" %}

```bash
pnpm add @wezzcoetzee/grvt
```

{% endtab %} {% tab title="yarn" %}

```bash
yarn add @wezzcoetzee/grvt
```

{% endtab %} {% tab title="bun" %}

```bash
bun add @wezzcoetzee/grvt
```

{% endtab %} {% tab title="deno" %}

```bash
deno add jsr:@wezzcoetzee/grvt
```

Or import directly:

```ts
import { GrvtClient } from "jsr:@wezzcoetzee/grvt";
```

{% endtab %} {% endtabs %}

## Platform Requirements

| Platform | Version | Notes                                      |
| -------- | ------- | ------------------------------------------ |
| Deno     | 1.40+   | Native support, recommended                |
| Node.js  | 18+     | Requires fetch polyfill for older versions |
| Bun      | 1.0+    | Full support                               |
| Browsers | Modern  | Full support with bundler                  |

## TypeScript Configuration

The SDK is written in TypeScript and includes type definitions. No additional `@types` packages are needed.

Recommended `tsconfig.json` settings:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

## Verification

Verify the installation by fetching market data:

```ts
import { GrvtEnv, GrvtRawClient } from "@wezzcoetzee/grvt";

const client = new GrvtRawClient({
  env: GrvtEnv.TESTNET,
});

const response = await client.getAllInstruments({ is_active: true });
console.log(`Found ${response.result.length} instruments`);
```

## Next Steps

- [Quick Start](./quick-start.md) - Basic usage examples
- [Core Concepts](../core-concepts/transports.md) - Understand the architecture
