import { sm3 } from "../../../src/crypto/sm3";
import { expect } from "chai";
import { describe, it } from "mocha";

describe("SM3", () => {
  describe("hash", () => {
    it("should return the correct hash", () => {
      const actual = sm3("hello");
      const expected =
        "becbbfaae6548b8bf0cfcad5a27183cd1be6093b1cceccc303d9c61d0a645268";
      expect(actual).to.equal(expected);
    });
  });
});
