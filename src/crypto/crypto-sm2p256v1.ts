import { CryptoService } from "./crypto";
import { KeyPair } from "./types";

export class GM implements CryptoService {
  generateKeyPair(): KeyPair {
    return { privateKey: Buffer.from(""), publicKey: Buffer.from("") };
  }

  compressPublicKey(publicKey: Buffer | string): Buffer {
    return Buffer.from("0x");
  }
}
