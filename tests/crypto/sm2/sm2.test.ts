import { sm2 } from "../../../src/crypto/index";

describe("crypto.sm2", () => {
  describe("generate keypair", () => {
    it("should work", () => {
      const keypair = sm2.generateKeyPairHex();
      let unCompressedPublicKey = keypair.publicKey;
      let privateKey = keypair.privateKey;
      let compressedPublicKey = sm2.compressPublicKeyHex(unCompressedPublicKey);
      console.log("unCompressedPublicKey: ", unCompressedPublicKey);
      console.log("compressedPublicKey: ", compressedPublicKey);
      console.log("privateKey: ", privateKey);
    });
  });

  describe("sign and verify", () => {
    it("should work", () => {
      const msgString = "hello";
      const keypair = sm2.generateKeyPairHex();
      let privateKey = keypair.privateKey;
      let unCompressedPublicKey = keypair.publicKey;
      const signature = sm2.doSignature(msgString, privateKey);
      console.log("signature: ", signature);

      let verifyResult = sm2.doVerifySignature(
        msgString,
        signature,
        unCompressedPublicKey
      );
      console.log("verifyResult: ", verifyResult);
    });
  });
});
