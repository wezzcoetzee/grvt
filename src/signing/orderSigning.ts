/**
 * Order signing utilities for GRVT.
 */

import type { GrvtEnv, TimeInForce } from "../types/mod.ts";
import type { CreateOrderRequest } from "../raw/types.ts";
import { type AbstractWallet, getWalletAddress, signTypedData } from "./_abstractWallet.ts";
import {
  DEFAULT_SIZE_MULTIPLIER,
  EIP712_ORDER_TYPES,
  getEIP712Domain,
  PRICE_MULTIPLIER,
  TIME_IN_FORCE_VALUES,
} from "./eip712.ts";

// =============================================================
// Types
// =============================================================

/**
 * Order leg for signing.
 */
export interface OrderLeg {
  /** The instrument symbol (e.g., "BTC_USDT_Perp"). */
  instrument: string;
  /** The size of the order in base units (e.g., 0.01 for 0.01 BTC). */
  size: number | string;
  /** Whether this leg is buying the asset (true) or selling (false). */
  isBuyingAsset: boolean;
  /** The limit price for the order (e.g., 50000 for $50,000). */
  limitPrice: number | string;
}

/**
 * Instrument information needed for signing.
 */
export interface InstrumentInfo {
  /** The instrument hash (asset ID) used in the smart contract. */
  instrumentHash: string;
  /** The number of decimals for the base asset. */
  baseDecimals: number;
}

/**
 * Order parameters for signing.
 */
export interface OrderParams {
  /** The sub-account ID initiating the order. */
  subAccountId: string;
  /** Whether this is a market order. */
  isMarket: boolean;
  /** Time in force for the order. */
  timeInForce: TimeInForce;
  /** Whether the order is post-only. */
  postOnly?: boolean;
  /** Whether the order is reduce-only. */
  reduceOnly?: boolean;
  /** Order legs (supports multi-leg orders). */
  legs: OrderLeg[];
  /** Nonce for the signature (random uint32). */
  nonce: number;
  /** Expiration timestamp in nanoseconds. */
  expiration: string | bigint;
}

/**
 * Signed order result.
 */
export interface SignedOrder {
  /** The sub-account ID. */
  subAccountId: string;
  /** Whether this is a market order. */
  isMarket: boolean;
  /** Time in force. */
  timeInForce: TimeInForce;
  /** Post-only flag. */
  postOnly: boolean;
  /** Reduce-only flag. */
  reduceOnly: boolean;
  /** Order legs. */
  legs: Array<{
    instrument: string;
    size: string;
    limitPrice: string;
    isBuyingAsset: boolean;
  }>;
  /** The signature. */
  signature: {
    signer: string;
    r: string;
    s: string;
    v: number;
    expiration: string;
    nonce: number;
  };
  /** Order metadata. */
  metadata: {
    clientOrderId: string;
  };
}

// =============================================================
// Signing Functions
// =============================================================

/**
 * Generate a random nonce for order signing.
 *
 * @returns A random uint32 value.
 */
export function generateNonce(): number {
  return Math.floor(Math.random() * 0xFFFFFFFF);
}

/**
 * Generate an expiration timestamp for an order.
 *
 * @param durationMs - Duration in milliseconds until expiration (default: 30 days).
 * @returns The expiration timestamp in nanoseconds as a string.
 */
export function generateExpiration(durationMs: number = 30 * 24 * 60 * 60 * 1000): string {
  const expirationMs = Date.now() + durationMs;
  const expirationNs = BigInt(expirationMs) * 1_000_000n;
  return expirationNs.toString();
}

/**
 * Generate a client order ID.
 *
 * Client machines should generate IDs in the range [2^63, 2^64 - 1]
 * to avoid conflicts with Gravity UI generated IDs.
 *
 * @returns A random client order ID as a string.
 */
export function generateClientOrderId(): string {
  // Generate a random number in the range [2^63, 2^64 - 1]
  const min = 2n ** 63n;
  const range = 2n ** 63n; // 2^64 - 2^63 = 2^63
  const randomBigInt = min + BigInt(Math.floor(Math.random() * Number(range)));
  return randomBigInt.toString();
}

/**
 * Sign an order for the GRVT exchange.
 *
 * @param params - The signing parameters.
 * @returns The signed order ready for submission.
 *
 * @example
 * ```ts
 * import { signOrder, PrivateKeySigner, generateNonce, generateExpiration } from "@wezzcoetzee/grvt/signing";
 * import { GrvtEnv, TimeInForce } from "@wezzcoetzee/grvt/types";
 *
 * const signer = new PrivateKeySigner("0x...");
 *
 * const signedOrder = await signOrder({
 *   wallet: signer,
 *   env: GrvtEnv.TESTNET,
 *   order: {
 *     subAccountId: "123456",
 *     isMarket: false,
 *     timeInForce: TimeInForce.GOOD_TILL_TIME,
 *     legs: [{
 *       instrument: "BTC_USDT_Perp",
 *       size: "0.01",
 *       isBuyingAsset: true,
 *       limitPrice: "50000",
 *     }],
 *     nonce: generateNonce(),
 *     expiration: generateExpiration(),
 *   },
 *   instruments: {
 *     "BTC_USDT_Perp": {
 *       instrumentHash: "0x...",
 *       baseDecimals: 9,
 *     },
 *   },
 * });
 * ```
 */
