import { sm3 } from "../../../src/crypto/sm3";
import { expect } from "chai";
import { describe, it } from "mocha";

describe("crypto.sm3", () => {
  describe("basic hash", () => {
    it("should return the correct hash for hello", () => {
      const actual = sm3("hello");
      const expected =
        "becbbfaae6548b8bf0cfcad5a27183cd1be6093b1cceccc303d9c61d0a645268";
      expect(actual).to.equal(expected);
    });

    it("should return the correct hash for empty string", () => {
      const actual = sm3("");
      const expected =
        "1ab21d8355cfa17f8e61194831e81a8f22bec8c728fefb747ed035eb5082aa2b";
      expect(actual).to.equal(expected);
    });
    
  });
});
