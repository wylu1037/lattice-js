import { convertBigIntToHexString } from "@/utils/converter";
import { describe, expect, it } from "vitest";

describe("Converter", () => {
  describe("convertBigIntegerToHexString", () => {
    it("should convert BigInteger to hex string", () => {
      const bigInt = BigInt("1234567890");
      const hexString = convertBigIntToHexString(bigInt);
      expect(hexString).toBe("499602d2");
    });

    it("should convert -BigInteger to hex string", () => {
      const bigInt = BigInt("-1234567890");
      const hexString = convertBigIntToHexString(bigInt);
      expect(hexString).toBe("b669fd2e");
    });
  });
});
