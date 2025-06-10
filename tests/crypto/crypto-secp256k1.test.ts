import { CryptoService } from "@/crypto/crypto";
import { NIST } from "@/crypto/crypto-secp256k1";
import { describe, expect, it } from "vitest";

describe("crypto.secp256k1", () => {
  it("should generate keypair", () => {
    const crypto: CryptoService = new NIST();
    const { privateKey, publicKey } = crypto.generateKeyPair();
    const compressedPublicKey = crypto.compressPublicKey(publicKey);
    const expectedPrivateKeySize = 32;
    const expectedPublicKeySize = 65;
    const expectedCompressedPublicKeySize = 33;
    console.info(`privateKey: ${privateKey.toString("hex")}`);
    console.info(`publicKey: ${publicKey.toString("hex")}`);
    console.info(`compressedPublicKey: ${compressedPublicKey.toString("hex")}`);
    expect(privateKey.length).toBe(expectedPrivateKeySize);
    expect(publicKey.length).toBe(expectedPublicKeySize);
    expect(compressedPublicKey.length).toBe(expectedCompressedPublicKeySize);
  });

  it("should get public key from private key", () => {
    const crypto: CryptoService = new NIST();
    const privateKey =
      "0xcba6e816d5d4ae9e6e25ef71a716de60825d6aa4c2b0972d802c771f7543337d";
    const publicKey = crypto.getPublicKeyFromPrivateKey(privateKey);
    expect(publicKey).toBe(
      "0x04aee72e169c300700f4f7121b2885cc79ff6cf5abe862f2c6a72891fb62365ee2cef1f91e9da30060e37c22f8048095cb934439bbe6473239d3070608a4ade7dc"
    );
  });

  it("should sign and verify", () => {
    const crypto: CryptoService = new NIST();
    const privateKey =
      "0xcba6e816d5d4ae9e6e25ef71a716de60825d6aa4c2b0972d802c771f7543337d";
    const publicKey = crypto.getPublicKeyFromPrivateKey(privateKey);
    const data = Buffer.from([
      1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1,
      2, 3, 4, 5, 6, 7, 8
    ]);
    const signature = crypto.sign(data, privateKey);
    const result = crypto.verify(data, signature, publicKey);
    console.info(`signature: ${signature}`);
    expect(result).toBe(true);
  });

  it("should public key to address", () => {
    const crypto: CryptoService = new NIST();
    const publicKey =
      "0x04aee72e169c300700f4f7121b2885cc79ff6cf5abe862f2c6a72891fb62365ee2cef1f91e9da30060e37c22f8048095cb934439bbe6473239d3070608a4ade7dc";
    const address = crypto.publicKeyToAddress(publicKey);
    expect(address).toBe("zltc_hDXyzmrrJhC46zxRvMYL6SWcMMFi3tpLB");
  });
});
