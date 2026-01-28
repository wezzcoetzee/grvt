/**
 * EIP-712 domain and type definitions for GRVT order signing.
 */

import type { GrvtEnv } from "../types/mod.ts";
import { CHAIN_IDS } from "../config/mod.ts";
import { TimeInForce } from "../types/mod.ts";

/**
 * Get the EIP-712 domain data for GRVT.
 *
 * @param env - The GRVT environment.
 * @returns The EIP-712 domain data.
 *
 * @example
 * ```ts
 * import { getEIP712Domain, GrvtEnv } from "@wezzcoetzee/grvt";
 *
 * const domain = getEIP712Domain(GrvtEnv.TESTNET);
 * // { name: "GRVT Exchange", version: "0", chainId: 326 }
 * ```
 */
export function getEIP712Domain(env: GrvtEnv): { name: string; version: string; chainId: number } {
  return {
    name: "GRVT Exchange",
    version: "0",
    chainId: CHAIN_IDS[env],
  };
}

/**
 * EIP-712 type definitions for GRVT Order signing.
 *
 * These types define the structure of an order for EIP-712 typed data signing.
 */
export const EIP712_ORDER_TYPES = {
  Order: [
    { name: "subAccountID", type: "uint64" },
    { name: "isMarket", type: "bool" },
    { name: "timeInForce", type: "uint8" },
    { name: "postOnly", type: "bool" },
    { name: "reduceOnly", type: "bool" },
    { name: "legs", type: "OrderLeg[]" },
    { name: "nonce", type: "uint32" },
    { name: "expiration", type: "int64" },
  ],
  OrderLeg: [
    { name: "assetID", type: "uint256" },
    { name: "contractSize", type: "uint64" },
    { name: "limitPrice", type: "uint64" },
    { name: "isBuyingContract", type: "bool" },
  ],
} as const;

/**
 * Numeric values for TimeInForce used in signing.
 *
 * The EIP-712 message uses uint8 for timeInForce, so we need to convert
 * the string enum values to their numeric equivalents.
 */
export const TIME_IN_FORCE_VALUES: Record<TimeInForce, number> = {
  [TimeInForce.GOOD_TILL_TIME]: 1,
  [TimeInForce.ALL_OR_NONE]: 2,
  [TimeInForce.IMMEDIATE_OR_CANCEL]: 3,
  [TimeInForce.FILL_OR_KILL]: 4,
};

/**
 * Price multiplier for converting decimal prices to integers.
 * GRVT uses 9 decimal places for prices.
 */
export const PRICE_MULTIPLIER = 1_000_000_000n;

/**
 * Default size multiplier for BTC/ETH contracts.
 * This can be overridden by the instrument's base_decimals.
 */
export const DEFAULT_SIZE_MULTIPLIER = 1_000_000_000n;
