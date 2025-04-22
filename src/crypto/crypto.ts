import { KeyPair } from "./types";

export interface CryptoService {
  // generate key pair, return private key and public key
  generateKeyPair(): KeyPair;

  // compress public key
  compressPublicKey(publicKey: Buffer | string): Buffer;
}
