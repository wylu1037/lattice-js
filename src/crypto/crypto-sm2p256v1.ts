import { log } from "@/logger";
import { CryptoService } from "./crypto";
import { compressPublicKeyHex, generateKeyPairHex } from "./sm2";
import { KeyPair } from "./types";

export class GM implements CryptoService {
  generateKeyPair(): KeyPair {
    const { privateKey, publicKey: uncompressedPublicKey } = generateKeyPairHex();
    return { privateKey: Buffer.from(privateKey, "hex"), publicKey: Buffer.from(uncompressedPublicKey, "hex") };
  }

  compressPublicKey(publicKey: Buffer | string): Buffer {
    if (typeof publicKey === "string") {
      publicKey = Buffer.from(publicKey, "hex");
    }
    if (publicKey.length != 65) {
      log.error("Invalid uncompressed public key length, expected size is 65, but actual size is %d", publicKey.length);
      throw new Error(`Invalid uncompressed public key length, expected size is 65, but actual size is ${publicKey.length}`);
    }
    const compressedPublicKey = compressPublicKeyHex(publicKey.toString("hex"));
    return Buffer.from(compressedPublicKey, "hex");
  }
}
