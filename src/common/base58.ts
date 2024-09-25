import { sha256 } from "@ethersproject/sha2";
import { Base58 } from "@ethersproject/basex";

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
    const b = new Uint8Array(1+input.length+4);
    b[0] = version;
    b.set(input, 1);

    const sum = this.checksum(Buffer.from(b.subarray(0, 1+input.length)));
    b.set(sum, 1+input.length);
    return Base58.encode(b);
  }

  checksum(input: Buffer): Buffer {
    let hash = sha256(input);
    let hash2 = sha256(hash);
    let bytes = Buffer.from(hash2.slice(2), "hex");
    return bytes.subarray(0, 4);
  }
}

export { Base58Impl, Base58Interface, CheckDecodeResult };
