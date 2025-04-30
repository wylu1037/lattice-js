import { sm2 } from "@/crypto/index";
import { log } from "@/logger";
import { describe, expect, it } from "vitest";

describe("crypto.sm2", () => {
  describe("generate keypair", () => {
    it("should work", () => {
      const keypair = sm2.generateKeyPairHex();
      const unCompressedPublicKey = keypair.publicKey;
      const privateKey = keypair.privateKey;
      const compressedPublicKey = sm2.compressPublicKeyHex(unCompressedPublicKey);
      log.info(`unCompressedPublicKey: ${unCompressedPublicKey}`);
      log.info(`compressedPublicKey: ${compressedPublicKey}`);
      log.info(`privateKey: ${privateKey}`);
      
      expect(unCompressedPublicKey).toBeDefined();
      expect(privateKey).toBeDefined();
      expect(compressedPublicKey).toBeDefined();
    });
  });

  describe("sign and verify", () => {
    it("should work", () => {
      const msgString = "hello";
      const keypair = sm2.generateKeyPairHex();
      const privateKey = keypair.privateKey;
      const unCompressedPublicKey = keypair.publicKey;
      const signature = sm2.doSignature(msgString, privateKey);
      log.info(`signature: ${signature}`);

      const verifyResult = sm2.doVerifySignature(
        msgString,
        signature,
        unCompressedPublicKey
      );
      log.info(`verifyResult: ${verifyResult}`);
      
      expect(verifyResult).toBe(true);
    });
  });
});
