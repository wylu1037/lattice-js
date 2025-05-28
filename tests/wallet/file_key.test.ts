import { Curves } from "@/common";
import { generateCipher, generateFileKey } from "@/wallet/index";

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
      "0xb2abf4282ac9be1b61afa64305e1b0eb4b7d0726384d1000486396ff73a66a5d",
      "Root1234",
      Curves.Sm2p256v1
    );
    assert(result.isOk());
    console.log(JSON.stringify(result.value));
  });
});