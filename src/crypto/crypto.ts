import { type Curve, Curves } from "@/common/constants";
import type { KeyPair } from "@/common/index";
import { NIST } from "./crypto-secp256k1";
import { GM } from "./crypto-sm2p256v1";

const cryptoServiceMap = new Map<Curve, CryptoService>();

/**
 * Create a new crypto service instance based on the curve
 * 
 * @param curve The curve, like `Curves.Secp256k1` or `Curves.Sm2p256v1`
 * @returns The crypto service
 */
export function newCrypto(curve: Curve): CryptoService {
if (cryptoServiceMap.has(curve)) {
  return cryptoServiceMap.get(curve) as CryptoService;
}

switch (curve) {
  case Curves.Secp256k1:
    cryptoServiceMap.set(curve, new NIST());
    return cryptoServiceMap.get(curve) as CryptoService;
  case Curves.Sm2p256v1:
    cryptoServiceMap.set(curve, new GM());
    return cryptoServiceMap.get(curve) as CryptoService;
  default:
    throw new Error(`Unsupported curve: ${curve}`);
}
}

export type EncodeFunc = () => Buffer;

export interface CryptoService {
  /**
   * Generate a key pair
   * @returns The key pair
   */
  generateKeyPair(): KeyPair;

  /**
   * Compress the public key
   * @param publicKey - The public key
   * @returns The compressed public key
   */
  compressPublicKey(publicKey: Buffer | string): Buffer;

  /**
   * Convert the public key to the lattice address
   * @param publicKey - The uncompressed public key, the length is 64
   * @returns The lattice address, like `zltc_o2Vb5bf6G8vpvXeanMWrLMJs3E7vq8La8`
   */
  publicKeyToAddress(publicKey: Buffer | string): string;

  /**
   * Get the public key from the private key
   * @param privateKey - The private key, the length is 32 bytes
   * @returns The public key, the length is 65 bytes
   */
  getPublicKeyFromPrivateKey(privateKey: string): string;

  /**
   * Hash the data
   * @param data - The data to hash
   * @returns The hash bytes
   */
  hash(data: Buffer): Buffer;

  /**
   * Encode the hash
   * @param encodeFunc - The encode function
   * @returns The encoded hash
   */
  encodeHash(encodeFunc: EncodeFunc): Buffer;

  /**
   * Sign the data
   * @param data - The data to sign
   * @param privateKey - The private key, the length is 32 bytes
   * @returns The signature
   */
  sign(data: Buffer, privateKey: string): string;

  /**
   * Verify the signature
   * @param data - The data to verify
   * @param signature - The signature
   * @param uncompressedPublicKey - The uncompressed public key, the length is 65 bytes
   * @returns The result of the verification
   */
  verify(
    data: Buffer,
    signature: string,
    uncompressedPublicKey: string
  ): boolean;
}
