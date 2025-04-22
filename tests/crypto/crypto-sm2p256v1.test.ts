import { CryptoService } from "@/crypto/crypto";
import { GM } from "@/crypto/crypto-sm2p256v1";
import { expect } from "chai";
import { log } from "@/logger";

describe("crypto.sm2p256v1", () => {
  describe("generate keypair", () => {
    it("should generate keypair", () => {
      let crypto: CryptoService = new GM();
      let { privateKey, publicKey } = crypto.generateKeyPair();
      let compressedPublicKey = crypto.compressPublicKey(publicKey);
      const expectedPrivateKeySize = 32;
      const expectedPublicKeySize = 65;
      const expectedCompressedPublicKeySize = 33;
      log.info("privateKey: " + privateKey.toString("hex"));
      log.info("publicKey: " + publicKey.toString("hex"));
      log.info("compressedPublicKey: " + compressedPublicKey.toString("hex"));
      expect(privateKey.length).to.equal(expectedPrivateKeySize);
      expect(publicKey.length).to.equal(expectedPublicKeySize);
      expect(compressedPublicKey.length).to.equal(expectedCompressedPublicKeySize); 
    });
  });
});