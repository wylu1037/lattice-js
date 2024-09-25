import {describe, it} from "mocha";
import {expect} from "chai";
import {Base58Impl, Base58Interface} from "../../src/common/base58.js";

describe("Base58", () => {
    describe("checksum", () => {
        it("should return 42a873ac when the input text is Hello World",  () => {
            const base58: Base58Interface = new Base58Impl();
            const out = base58.checksum(Buffer.from("Hello World", "utf-8"));
            const actual = out.toString("hex");
            const expected = "42a873ac";
            expect(actual).to.equal(expected);
        });
    });
});
