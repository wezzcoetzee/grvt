/**
 * Tests for environment configuration.
 */

import { assertEquals, assertExists } from "jsr:@std/assert@1";
import { CHAIN_IDS, getEndpointDomains, getEnvConfig } from "../../src/config/mod.ts";
import { GrvtEndpointType, GrvtEnv } from "../../src/types/mod.ts";

// ============================================================
// Tests
// ============================================================

Deno.test("config", async (t) => {
  await t.step("CHAIN_IDS", () => {
    assertEquals(CHAIN_IDS[GrvtEnv.PROD], 325);
    assertEquals(CHAIN_IDS[GrvtEnv.TESTNET], 326);
    assertEquals(CHAIN_IDS[GrvtEnv.DEV], 327);
    assertEquals(CHAIN_IDS[GrvtEnv.STG], 327);
  });

  await t.step("getEnvConfig", async (t) => {
    await t.step("returns config for TESTNET", () => {
      const config = getEnvConfig(GrvtEnv.TESTNET);
      assertExists(config);
      assertExists(config.edge);
      assertExists(config.tradeData);
      assertExists(config.marketData);
      assertEquals(config.chainId, 326);
      assertEquals(config.edge.rpcEndpoint.includes("testnet"), true);
    });

    await t.step("returns config for PROD", () => {
      const config = getEnvConfig(GrvtEnv.PROD);
      assertExists(config);
      assertEquals(config.chainId, 325);
      assertEquals(config.edge.rpcEndpoint.includes("testnet"), false);
    });

    await t.step("returns config for DEV", () => {
      const config = getEnvConfig(GrvtEnv.DEV);
      assertExists(config);
      assertEquals(config.chainId, 327);
      assertEquals(config.edge.rpcEndpoint.includes("dev"), true);
    });

    await t.step("returns config for STG", () => {
      const config = getEnvConfig(GrvtEnv.STG);
      assertExists(config);
      assertEquals(config.chainId, 327);
    });

    await t.step("all URLs are valid HTTPS URLs", () => {
      for (const env of [GrvtEnv.PROD, GrvtEnv.TESTNET, GrvtEnv.DEV, GrvtEnv.STG]) {
        const config = getEnvConfig(env);
        assertEquals(config.edge.rpcEndpoint.startsWith("https://"), true);
        assertEquals(config.tradeData.rpcEndpoint.startsWith("https://"), true);
        assertEquals(config.marketData.rpcEndpoint.startsWith("https://"), true);
      }
    });
  });

  await t.step("getEndpointDomains", async (t) => {
    await t.step("returns domains for TESTNET", () => {
      const domains = getEndpointDomains(GrvtEnv.TESTNET);
      assertExists(domains[GrvtEndpointType.EDGE]);
      assertExists(domains[GrvtEndpointType.TRADE_DATA]);
      assertExists(domains[GrvtEndpointType.MARKET_DATA]);
    });

    await t.step("all domains are valid URLs", () => {
      const domains = getEndpointDomains(GrvtEnv.TESTNET);
      for (const url of Object.values(domains)) {
        assertEquals(url.startsWith("https://"), true);
      }
    });
  });
});
