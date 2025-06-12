import { HEX_PREFIX } from "@/common/constants";
import { addHexPrefix, stripHexPrefix } from "@/utils/string";
import { describe, expect, it } from "vitest";

describe("string utils", () => {
  describe("stripHexPrefix", () => {
    it("should strip 0x prefix from hex string", () => {
      const hexWithPrefix = "0x1234abcd";
      const result = stripHexPrefix(hexWithPrefix);
      expect(result).toBe("1234abcd");
    });


    it("should handle empty hex string with prefix", () => {
      const emptyHexWithPrefix = "0x";
      const result = stripHexPrefix(emptyHexWithPrefix);
      expect(result).toBe("");
    });

    it("should handle lowercase hex string", () => {
      const lowercaseHex = "0xabcdef123456";
      const result = stripHexPrefix(lowercaseHex);
      expect(result).toBe("abcdef123456");
    });

    it("should handle uppercase hex string", () => {
      const uppercaseHex = "0xABCDEF123456";
      const result = stripHexPrefix(uppercaseHex);
      expect(result).toBe("ABCDEF123456");
    });

    it("should handle mixed case hex string", () => {
      const mixedCaseHex = "0xaBcDeF123456";
      const result = stripHexPrefix(mixedCaseHex);
      expect(result).toBe("aBcDeF123456");
    });

    it("should handle long hex string", () => {
      const longHex = `0x${"a".repeat(64)}`;
      const result = stripHexPrefix(longHex);
      expect(result).toBe("a".repeat(64));
    });
  });

  describe("addHexPrefix", () => {
    it("should add 0x prefix to hex string without prefix", () => {
      const hexWithoutPrefix = "1234abcd";
      const result = addHexPrefix(hexWithoutPrefix);
      expect(result).toBe("0x1234abcd");
    });

    it("should not duplicate 0x prefix if already present", () => {
      const hexWithPrefix = "0x1234abcd";
      const result = addHexPrefix(hexWithPrefix);
      expect(result).toBe("0x1234abcd");
    });

    it("should handle empty string", () => {
      const emptyString = "";
      const result = addHexPrefix(emptyString);
      expect(result).toBe("0x");
    });

    it("should handle lowercase hex string", () => {
      const lowercaseHex = "abcdef123456";
      const result = addHexPrefix(lowercaseHex);
      expect(result).toBe("0xabcdef123456");
    });

    it("should handle uppercase hex string", () => {
      const uppercaseHex = "ABCDEF123456";
      const result = addHexPrefix(uppercaseHex);
      expect(result).toBe("0xABCDEF123456");
    });

    it("should handle mixed case hex string", () => {
      const mixedCaseHex = "aBcDeF123456";
      const result = addHexPrefix(mixedCaseHex);
      expect(result).toBe("0xaBcDeF123456");
    });

    it("should handle long hex string", () => {
      const longHex = "a".repeat(64);
      const result = addHexPrefix(longHex);
      expect(result).toBe(`0x${"a".repeat(64)}`);
    });

    it("should handle string that starts with 0x in the middle", () => {
      const hexString = "abc0x123";
      const result = addHexPrefix(hexString);
      expect(result).toBe("0xabc0x123");
    });

    it("should work with single character", () => {
      const singleChar = "a";
      const result = addHexPrefix(singleChar);
      expect(result).toBe("0xa");
    });

    it("should work with numbers", () => {
      const numberString = "123456";
      const result = addHexPrefix(numberString);
      expect(result).toBe("0x123456");
    });

    it("should preserve the original string when prefix exists", () => {
      const hexWithPrefix = "0xDEADBEEF";
      const result = addHexPrefix(hexWithPrefix);
      expect(result).toBe("0xDEADBEEF");
      expect(result).toBe(hexWithPrefix);
    });
  });

  describe("edge cases", () => {
    it("should use correct HEX_PREFIX constant", () => {
      expect(HEX_PREFIX).toBe("0x");
    });

    it("should handle stripHexPrefix and addHexPrefix roundtrip", () => {
      const original = "0x1234abcd";
      const stripped = stripHexPrefix(original);
      const restored = addHexPrefix(stripped);
      expect(restored).toBe(original);
    });

    it("should handle addHexPrefix and stripHexPrefix roundtrip", () => {
      const original = "1234abcd";
      const prefixed = addHexPrefix(original);
      const stripped = stripHexPrefix(prefixed);
      expect(stripped).toBe(original);
    });
  });
});
