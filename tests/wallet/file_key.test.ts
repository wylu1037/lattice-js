import { Curves } from "@/common";
import {
  decryptFileKey,
  generateCipher,
  generateFileKey
} from "@/wallet/index";

describe("file key", () => {
  it("should generate cipher", () => {
    const cipher = generateCipher(
      "0xb2abf4282ac9be1b61afa64305e1b0eb4b7d0726384d1000486396ff73a66a5d",
      "Root1234",
      Curves.Sm2p256v1
    );
    console.log(JSON.stringify(cipher));
    expect(cipher.isOk()).toBe(true);
  });

  it("should generate file key", () => {
    const result = generateFileKey(
      "0xcf9df32a0382702e4d88cf0e61af415e58eaacbb53decf34952cfeaa54f7d6bb",
      "123",
      Curves.Sm2p256v1
    );
    assert(result.isOk());
    console.log(JSON.stringify(result.value));
  });

  it("should decrypt file key", () => {
    const fileKey = `{"uuid":"2d4c92eb-a38e-4a15-b4ad-9843fc791903","address":"zltc_c24LNZBLwxWrSLgmdGZSqYC2xLFSFYHSh","cipher":{"aes":{"cipher":"aes-128-ctr","iv":"14ced131ebd7641a1720ec9817fac397"},"kdf":{"kdf":"scrypt","kdfParams":{"DKLen":32,"n":262144,"p":1,"r":8,"salt":"ce11518c8b5722ba49a243b34b283cb8b750acdd39cff2c6741683877fb8440b"}},"cipherText":"cb58a1623d3d684fdc644273c0187f751ce8f7e717f45681ad5166678bb76df0","mac":"770c2a95e7050c3b3e7b43298bdc5d2dc3bb1e22737345f1c25281eb72992b25"},"isGM":true}`;
    const result = decryptFileKey(fileKey, "123");
    assert(result.isOk());
    expect(result.value).toBe(
      "0x8e247714ab228e6dcaf664c6ca623426ca50aa0b38cce6e0c2b7627f0155f5cc"
    );
  });
});