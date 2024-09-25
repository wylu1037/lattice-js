import {describe, it} from "mocha";
import {expect} from "chai";
import {Base58Impl, Base58Interface} from "../../src/common/base58.js";
import {ADDRESS_TITLE, ADDRESS_VERSION} from "../../src/common/constants";

describe("Base58", () => {
    describe("checksum", () => {
        it("should return 42a873ac when the input text is Hello World",  () => {
            const base58: Base58Interface = new Base58Impl();
            const out = base58.checksum(Buffer.from("Hello World", "utf-8"));
            const actual = out.toString("hex");
            const expected = "42a873ac";
            expect(actual).to.equal(expected);
        });

        it('should encode eth address', () => {
            const base58: Base58Interface = new Base58Impl();
            const array = [146, 147, 198, 4, 198, 68, 191, 172, 52, 244, 152, 153, 140, 195, 64, 47, 32, 61, 77, 107];
            const actual = `${ADDRESS_TITLE}_${base58.checkEncode(Buffer.from(array), ADDRESS_VERSION)}`;
            const expected = "zltc_dhdfbm9JEoyDvYoCDVsABiZj52TAo9Ei6";
            expect(actual).to.equal(expected);
        });
    });
});
