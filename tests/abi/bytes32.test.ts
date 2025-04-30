import { decodeBytes32String, encodeBytes32String } from "@/abi/bytes32.js";
import { hexlify } from "@/utils/index.js";
import { describe, expect, it } from "vitest";

describe("Bytes32 String Tests", () => {
    
    describe("encodeBytes32String", () => {
        
        it("correctly encodes empty string", () => {
            const result = encodeBytes32String("");
            expect(hexlify(result)).toBe("0x0000000000000000000000000000000000000000000000000000000000000000");
        });
        
        it("correctly encodes short string", () => {
            const result = encodeBytes32String("hello");
            expect(hexlify(result)).toBe("0x68656c6c6f000000000000000000000000000000000000000000000000000000");
        });
        
        it("correctly encodes string with maximum length", () => {
            const result = encodeBytes32String("abcdefghijklmnopqrstuvwxyz12345");
            expect(hexlify(result)).toBe("0x6162636465666768696a6b6c6d6e6f707172737475767778797a313233343500");
        });
        
        it("throws error for string too long", () => {
            expect(() => encodeBytes32String("abcdefghijklmnopqrstuvwxyz123456")).toThrow("bytes32 string must be less than 32 bytes");
        });
    });
    
    describe("decodeBytes32String", () => {
        
        it("correctly decodes empty string", () => {
            const encoded = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const result = decodeBytes32String(encoded);
            expect(result).toBe("");
        });
        
        it("correctly decodes short string", () => {
            const encoded = "0x68656c6c6f000000000000000000000000000000000000000000000000000000";
            const result = decodeBytes32String(encoded);
            expect(result).toBe("hello");
        });
        
        it("correctly decodes string with maximum length", () => {
            const encoded = "0x6162636465666768696a6b6c6d6e6f707172737475767778797a313233343500";
            const result = decodeBytes32String(encoded);
            expect(result).toBe("abcdefghijklmnopqrstuvwxyz12345");
        });
        
        it("throws error for invalid length bytes", () => {
            const encoded = "0x6162636465";
            expect(() => decodeBytes32String(encoded)).toThrow("invalid bytes32 - not 32 bytes long");
        });
        
        it("throws error for missing null terminator", () => {
            const encoded = "0x6162636465666768696a6b6c6d6e6f707172737475767778797a3132333435ff";
            expect(() => decodeBytes32String(encoded)).toThrow("invalid bytes32 string - no null terminator");
        });
    });
    
    describe("Round-trip encoding/decoding", () => {
        
        it("correctly round-trips string", () => {
            const original = "Hello, world!";
            const encoded = encodeBytes32String(original);
            const decoded = decodeBytes32String(encoded);
            expect(decoded).toBe(original);
        });
        
        it("correctly round-trips empty string", () => {
            const original = "";
            const encoded = encodeBytes32String(original);
            const decoded = decodeBytes32String(encoded);
            expect(decoded).toBe(original);
        });
    });
});
