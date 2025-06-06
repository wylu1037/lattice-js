import { sm4 } from "@/crypto/index";
import { describe, expect, it } from "vitest";

describe("crypto.sm4", () => {
  describe("encrypt with ecb", () => {
    it("should return the correct hash", () => {
      const actual = sm4.encrypt("hello", "31323334353637383930313233343536");
      const expected = "a6c66e3894a0b213d4f204f78d6def09";
      expect(actual).toBe(expected);
    });
  });

  describe("decrypt with ecb", () => {
    it("should return the correct source string", () => {
      const actual = sm4.decrypt(
        "a6c66e3894a0b213d4f204f78d6def09",
        "31323334353637383930313233343536"
      );
      const expected = "hello";
      expect(actual).toBe(expected);
    });
  });
});
