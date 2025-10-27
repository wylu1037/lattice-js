import { Curves } from "@/common";
import {
  decryptFileKey,
  generateCipher,
  generateFileKey
} from "@/wallet/index";

describe("file key", () => {
  it("should generate cipher", { timeout: 30_000 }, () => {
    const cipher = generateCipher(
      "0xb2abf4282ac9be1b61afa64305e1b0eb4b7d0726384d1000486396ff73a66a5d",
      "Root1234",
      Curves.Sm2p256v1
    );
    console.log(JSON.stringify(cipher));
    expect(cipher.isOk()).toBe(true);
  });

  it("should generate file key", { timeout: 30_000 }, () => {
    const result = generateFileKey(
      "0xcf9df32a0382702e4d88cf0e61af415e58eaacbb53decf34952cfeaa54f7d6bb",
      "123",
      Curves.Sm2p256v1
    );
    assert(result.isOk());
    console.log(JSON.stringify(result.value));
  });

  it("should decrypt file key", { timeout: 30_000 }, () => {
    const fileKey = `{"uuid":"ad1ae878-9323-43fa-98dc-10ee52c59252","address":"zltc_hRzdBQSUeHa2DLo1JTcVgJVCdxV949uQf","cipher":{"aes":{"cipher":"aes-128-ctr","iv":"6aa86db3f3c07fb10e1180c1bce7e05f"},"kdf":{"kdf":"scrypt","kdfParams":{"DKLen":32,"n":32768,"p":1,"r":8,"salt":"4f5143f5d6d1a1aebaaac1ba7e1bee68595164ca911f2571467a06618f3db758"}},"cipherText":"405305e2582857292ae59452f9fe8d95944137fabe877c28fd0c41782c8a5ada","mac":"d45aa4cdfec9d3cb04650b9b6bd15d80891a764b7fa907e8cb8a5596711d4747"},"isGM":true}`;
    const result = decryptFileKey(fileKey, "Aa123456");
    result.match(
      (value) => {
        expect(value).toBe(
          "0x8e247714ab228e6dcaf664c6ca623426ca50aa0b38cce6e0c2b7627f0155f5cc"
        );
      },
      (error) => {
        console.log(error);
      }
    );
  });
});