/**
 * Tests for CCXT utility functions.
 */

import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { msToNs, nowNs, nsToMs, parseSymbol } from "../../src/ccxt/utils.ts";
import { CCXT_INTERVAL_MAP } from "../../src/ccxt/types.ts";

// ============================================================
// Tests
// ============================================================

Deno.test("ccxt utils", async (t) => {
  await t.step("parseSymbol", async (t) => {
    await t.step("parses perpetual symbols", () => {
      const result = parseSymbol("BTC_USDT_Perp");
      assertEquals(result.kind, "PERPETUAL");
      assertEquals(result.base, "BTC");
      assertEquals(result.quote, "USDT");
    });

    await t.step("parses ETH perpetual", () => {
      const result = parseSymbol("ETH_USDT_Perp");
      assertEquals(result.kind, "PERPETUAL");
      assertEquals(result.base, "ETH");
      assertEquals(result.quote, "USDT");
    });

    await t.step("parses future symbols", () => {
      const result = parseSymbol("BTC_USDT_Fut_20Oct23");
      assertEquals(result.kind, "FUTURE");
      assertEquals(result.base, "BTC");
      assertEquals(result.quote, "USDT");
    });

    await t.step("parses call option symbols", () => {
      const result = parseSymbol("ETH_USDT_Call_20Oct23_2800");
      assertEquals(result.kind, "CALL");
      assertEquals(result.base, "ETH");
      assertEquals(result.quote, "USDT");
    });

    await t.step("parses put option symbols", () => {
      const result = parseSymbol("BTC_USDT_Put_20Oct23_50000");
      assertEquals(result.kind, "PUT");
      assertEquals(result.base, "BTC");
      assertEquals(result.quote, "USDT");
    });

    await t.step("throws on invalid symbol", () => {
      assertThrows(
        () => parseSymbol("INVALID"),
        Error,
        "Invalid symbol",
      );
    });

    await t.step("throws on empty symbol", () => {
      assertThrows(
        () => parseSymbol(""),
        Error,
        "Invalid symbol",
      );
    });
  });

  await t.step("msToNs", async (t) => {
    await t.step("converts milliseconds to nanoseconds", () => {
      const ms = 1704067200000; // 2024-01-01 00:00:00 UTC
      const ns = msToNs(ms);
      assertEquals(ns, "1704067200000000000");
    });

    await t.step("handles zero", () => {
      assertEquals(msToNs(0), "0");
    });

    await t.step("handles large timestamps", () => {
      const ms = 1893456000000; // 2030-01-01
      const ns = msToNs(ms);
      assertEquals(ns, "1893456000000000000");
    });
  });

  await t.step("nsToMs", async (t) => {
    await t.step("converts nanoseconds to milliseconds", () => {
      const ns = "1704067200000000000";
      const ms = nsToMs(ns);
      assertEquals(ms, 1704067200000);
    });

    await t.step("handles zero", () => {
      assertEquals(nsToMs("0"), 0);
    });

    await t.step("truncates fractional milliseconds", () => {
      const ns = "1704067200000500000"; // 0.5ms extra
      const ms = nsToMs(ns);
      assertEquals(ms, 1704067200000);
    });
  });

  await t.step("nowNs", () => {
    const before = Date.now();
    const ns = nowNs();
    const after = Date.now();

    // Convert back to ms for comparison
    const timestampMs = nsToMs(ns);

    // Should be within the time window
    assertEquals(timestampMs >= before, true);
    assertEquals(timestampMs <= after, true);
  });

  await t.step("CCXT_INTERVAL_MAP", async (t) => {
    await t.step("has all expected intervals", () => {
      const intervals = Object.keys(CCXT_INTERVAL_MAP);
      assertEquals(intervals.includes("1m"), true);
      assertEquals(intervals.includes("5m"), true);
      assertEquals(intervals.includes("15m"), true);
      assertEquals(intervals.includes("1h"), true);
      assertEquals(intervals.includes("4h"), true);
      assertEquals(intervals.includes("1d"), true);
      assertEquals(intervals.includes("1w"), true);
    });

    await t.step("maps to correct GRVT intervals", () => {
      assertEquals(CCXT_INTERVAL_MAP["1m"], "CI_1_M");
      assertEquals(CCXT_INTERVAL_MAP["1h"], "CI_1_H");
      assertEquals(CCXT_INTERVAL_MAP["1d"], "CI_1_D");
    });
  });
});
