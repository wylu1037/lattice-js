import { CryptoService } from "@/crypto/crypto";
import { NIST } from "@/crypto/crypto-secp256k1";
import { log } from "@/logger";
import { describe, expect, it } from "vitest";

describe("crypto.secp256k1", () => {
  describe("generate keypair", () => {
    it("should generate keypair", () => {
      const crypto: CryptoService = new NIST();
      const { privateKey, publicKey } = crypto.generateKeyPair();
      const compressedPublicKey = crypto.compressPublicKey(publicKey);
      const expectedPrivateKeySize = 32;
      const expectedPublicKeySize = 65;
      const expectedCompressedPublicKeySize = 33;
      log.info(`privateKey: ${privateKey.toString("hex")}`);
      log.info(`publicKey: ${publicKey.toString("hex")}`);
      log.info(
        `compressedPublicKey: ${compressedPublicKey.toString("hex")}`
      );
      expect(privateKey.length).toBe(expectedPrivateKeySize);
      expect(publicKey.length).toBe(expectedPublicKeySize);
      expect(compressedPublicKey.length).toBe(
        expectedCompressedPublicKeySize
      );
    });
  });
});
