/**
 * Abstract wallet interfaces for signing typed data.
 *
 * Supports viem, ethers v5/v6, and custom signers.
 */

import { GrvtError } from "../_base.ts";

// =============================================================
// Ethers V6
// =============================================================

/** Abstract interface for an {@link https://docs.ethers.org/v6/api/providers/#Signer | ethers.js v6} */
export interface AbstractEthersV6Signer {
  signTypedData(
    domain: {
      name: string;
      version: string;
      chainId: number;
      verifyingContract: string;
    },
    types: {
      [key: string]: {
        name: string;
        type: string;
      }[];
    },
    value: Record<string, unknown>,
  ): Promise<string>;
  getAddress(): Promise<string>;
}

// =============================================================
// Ethers V5
// =============================================================

/** Abstract interface for an {@link https://docs.ethers.org/v5/api/signer/ | ethers.js v5} */
export interface AbstractEthersV5Signer {
  _signTypedData(
    domain: {
      name: string;
      version: string;
      chainId: number;
      verifyingContract: string;
    },
    types: {
      [key: string]: {
        name: string;
        type: string;
      }[];
    },
    value: Record<string, unknown>,
  ): Promise<string>;
  getAddress(): Promise<string>;
}

// =============================================================
// Viem
// =============================================================

/** Abstract interface for a {@link https://viem.sh/docs/accounts/local | viem Local Account}. */
export interface AbstractViemLocalAccount {
  signTypedData(
    params: {
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
    },
    options?: unknown,
  ): Promise<`0x${string}`>;
  address: `0x${string}`;
}

// =============================================================
// Abstract Wallet
// =============================================================

/** Abstract interface for a wallet that can sign typed data. */
export type AbstractWallet =
  | AbstractViemLocalAccount
  | AbstractEthersV6Signer
  | AbstractEthersV5Signer;

/** ECDSA signature components. */
export interface Signature {
  /** First 32-byte component of ECDSA signature */
  r: `0x${string}`;
  /** Second 32-byte component of ECDSA signature */
  s: `0x${string}`;
  /** Recovery identifier */
  v: number;
}

/** Thrown when an error occurs in AbstractWallet operations (e.g., signing, getting address). */
export class AbstractWalletError extends GrvtError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AbstractWalletError";
  }
}

// =============================================================
// Type Guards
// =============================================================

function isViemLocalAccount(wallet: AbstractWallet): wallet is AbstractViemLocalAccount {
  return "address" in wallet && "signTypedData" in wallet && typeof wallet.signTypedData === "function";
}

function isEthersV6Signer(wallet: AbstractWallet): wallet is AbstractEthersV6Signer {
  return "signTypedData" in wallet && "getAddress" in wallet && !("_signTypedData" in wallet) && !("address" in wallet);
}

function isEthersV5Signer(wallet: AbstractWallet): wallet is AbstractEthersV5Signer {
  return "_signTypedData" in wallet && "getAddress" in wallet;
}

// =============================================================
// Sign Typed Data
// =============================================================

/** Parameters for EIP-712 typed data signing. */
export interface SignTypedDataParams {
  /** Wallet to sign the data. */
  wallet: AbstractWallet;
  /** EIP-712 domain data. */
  domain: {
    name: string;
    version: string;
    chainId: number;
  };
  /** EIP-712 type definitions. */
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
  /** Primary type being signed. */
  primaryType: string;
  /** Message data to sign. */
  message: Record<string, unknown>;
}

/**
 * Sign typed data using EIP-712.
 *
 * @param params - The signing parameters.
 * @returns The signature components.
 *
 * @throws {AbstractWalletError} When signing fails.
 */
export async function signTypedData(params: SignTypedDataParams): Promise<Signature> {
  const { wallet, domain, types, primaryType, message } = params;

  // GRVT uses a domain without verifyingContract
  const fullDomain = {
    ...domain,
    verifyingContract: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  };

  let signature: `0x${string}`;

  if (isViemLocalAccount(wallet)) {
    try {
      signature = await wallet.signTypedData({
        domain: fullDomain,
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          ...types,
        },
        primaryType,
        message,
      });
    } catch (error) {
      throw new AbstractWalletError("Failed to sign typed data with viem wallet", { cause: error });
    }
  } else if (isEthersV6Signer(wallet)) {
    try {
      signature = await wallet.signTypedData(fullDomain, types, message) as `0x${string}`;
    } catch (error) {
      throw new AbstractWalletError("Failed to sign typed data with ethers v6 wallet", { cause: error });
    }
  } else if (isEthersV5Signer(wallet)) {
    try {
      signature = await wallet._signTypedData(fullDomain, types, message) as `0x${string}`;
    } catch (error) {
      throw new AbstractWalletError("Failed to sign typed data with ethers v5 wallet", { cause: error });
    }
  } else {
    throw new AbstractWalletError("Failed to sign typed data: unknown wallet type");
  }

  return splitSignature(signature);
}

/**
 * Split a hex signature into r, s, v components.
 */
function splitSignature(signature: `0x${string}`): Signature {
  const r = `0x${signature.slice(2, 66)}` as `0x${string}`;
  const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
  const v = parseInt(signature.slice(130, 132), 16);
  return { r, s, v };
}

// =============================================================
// Helpers
// =============================================================

/**
 * Get the wallet address from various wallet types.
 *
 * @param wallet - The wallet to get the address from.
 * @returns The lowercase wallet address.
 *
 * @throws {AbstractWalletError} When getting the address fails.
 */
export async function getWalletAddress(wallet: AbstractWallet): Promise<`0x${string}`> {
  if (isViemLocalAccount(wallet)) {
    return wallet.address.toLowerCase() as `0x${string}`;
  }

  if (isEthersV6Signer(wallet) || isEthersV5Signer(wallet)) {
    try {
      const address = await wallet.getAddress();
      return address.toLowerCase() as `0x${string}`;
    } catch (error) {
      throw new AbstractWalletError("Failed to get address from ethers wallet", { cause: error });
    }
  }

  throw new AbstractWalletError("Failed to get wallet address: unknown wallet type");
}
