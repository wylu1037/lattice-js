import { expect } from "chai";
import { decodeBytes32String, encodeBytes32String } from "@/abi/bytes32.js";
import { hexlify } from "@/utils/index.js";

describe("Bytes32 String Tests", function() {
    
    describe("encodeBytes32String", function() {
        
        it("correctly encodes empty string", function() {
            const result = encodeBytes32String("");
            expect(hexlify(result)).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
        });
        
        it("correctly encodes short string", function() {
            const result = encodeBytes32String("hello");
            expect(hexlify(result)).to.equal("0x68656c6c6f000000000000000000000000000000000000000000000000000000");
        });
        
        it("correctly encodes string with maximum length", function() {
            const result = encodeBytes32String("abcdefghijklmnopqrstuvwxyz12345");
            expect(hexlify(result)).to.equal("0x6162636465666768696a6b6c6d6e6f707172737475767778797a313233343500");
        });
        
        it("throws error for string too long", function() {
            expect(() => encodeBytes32String("abcdefghijklmnopqrstuvwxyz123456")).to.throw("bytes32 string must be less than 32 bytes");
        });
    });
    
    describe("decodeBytes32String", function() {
        
        it("correctly decodes empty string", function() {
            const encoded = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const result = decodeBytes32String(encoded);
            expect(result).to.equal("");
        });
        
        it("correctly decodes short string", function() {
            const encoded = "0x68656c6c6f000000000000000000000000000000000000000000000000000000";
            const result = decodeBytes32String(encoded);
            expect(result).to.equal("hello");
        });
        
        it("correctly decodes string with maximum length", function() {
            const encoded = "0x6162636465666768696a6b6c6d6e6f707172737475767778797a313233343500";
            const result = decodeBytes32String(encoded);
            expect(result).to.equal("abcdefghijklmnopqrstuvwxyz12345");
        });
        
        it("throws error for invalid length bytes", function() {
            const encoded = "0x6162636465";
            expect(() => decodeBytes32String(encoded)).to.throw("invalid bytes32 - not 32 bytes long");
        });
        
        it("throws error for missing null terminator", function() {
            const encoded = "0x6162636465666768696a6b6c6d6e6f707172737475767778797a3132333435ff";
            expect(() => decodeBytes32String(encoded)).to.throw("invalid bytes32 string - no null terminator");
        });
    });
    
    describe("Round-trip encoding/decoding", function() {
        
        it("correctly round-trips string", function() {
            const original = "Hello, world!";
            const encoded = encodeBytes32String(original);
            const decoded = decodeBytes32String(encoded);
            expect(decoded).to.equal(original);
        });
        
        it("correctly round-trips empty string", function() {
            const original = "";
            const encoded = encodeBytes32String(original);
            const decoded = decodeBytes32String(encoded);
            expect(decoded).to.equal(original);
        });
    });
});
