import { CryptoService } from "@/crypto/crypto";
import { GM } from "@/crypto/crypto-sm2p256v1";
import { log } from "@/logger";
import { describe, expect, it } from "vitest";

describe("crypto.sm2p256v1", () => {
  describe("generate keypair", () => {
    it("should generate keypair", () => {
      const crypto: CryptoService = new GM();
      const { privateKey, publicKey } = crypto.generateKeyPair();
      const compressedPublicKey = crypto.compressPublicKey(publicKey);
      const expectedPrivateKeySize = 32;
      const expectedPublicKeySize = 65;
      const expectedCompressedPublicKeySize = 33;
      log.info(`privateKey: ${privateKey.toString("hex")}`);
      log.info(`publicKey: ${publicKey.toString("hex")}`);
      log.info(`compressedPublicKey: ${compressedPublicKey.toString("hex")}`);
      log.info(`address: ${crypto.publicKeyToAddress(publicKey)}`);
      expect(privateKey.length).toBe(expectedPrivateKeySize);
      expect(publicKey.length).toBe(expectedPublicKeySize);
      expect(compressedPublicKey.length).toBe(expectedCompressedPublicKeySize); 
    });

    it("should sign and verify", () => {
      const privateKey = "b2abf4282ac9be1b61afa64305e1b0eb4b7d0726384d1000486396ff73a66a5d";
      const uncompressedPublicKey = "0422b34bd63db108efb3406fa21d9689b7812c8c8c488226618ae4a3150ce5890e019216c2dda7f2b2331d248bb09ac21d48acdf422e01d9fde8b4e99ee486f39c";
      const crypto: CryptoService = new GM();
      const data = Buffer.from("hello", "utf-8");
      const signature = crypto.sign(data, privateKey);
      const result = crypto.verify(data, signature, uncompressedPublicKey);
      console.log("result", result);
      expect(result).toBe(true);
      // e86f2d5fae7dba2da2d663332dbaa18fb70b19610eda4abc3737df121cca92f475b0bed5a6ff93af1585ae598127e1a82c5fc3a5d69ecb636ed9191b3cdb06ca
    });
  });
});