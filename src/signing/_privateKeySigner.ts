/**
 * Private key signer implementation using micro-eth-signer.
 */

import { addr, signTyped } from "@paulmillr/micro-eth-signer";
import type { AbstractViemLocalAccount } from "./_abstractWallet.ts";

/**
 * Private key signer implementing the {@link AbstractViemLocalAccount} interface.
 *
 * This allows signing without importing viem or ethers.
 *
 * @example
 * ```ts
 * import { PrivateKeySigner } from "@wezzcoetzee/grvt/signing";
 *
 * const privateKey = "0xabc123..."; // your private key
 * const signer = new PrivateKeySigner(privateKey);
 *
 * console.log(signer.address); // 0x...
 * ```
 */
export class PrivateKeySigner implements AbstractViemLocalAccount {
  #privateKey: `0x${string}`;
  address: `0x${string}`;

  /**
   * Creates a new private key signer.
   *
   * @param privateKey - The private key as a hex string (with or without 0x prefix).
   */
  constructor(privateKey: string) {
    // Ensure the private key has 0x prefix
    this.#privateKey = (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as `0x${string}`;
    this.address = addr.fromSecretKey(this.#privateKey) as `0x${string}`;
  }

  /**
   * Sign typed data using EIP-712.
   *
   * @param params - The EIP-712 typed data parameters.
   * @returns The signature as a hex string.
   */
  signTypedData(params: {
    domain: {
      name?: string;
      version?: string;
      chainId?: number;
      verifyingContract?: `0x${string}`;
      salt?: `0x${string}`;
    };
    types: {
      [key: string]: {
        name: string;
        type: string;
      }[];
    };
    primaryType: string;
    message: Record<string, unknown>;
  }): Promise<`0x${string}`> {
    const signature = signTyped(
      {
        domain: params.domain,
        // deno-lint-ignore no-explicit-any
        types: params.types as any, // micro-eth-signer has strict typing
        primaryType: params.primaryType,
        message: params.message,
      },
      this.#privateKey,
      false, // Don't include EIP-712 prefix in the signature
    ) as `0x${string}`;

    return Promise.resolve(signature);
  }
}
