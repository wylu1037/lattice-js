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

  /**
   * Convert the public key to the lattice address
   * 
   * @param publicKey - The public key, the length is 64
   * @returns The lattice address, like `zltc_o2Vb5bf6G8vpvXeanMWrLMJs3E7vq8La8`
   */
  publicKeyToAddress(publicKey: Buffer | string): string;

  /**
   * Hash the data
   * 
   * @param data - The data to hash
   * @returns The hash bytes
   */
  hash(data: Buffer): Buffer;
}
