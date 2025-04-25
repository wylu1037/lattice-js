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
      log.info("address: " + crypto.publicKeyToAddress(publicKey));
      expect(privateKey.length).to.equal(expectedPrivateKeySize);
      expect(publicKey.length).to.equal(expectedPublicKeySize);
      expect(compressedPublicKey.length).to.equal(expectedCompressedPublicKeySize); 
    });

    it("should sign and verify", () => {
      const privateKey = "b2abf4282ac9be1b61afa64305e1b0eb4b7d0726384d1000486396ff73a66a5d";
      const uncompressedPublicKey = "0422b34bd63db108efb3406fa21d9689b7812c8c8c488226618ae4a3150ce5890e019216c2dda7f2b2331d248bb09ac21d48acdf422e01d9fde8b4e99ee486f39c";
      const crypto: CryptoService = new GM();
      const data = Buffer.from("hello", "utf-8");
      const signature = crypto.sign(data, privateKey);
      const result = crypto.verify(data, signature, uncompressedPublicKey);
      expect(result).to.equal(true);
    });
  });
});