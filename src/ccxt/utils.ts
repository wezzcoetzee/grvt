/**
 * Utility functions for the CCXT-style client.
 */

import type { Currency, Kind } from "../types/mod.ts";

/**
 * Parse a symbol into kind, underlying (base), and quote components.
 *
 * Supports the following formats:
 * - Perpetual: `BTC_USDT_Perp`
 * - Future: `BTC_USDT_Fut_20Oct23`
 * - Call: `ETH_USDT_Call_20Oct23_2800`
 * - Put: `ETH_USDT_Put_20Oct23_2800`
 *
 * @param symbol - The instrument symbol to parse.
 * @returns An object with kind, base, and quote currencies.
 * @throws Error if the symbol format is invalid.
 *
 * @example
 * ```ts ignore
 * const { kind, base, quote } = parseSymbol("BTC_USDT_Perp");
 * // { kind: "PERPETUAL", base: "BTC", quote: "USDT" }
 * ```
 */
export function parseSymbol(symbol: string): { kind: Kind; base: Currency; quote: Currency } {
  const parts = symbol.split("_");

  if (parts.length === 3) {
    // Perpetual: BTC_USDT_Perp
    const [base, quote, kindStr] = parts;
    const kind = kindStr === "Perp" ? "PERPETUAL" : kindStr.toUpperCase();
    return { kind: kind as Kind, base: base as Currency, quote: quote as Currency };
  }

  if (parts.length === 4) {
    // Future: BTC_USDT_Fut_20Oct23
    const [base, quote, kindStr] = parts;
    const kind = kindStr === "Fut" ? "FUTURE" : kindStr.toUpperCase();
    return { kind: kind as Kind, base: base as Currency, quote: quote as Currency };
  }

  if (parts.length === 5) {
    // Option: ETH_USDT_Call_20Oct23_2800 or ETH_USDT_Put_20Oct23_2800
    const [base, quote, kindStr] = parts;
    const kind = kindStr.toUpperCase();
    if (kind !== "CALL" && kind !== "PUT") {
      throw new Error(`Invalid symbol: ${symbol}`);
    }
    return { kind: kind as Kind, base: base as Currency, quote: quote as Currency };
  }

  throw new Error(`Invalid symbol: ${symbol}`);
}

/**
 * Convert a nanosecond timestamp to milliseconds.
 *
 * @param nsTimestamp - Timestamp in nanoseconds (as string).
 * @returns Timestamp in milliseconds.
 */
export function nsToMs(nsTimestamp: string): number {
  return Math.floor(Number(BigInt(nsTimestamp) / 1_000_000n));
}

/**
 * Convert a millisecond timestamp to nanoseconds.
 *
 * @param msTimestamp - Timestamp in milliseconds.
 * @returns Timestamp in nanoseconds (as string).
 */
export function msToNs(msTimestamp: number): string {
  return (BigInt(msTimestamp) * 1_000_000n).toString();
}

/**
 * Get the current timestamp in nanoseconds.
 *
 * @returns Current timestamp in nanoseconds (as string).
 */
export function nowNs(): string {
  return msToNs(Date.now());
}
