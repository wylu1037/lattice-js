import { decode, encode} from "@ethersproject/rlp";
import { describe, expect, it } from "vitest";

describe("rlp", () => {
    it("should encode and decode number array", () => {
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const encoded = encode(Uint8Array.from(data));
        const decoded = decode(encoded);
        if (typeof decoded === "string") {
            expect(decoded).toBe(`0x${Buffer.from(data).toString("hex")}`);
        } else {
            expect(decoded).toEqual(data);
        }
    });
}); 