/**
 * Low-level utilities for signing GRVT transactions.
 *
 * @example Signing an order
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
 *
 * @module
 */

// Abstract wallet
export {
  type AbstractEthersV5Signer,
  type AbstractEthersV6Signer,
  type AbstractViemLocalAccount,
  type AbstractWallet,
  AbstractWalletError,
  getWalletAddress,
  type Signature,
  signTypedData,
  type SignTypedDataParams,
} from "./_abstractWallet.ts";

// Private key signer
export { PrivateKeySigner } from "./_privateKeySigner.ts";

// EIP-712 types and constants
export {
  DEFAULT_SIZE_MULTIPLIER,
  EIP712_ORDER_TYPES,
  getEIP712Domain,
  PRICE_MULTIPLIER,
  TIME_IN_FORCE_VALUES,
} from "./eip712.ts";

// Order signing
export {
  buildCreateOrderPayload,
  generateClientOrderId,
  generateExpiration,
  generateNonce,
  type InstrumentInfo,
  type OrderLeg,
  type OrderParams,
  type SignedOrder,
  signOrder,
} from "./orderSigning.ts";
