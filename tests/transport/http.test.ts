/**
 * Tests for the HTTP transport module.
 */

import { assertEquals, assertExists, assertRejects } from "jsr:@std/assert@1";
import { HttpRequestError, HttpTransport } from "../../src/transport/mod.ts";
import { GrvtEndpointType, GrvtEnv } from "../../src/types/mod.ts";
import { getEnvConfig } from "../../src/config/mod.ts";

// ============================================================
// Helpers
// ============================================================

/** One-time mock for global fetch. */
function mockFetch(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Response | Promise<Response>,
): void {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (...args) => {
    try {
      return await handler(...args);
    } finally {
      globalThis.fetch = originalFetch;
    }
  };
}

/** Returns a successful JSON response. */
function jsonResponse(body: unknown = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// ============================================================
// Tests
// ============================================================

Deno.test("HttpTransport", async (t) => {
  await t.step("constructor", async (t) => {
    await t.step("defaults to PROD", () => {
      const transport = new HttpTransport({});
      assertEquals(transport.env, GrvtEnv.PROD);
    });

    await t.step("accepts custom environment", () => {
      const transport = new HttpTransport({ env: GrvtEnv.DEV });
      assertEquals(transport.env, GrvtEnv.DEV);
    });

    await t.step("accepts API key", () => {
      const transport = new HttpTransport({
        env: GrvtEnv.TESTNET,
        apiKey: "test-api-key",
      });
      assertExists(transport);
    });
  });

  await t.step("URL routing", async (t) => {
    await t.step("uses correct endpoint URLs for TESTNET", async () => {
      const transport = new HttpTransport({ env: GrvtEnv.TESTNET });
      const config = getEnvConfig(GrvtEnv.TESTNET);

      // Test MARKET_DATA endpoint
      mockFetch((req) => {
        const url = new URL(req.toString());
        assertEquals(url.origin, new URL(config.marketData.rpcEndpoint).origin);
        return jsonResponse({ result: [] });
      });
      await transport.request(GrvtEndpointType.MARKET_DATA, "full/v1/all_instruments", {});
    });

    await t.step("uses correct endpoint URLs for PROD", async () => {
      const transport = new HttpTransport({ env: GrvtEnv.PROD });
      const config = getEnvConfig(GrvtEnv.PROD);

      mockFetch((req) => {
        const url = new URL(req.toString());
        assertEquals(url.origin, new URL(config.marketData.rpcEndpoint).origin);
        return jsonResponse({ result: [] });
      });
      await transport.request(GrvtEndpointType.MARKET_DATA, "full/v1/all_instruments", {});
    });
  });

  await t.step("request()", async (t) => {
    await t.step("sends POST request with JSON body", async () => {
      mockFetch((_req, init) => {
        assertEquals(init?.method, "POST");
        assertEquals(new Headers(init?.headers).get("Content-Type"), "application/json");
        return jsonResponse({ result: "test" });
      });

      const transport = new HttpTransport({ env: GrvtEnv.TESTNET });
      const result = await transport.request(
        GrvtEndpointType.MARKET_DATA,
        "full/v1/instrument",
        { instrument: "BTC_USDT_Perp" },
      );
      assertEquals(result, { result: "test" });
    });

    await t.step("returns parsed JSON response", async () => {
      const expectedData = { result: { instrument: "BTC_USDT_Perp", tick_size: "0.1" } };
      mockFetch(() => jsonResponse(expectedData));

      const transport = new HttpTransport({ env: GrvtEnv.TESTNET });
      const result = await transport.request(
        GrvtEndpointType.MARKET_DATA,
        "full/v1/instrument",
        {},
      );
      assertEquals(result, expectedData);
    });

    await t.step("throws HttpRequestError on non-200 status", async () => {
      mockFetch(() => new Response("Internal Server Error", { status: 500 }));

      const transport = new HttpTransport({ env: GrvtEnv.TESTNET });
      await assertRejects(
        () => transport.request(GrvtEndpointType.MARKET_DATA, "full/v1/instrument", {}),
        HttpRequestError,
      );
    });

    await t.step("throws HttpRequestError on network error", async () => {
      mockFetch(() => {
        throw new Error("Network error");
      });

      const transport = new HttpTransport({ env: GrvtEnv.TESTNET });
      await assertRejects(
        () => transport.request(GrvtEndpointType.MARKET_DATA, "full/v1/instrument", {}),
        HttpRequestError,
      );
    });
  });

  await t.step("timeout", async (t) => {
    await t.step("respects custom timeout", () => {
      const transport = new HttpTransport({
        env: GrvtEnv.TESTNET,
        timeout: 5000,
      });
      assertExists(transport);
    });
  });

  await t.step("AbortSignal", async (t) => {
    await t.step("respects user abort signal", async () => {
      const transport = new HttpTransport({ env: GrvtEnv.TESTNET });
      const controller = new AbortController();
      controller.abort(new Error("User cancelled"));

      await assertRejects(
        () =>
          transport.request(
            GrvtEndpointType.MARKET_DATA,
            "full/v1/instrument",
            {},
            { signal: controller.signal },
          ),
        HttpRequestError,
      );
    });
  });
});
