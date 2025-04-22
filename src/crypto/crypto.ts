import { KeyPair } from "./types";

export interface CryptoService {
  /**
   * Generate a key pair
   * 
   * @returns The key pair
   */
  generateKeyPair(): KeyPair;

  /**
   * Compress the public key
   * 
   * @param publicKey - The public key
   * @returns The compressed public key
   */
  compressPublicKey(publicKey: Buffer | string): Buffer;
}
