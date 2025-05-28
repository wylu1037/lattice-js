import type { KeyPair } from "@/common/index";
import { log } from "@/logger";
import { randomBytes } from "@noble/hashes/utils";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import type { CryptoService, EncodeFunc } from "./crypto";

export class NIST implements CryptoService {
  generateKeyPair(): KeyPair {
    // Generate a random private key
    let privateKey: Uint8Array;
    do {
      privateKey = randomBytes(32);
    } while (!secp256k1.utils.isValidPrivateKey(privateKey));

    // Get the corresponding public key
    const isCompressed = false;
    const uncompressedPublicKey = secp256k1.getPublicKey(
      privateKey,
      isCompressed
    );

    return {
      privateKey: Buffer.from(privateKey),
      publicKey: Buffer.from(uncompressedPublicKey)
    };
  }

  compressPublicKey(publicKey: Buffer | string): Buffer {
    let publicKeyBuffer: Buffer;
    if (typeof publicKey === "string") {
      publicKeyBuffer = Buffer.from(publicKey, "hex");
    } else {
      publicKeyBuffer = publicKey;
    }
    if (publicKeyBuffer.length !== 65) {
      log.error(
        "Invalid public key length, expected size is 65, but actual size is %d",
        publicKeyBuffer.length
      );
      throw new Error(
        `Invalid public key length, expected size is 65, but actual size is ${publicKeyBuffer.length}`
      );
    }

    // calculate x coordinate and y coordinate
    const x = publicKeyBuffer.subarray(1, 33);
    const y = BigInt(`0x${publicKeyBuffer.subarray(33, 65).toString("hex")}`);

    // judge whether the y coordinate is even
    // `02` represents even, `03` represents odd.
    let prefix = "02";
    if (y % BigInt(2) === BigInt(1)) {
      prefix = "03";
    }

    return Buffer.from(`${prefix}${x.toString("hex")}`, "hex");
  }

  publicKeyToAddress(publicKey: Buffer | string): string {
    return "";
  }

  getPublicKeyFromPrivateKey(privateKey: string): string {
    return "";
  }

  hash(data: Buffer): Buffer {
    return Buffer.from("01", "hex");
  }

  encodeHash(encodeFunc: EncodeFunc): Buffer {
    return Buffer.from("01", "hex");
  }

  sign(data: Buffer, privateKey: string): string {
    return "";
  }

  verify(
    data: Buffer,
    signature: string,
    uncompressedPublicKey: string
  ): boolean {
    return true;
  }
}
