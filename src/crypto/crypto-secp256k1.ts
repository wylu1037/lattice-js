import {
  ADDRESS_BYTES_LENGTH,
  ADDRESS_TITLE,
  ADDRESS_VERSION
} from "@/common/constants";
import type { KeyPair } from "@/common/index";
import { log } from "@/logger";
import { Base58Impl, Base58Interface } from "@/utils/base58";
import { stripHexPrefix } from "@/utils/string";
import { isHexString } from "@ethersproject/bytes";
import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex, randomBytes } from "@noble/hashes/utils";
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
    let publicKeyBuffer: Buffer;
    if (typeof publicKey === "string") {
      publicKeyBuffer = Buffer.from(stripHexPrefix(publicKey), "hex");
    } else {
      publicKeyBuffer = publicKey;
    }

    if (publicKeyBuffer.length < 64) {
      throw new Error(
        `Invalid public key length, expected size greater than or equal to 64, but actual size is ${publicKeyBuffer.length}`
      );
    }

    const bs = this.hash(publicKeyBuffer.subarray(publicKeyBuffer.length - 64));
    const base58: Base58Interface = new Base58Impl();
    const address = base58.checkEncode(
      bs.subarray(bs.length - ADDRESS_BYTES_LENGTH),
      ADDRESS_VERSION
    );
    return `${ADDRESS_TITLE}_${address}`;
  }

  getPublicKeyFromPrivateKey(privateKey: string, compressed = false): string {
    if (!isHexString(privateKey)) {
      throw new Error(
        `Invalid private key, excepted hex string, but actual is ${privateKey}`
      );
    }
    const publicKey = secp256k1.getPublicKey(
      stripHexPrefix(privateKey),
      compressed
    );
    return `0x${bytesToHex(publicKey)}`;
  }

  hash(data: Buffer): Buffer {
    return Buffer.from(sha256(data));
  }

  encodeHash(encodeFunc: EncodeFunc): Buffer {
    const hash = encodeFunc();
    return this.hash(hash);
  }

  sign(data: Buffer, privateKey: string): string {
    const signature = secp256k1.sign(data, stripHexPrefix(privateKey));
    return `0x${signature.toCompactHex()}`;
  }

  verify(
    data: Buffer,
    signature: string,
    uncompressedPublicKey: string
  ): boolean {
    const recoveredSignature = secp256k1.Signature.fromCompact(
      stripHexPrefix(signature)
    );
    return secp256k1.verify(
      recoveredSignature,
      data,
      stripHexPrefix(uncompressedPublicKey)
    );
  }
}
