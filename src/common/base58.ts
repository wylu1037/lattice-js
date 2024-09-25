import { sha256 } from "@ethersproject/sha2";

interface CheckDecodeResult {
  result: Buffer;
  version: number;
}

interface Base58Interface {
  // first four bytes of sha256^2
  checksum(input: Buffer): Buffer;

  // prepends a version byte and appends a four byte checksum.
  checkEncode(input: Buffer, version: number): string;

  // decodes a string that was encoded with CheckEncode and verifies the checksum.
  checkDecode(input: string): CheckDecodeResult;
}

class Base58Impl implements Base58Interface {
  checkDecode(input: string): CheckDecodeResult {
    return { result: Buffer.from(input), version: 1 };
  }

  checkEncode(input: Buffer, version: number): string {
    console.log(input);
    console.log(version);
    return "";
  }

  checksum(input: Buffer): Buffer {
    let hash = sha256(input);
    let hash2 = sha256(hash);
    let bytes = Buffer.from(hash2.slice(2), "hex");
    return bytes.subarray(0, 4);
  }
}

export { Base58Impl, Base58Interface, CheckDecodeResult };
