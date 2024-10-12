import { NIST } from "../../src/crypto/crypto-secp256k1";
import { expect } from "chai";
import { CryptoInterface } from "../../src/crypto/crypto";

describe("Secp256k1", () => {
  it("should generate keypair", () => {
    let crypto: CryptoInterface = new NIST();
    let { privateKey, publicKey } = crypto.generateKeyPair();
    let compressedPublicKey = crypto.compressPublicKey(publicKey);
    const expectedPrivateKeySize = 32;
    const expectedPublicKeySize = 65;
    const expectedCompressedPublicKeySize = 33;
    console.log("privateKey: " + privateKey.toString("hex"));
    console.log("publicKey: " + publicKey.toString("hex"));
    console.log("compressedPublicKey: " + compressedPublicKey.toString("hex"));
    expect(privateKey.length).to.equal(expectedPrivateKeySize);
    expect(publicKey.length).to.equal(expectedPublicKeySize);
    expect(compressedPublicKey.length).to.equal(
      expectedCompressedPublicKeySize
    );
  });
});