export async function signOrder(params: {
  /** Wallet to sign the order. */
  wallet: AbstractWallet;
  /** The GRVT environment. */
  env: GrvtEnv;
  /** The order parameters. */
  order: OrderParams;
  /** Map of instrument symbols to their info. */
  instruments: Record<string, InstrumentInfo>;
  /** Optional client order ID (will be generated if not provided). */
  clientOrderId?: string;
}): Promise<SignedOrder> {
  const { wallet, env, order, instruments, clientOrderId } = params;

  // Build the legs for signing
  const signingLegs = order.legs.map((leg) => {
    const instrument = instruments[leg.instrument];
    if (!instrument) {
      throw new Error(`Instrument not found: ${leg.instrument}`);
    }

    const sizeMultiplier = BigInt(10 ** instrument.baseDecimals) || DEFAULT_SIZE_MULTIPLIER;
    const size = typeof leg.size === "string" ? parseFloat(leg.size) : leg.size;
    const limitPrice = typeof leg.limitPrice === "string" ? parseFloat(leg.limitPrice) : leg.limitPrice;

    return {
      assetID: instrument.instrumentHash,
      contractSize: BigInt(Math.round(size * Number(sizeMultiplier))),
      limitPrice: BigInt(Math.round(limitPrice * Number(PRICE_MULTIPLIER))),
      isBuyingContract: leg.isBuyingAsset,
    };
  });

  // Build the message for signing
  const message = {
    subAccountID: BigInt(order.subAccountId),
    isMarket: order.isMarket,
    timeInForce: TIME_IN_FORCE_VALUES[order.timeInForce],
    postOnly: order.postOnly ?? false,
    reduceOnly: order.reduceOnly ?? false,
    legs: signingLegs,
    nonce: order.nonce,
    expiration: typeof order.expiration === "string" ? BigInt(order.expiration) : order.expiration,
  };

  // Sign the message
  const domain = getEIP712Domain(env);
  const signature = await signTypedData({
    wallet,
    domain,
    types: EIP712_ORDER_TYPES as unknown as Record<string, Array<{ name: string; type: string }>>,
    primaryType: "Order",
    message: message as unknown as Record<string, unknown>,
  });

  // Get the signer address
  const signerAddress = await getWalletAddress(wallet);

  // Build the signed order
  return {
    subAccountId: order.subAccountId,
    isMarket: order.isMarket,
    timeInForce: order.timeInForce,
    postOnly: order.postOnly ?? false,
    reduceOnly: order.reduceOnly ?? false,
    legs: order.legs.map((leg) => ({
      instrument: leg.instrument,
      size: String(leg.size),
      limitPrice: String(leg.limitPrice),
      isBuyingAsset: leg.isBuyingAsset,
    })),
    signature: {
      signer: signerAddress,
      r: padHex(signature.r),
      s: padHex(signature.s),
      v: signature.v,
      expiration: String(order.expiration),
      nonce: order.nonce,
    },
    metadata: {
      clientOrderId: clientOrderId ?? generateClientOrderId(),
    },
  };
}

/**
 * Pad a hex string to 64 characters (32 bytes).
 */
function padHex(hex: `0x${string}`): string {
  const withoutPrefix = hex.slice(2);
  return `0x${withoutPrefix.padStart(64, "0")}`;
}

/**
 * Build the API payload for creating an order.
 *
 * @param signedOrder - The signed order.
 * @returns The API payload ready for submission.
 */
export function buildCreateOrderPayload(signedOrder: SignedOrder): CreateOrderRequest {
  return {
    order: {
      sub_account_id: signedOrder.subAccountId,
      is_market: signedOrder.isMarket,
      time_in_force: signedOrder.timeInForce,
      post_only: signedOrder.postOnly,
      reduce_only: signedOrder.reduceOnly,
      legs: signedOrder.legs.map((leg) => ({
        instrument: leg.instrument,
        size: leg.size,
        limit_price: leg.limitPrice,
        is_buying_asset: leg.isBuyingAsset,
      })),
      signature: {
        signer: signedOrder.signature.signer,
        r: signedOrder.signature.r,
        s: signedOrder.signature.s,
        v: signedOrder.signature.v,
        expiration: signedOrder.signature.expiration,
        nonce: signedOrder.signature.nonce,
      },
      metadata: {
        client_order_id: signedOrder.metadata.clientOrderId,
      },
    },
  };
}
