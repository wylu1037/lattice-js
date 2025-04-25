import { encodeRlp } from "@/common/rlp-encode";
import { decodeRlp } from "@/common/rlp-decode";
import { expect } from "chai";

describe("rlp", () => {
    it("should encode and decode number array", () => {
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const encoded = encodeRlp(Uint8Array.from(data));
        const decoded = decodeRlp(encoded);
        if (typeof decoded === "string") {
            expect(decoded).to.equal(`0x${Buffer.from(data).toString("hex")}`);
        } else {
            expect(decoded).to.deep.equal(data);
        }
    });
}); 