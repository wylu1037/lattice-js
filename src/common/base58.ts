import { sha256 } from '@ethersproject/sha2';

interface CheckDecodeResult {
    result: Buffer;
    version: number;
}

interface Base58Interface {
    // first four bytes of sha256^2
    Checksum(input: Buffer): Buffer

    // prepends a version byte and appends a four byte checksum.
    CheckEncode(input: Buffer, version: number): string

    // decodes a string that was encoded with CheckEncode and verifies the checksum.
    CheckDecode(input: string): CheckDecodeResult
}

class Base58Impl implements Base58Interface {
    CheckDecode(input: string): CheckDecodeResult {
        return {result: Buffer.from(input), version: 1};
    }

    CheckEncode(input: Buffer, version: number): string {
        return "";
    }

    Checksum(input: Buffer): Buffer {
        let hash = sha256(input);
        let hash2 = sha256(hash);
        let bytes = Buffer.from(hash2.slice(2), 'hex');
        return bytes.subarray(0,4)
    }

}

function testChecksum() {
    const base58 = new Base58Impl();
    const out = base58.Checksum(Buffer.from("Hello World", "utf-8"));
    const hexString = out.toString('hex');
    console.log(hexString);
}

testChecksum();