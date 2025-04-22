import { sm2 } from "@/crypto/index";
import { log } from "@/logger";

describe("crypto.sm2", () => {
  describe("generate keypair", () => {
    it("should work", () => {
      const keypair = sm2.generateKeyPairHex();
      let unCompressedPublicKey = keypair.publicKey;
      let privateKey = keypair.privateKey;
      let compressedPublicKey = sm2.compressPublicKeyHex(unCompressedPublicKey);
      log.info("unCompressedPublicKey: ", unCompressedPublicKey);
      log.info("compressedPublicKey: ", compressedPublicKey);
      log.info("privateKey: ", privateKey);
    });
  });

  describe("sign and verify", () => {
    it("should work", () => {
      const msgString = "hello";
      const keypair = sm2.generateKeyPairHex();
      let privateKey = keypair.privateKey;
      let unCompressedPublicKey = keypair.publicKey;
      const signature = sm2.doSignature(msgString, privateKey);
      log.info("signature: ", signature);

      let verifyResult = sm2.doVerifySignature(
        msgString,
        signature,
        unCompressedPublicKey
      );
      log.info("verifyResult: ", verifyResult);
    });
  });
});
