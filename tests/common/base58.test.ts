import { Base58Impl, Base58Interface } from "../../src/common/base58";
import { assert } from "chai";
import "mocha";
import { it } from "mocha";

describe("Base58", function () {
  describe("Checksum", function () {
    it("should return 42a873ac when the input text is Hello World", function () {
      const base58: Base58Interface = new Base58Impl();
      const out = base58.checksum(Buffer.from("Hello World", "utf-8"));
      const actual = out.toString("hex");
      const expected = "42a873ac";
      assert.equal(actual, expected);
    });
  });
});
