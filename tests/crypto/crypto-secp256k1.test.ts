import { NIST } from "@/crypto/crypto-secp256k1";
import { CryptoService } from "@/crypto/crypto";
import { expect } from "chai";

describe("Secp256k1", () => {
  describe("generateKeyPair", () => {
    it("should generate keypair", () => {
      let crypto: CryptoService = new NIST();
      let { privateKey, publicKey } = crypto.generateKeyPair();
      let compressedPublicKey = crypto.compressPublicKey(publicKey);
      const expectedPrivateKeySize = 32;
      const expectedPublicKeySize = 65;
      const expectedCompressedPublicKeySize = 33;
      console.log("privateKey: " + privateKey.toString("hex"));
      console.log("publicKey: " + publicKey.toString("hex"));
      console.log(
        "compressedPublicKey: " + compressedPublicKey.toString("hex")
      );
      expect(privateKey.length).to.equal(expectedPrivateKeySize);
      expect(publicKey.length).to.equal(expectedPublicKeySize);
      expect(compressedPublicKey.length).to.equal(
        expectedCompressedPublicKeySize
      );
    });
  });
});
