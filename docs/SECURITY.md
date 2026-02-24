# Security — Auth & Signing

## API Key Authentication

GRVT uses cookie-based sessions, not bearer tokens.

### Flow

1. Client POSTs API key to `/auth/api_key/login` on the edge endpoint
2. Server returns a `gravity` cookie with an expiration timestamp
3. All subsequent authenticated requests include this cookie
4. `HttpTransport` auto-refreshes the cookie 5 seconds before expiry

### Configuration

```ts
const transport = new HttpTransport({
  env: GrvtEnv.TESTNET,
  apiKey: "your-api-key",
});
```

Authenticated endpoints (trading, account, transfers) set `requiresAuth: true` in request options. The transport handles login transparently.

## EIP-712 Order Signing

Orders are signed using [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed structured data.

### Domain

```ts
{
  name: "GRVT Exchange",
  version: "0",
  chainId: CHAIN_IDS[env],  // PROD=325, TESTNET=326, DEV/STG=327
  verifyingContract: "0x0000000000000000000000000000000000000000"
}
```

No verifying contract — the zero address is used as a placeholder.

### Order Types

```
Order {
  subAccountID: uint64
  isMarket:     bool
  timeInForce:  uint8    (GTT=1, AON=2, IOC=3, FOK=4)
  postOnly:     bool
  reduceOnly:   bool
  legs:         OrderLeg[]
  nonce:        uint32
  expiration:   int64
}

OrderLeg {
  assetID:          uint256   (instrument hash)
  contractSize:     uint64    (size × 10^baseDecimals)
  limitPrice:       uint64    (price × 1e9)
  isBuyingContract: bool
}
```

### Signing Flow

1. `signOrder()` receives human-readable `OrderParams`
2. Converts price to fixed-point (× `PRICE_MULTIPLIER` = 1e9)
3. Converts size to fixed-point (× `10^baseDecimals` from instrument metadata)
4. Generates random nonce (uint32) and expiration (default 30 days, nanosecond timestamp)
5. Signs EIP-712 typed data via wallet abstraction
6. Splits 65-byte signature into `{ r, s, v }`
7. `buildCreateOrderPayload()` converts to snake_case for the API

## Wallet Support

Three wallet types supported via structural typing (no library imports required):

| Wallet | Library | Detection |
|---|---|---|
| `AbstractViemLocalAccount` | viem | has `.address` property |
| `AbstractEthersV6Signer` | ethers v6 | has `.signTypedData()` |
| `AbstractEthersV5Signer` | ethers v5 | has `._signTypedData()` |

### Built-in PrivateKeySigner

For standalone use without viem or ethers:

```ts
import { PrivateKeySigner } from "@wezzcoetzee/grvt/signing";

const signer = new PrivateKeySigner("0x...");
```

Uses `@paulmillr/micro-eth-signer` internally. Private key stored as a `#privateKey` class field (truly private, not accessible via reflection).

## Environment Isolation

Chain IDs prevent cross-environment replay attacks:

| Environment | Chain ID |
|---|---|
| PROD | 325 |
| TESTNET | 326 |
| DEV / STG | 327 |

An order signed for testnet (chainId=326) will be rejected by prod (chainId=325) because the EIP-712 domain differs.

## Private Key Handling

- `PrivateKeySigner` stores keys in `#privateKey` (ES2022 private field)
- Keys are never logged, serialized, or exposed via public API
- The `GrvtClient` accepts either a hex string (creates `PrivateKeySigner`) or an `AbstractWallet` instance
- For production use, prefer external wallet signers (viem/ethers) that integrate with hardware wallets or KMS

## Related

- [ARCHITECTURE.md](../ARCHITECTURE.md) — transport and signing architecture
- `src/signing/eip712.ts` — EIP-712 domain and type definitions
- `src/signing/orderSigning.ts` — signing implementation
- `src/signing/_abstractWallet.ts` — wallet type detection and dispatch
