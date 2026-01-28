/**
 * Tests for the signing module.
 */

import { assertEquals, assertExists } from "jsr:@std/assert@1";
import {
  generateClientOrderId,
  generateExpiration,
  generateNonce,
  getEIP712Domain,
  PrivateKeySigner,
  signOrder,
  TIME_IN_FORCE_VALUES,
} from "../../src/signing/mod.ts";
import { GrvtEnv, TimeInForce } from "../../src/types/mod.ts";
import { CHAIN_IDS } from "../../src/config/mod.ts";

// ============================================================
// Test Data
// ============================================================

const TEST_PRIVATE_KEY = "0x822e9959e022b78423eb653a62ea0020cd283e71a2a8133a6ff2aeffaf373cff";

const TEST_INSTRUMENTS = {
  "BTC_USDT_Perp": {
    instrumentHash: "0x030501",
    baseDecimals: 9,
  },
  "ETH_USDT_Perp": {
    instrumentHash: "0x030502",
    baseDecimals: 9,
  },
};

// ============================================================
// Tests
// ============================================================

Deno.test("signing", async (t) => {
  await t.step("PrivateKeySigner", async (t) => {
    await t.step("creates signer from private key", () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY);
      assertExists(signer.address);
      assertEquals(signer.address.startsWith("0x"), true);
      assertEquals(signer.address.length, 42);
    });

    await t.step("address is deterministic", () => {
      const signer1 = new PrivateKeySigner(TEST_PRIVATE_KEY);
      const signer2 = new PrivateKeySigner(TEST_PRIVATE_KEY);
      assertEquals(signer1.address, signer2.address);
    });
  });

  await t.step("getEIP712Domain", async (t) => {
    await t.step("returns correct domain for TESTNET", () => {
      const domain = getEIP712Domain(GrvtEnv.TESTNET);
      assertEquals(domain.name, "GRVT Exchange");
      assertEquals(domain.version, "0");
      assertEquals(domain.chainId, CHAIN_IDS[GrvtEnv.TESTNET]);
    });

    await t.step("returns correct domain for PROD", () => {
      const domain = getEIP712Domain(GrvtEnv.PROD);
      assertEquals(domain.name, "GRVT Exchange");
      assertEquals(domain.version, "0");
      assertEquals(domain.chainId, CHAIN_IDS[GrvtEnv.PROD]);
    });

    await t.step("returns correct domain for DEV", () => {
      const domain = getEIP712Domain(GrvtEnv.DEV);
      assertEquals(domain.chainId, CHAIN_IDS[GrvtEnv.DEV]);
    });

    await t.step("returns correct domain for STG", () => {
      const domain = getEIP712Domain(GrvtEnv.STG);
      assertEquals(domain.chainId, CHAIN_IDS[GrvtEnv.STG]);
    });
  });

  await t.step("TIME_IN_FORCE_VALUES", () => {
    assertEquals(TIME_IN_FORCE_VALUES[TimeInForce.GOOD_TILL_TIME], 1);
    assertEquals(TIME_IN_FORCE_VALUES[TimeInForce.ALL_OR_NONE], 2);
    assertEquals(TIME_IN_FORCE_VALUES[TimeInForce.IMMEDIATE_OR_CANCEL], 3);
    assertEquals(TIME_IN_FORCE_VALUES[TimeInForce.FILL_OR_KILL], 4);
  });

  await t.step("generateNonce", () => {
    const nonce1 = generateNonce();
    const nonce2 = generateNonce();

    // Nonces should be numbers
    assertEquals(typeof nonce1, "number");
    assertEquals(typeof nonce2, "number");

    // Nonces should be positive
    assertEquals(nonce1 > 0, true);
    assertEquals(nonce2 > 0, true);

    // Nonces should be different (with very high probability)
    assertEquals(nonce1 !== nonce2, true);
  });

  await t.step("generateExpiration", async (t) => {
    await t.step("default expiration is 30 days", () => {
      const now = Date.now();
      const expiration = generateExpiration();
      const expirationMs = Number(BigInt(expiration) / 1_000_000n);

      // Should be roughly 30 days from now (with some tolerance)
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const diff = Math.abs(expirationMs - now - thirtyDaysMs);
      assertEquals(diff < 1000, true); // Within 1 second
    });

    await t.step("custom duration works", () => {
      const now = Date.now();
      const oneHourMs = 60 * 60 * 1000;
      const expiration = generateExpiration(oneHourMs);
      const expirationMs = Number(BigInt(expiration) / 1_000_000n);

      const diff = Math.abs(expirationMs - now - oneHourMs);
      assertEquals(diff < 1000, true);
    });
  });

  await t.step("generateClientOrderId", () => {
    const id1 = generateClientOrderId();
    const id2 = generateClientOrderId();

    // IDs should be strings
    assertEquals(typeof id1, "string");
    assertEquals(typeof id2, "string");

    // IDs should be non-empty
    assertEquals(id1.length > 0, true);

    // IDs should be different
    assertEquals(id1 !== id2, true);
  });

  await t.step("signOrder", async (t) => {
    const signer = new PrivateKeySigner(TEST_PRIVATE_KEY);

    await t.step("signs a valid order", async () => {
      const signedOrder = await signOrder({
        wallet: signer,
        env: GrvtEnv.TESTNET,
        order: {
          subAccountId: "123456789",
          isMarket: false,
          timeInForce: TimeInForce.GOOD_TILL_TIME,
          legs: [{
            instrument: "BTC_USDT_Perp",
            size: "0.01",
            isBuyingAsset: true,
            limitPrice: "50000",
          }],
          nonce: 12345,
          expiration: "1893456000000000000", // 2030-01-01
        },
        instruments: TEST_INSTRUMENTS,
      });

      assertExists(signedOrder);
      assertEquals(signedOrder.subAccountId, "123456789");
      assertEquals(signedOrder.isMarket, false);
      assertEquals(signedOrder.timeInForce, TimeInForce.GOOD_TILL_TIME);
      assertEquals(signedOrder.legs.length, 1);
      assertExists(signedOrder.signature);
      assertEquals(signedOrder.signature.r.startsWith("0x"), true);
      assertEquals(signedOrder.signature.s.startsWith("0x"), true);
      assertEquals(typeof signedOrder.signature.v, "number");
    });

    await t.step("signs a market order", async () => {
      const signedOrder = await signOrder({
        wallet: signer,
        env: GrvtEnv.TESTNET,
        order: {
          subAccountId: "123456789",
          isMarket: true,
          timeInForce: TimeInForce.IMMEDIATE_OR_CANCEL,
          legs: [{
            instrument: "ETH_USDT_Perp",
            size: "1.0",
            isBuyingAsset: false,
            limitPrice: "0",
          }],
          nonce: generateNonce(),
          expiration: generateExpiration(),
        },
        instruments: TEST_INSTRUMENTS,
      });

      assertEquals(signedOrder.isMarket, true);
      assertEquals(signedOrder.timeInForce, TimeInForce.IMMEDIATE_OR_CANCEL);
    });
  });
});
