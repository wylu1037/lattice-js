import { describe, it } from "mocha";
import { expect } from "chai";
import { convertBigIntToHexString } from "@/utils/converter";

describe("Converter", () => {
  describe("convertBigIntegerToHexString", () => {
    it("should convert BigInteger to hex string", () => {
      const bigInt = BigInt("1234567890");
      const hexString = convertBigIntToHexString(bigInt);
      expect(hexString).to.equal("499602d2");
    });

    it("should convert -BigInteger to hex string", () => {
      const bigInt = BigInt("-1234567890");
      const hexString = convertBigIntToHexString(bigInt);
      expect(hexString).to.equal("b669fd2e");
    });
  });
});
