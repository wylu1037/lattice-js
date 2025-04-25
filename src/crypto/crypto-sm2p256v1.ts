import {log} from "@/logger";
import {CryptoService} from "./crypto";
import {compressPublicKeyHex, generateKeyPairHex, doSignature, doVerifySignature} from "./sm2";
import {KeyPair} from "./types";
import sm3 from "@/crypto/sm3";
import {Base58Impl, Base58Interface} from "@/common/base58";
import {ADDRESS_BYTES_LENGTH, ADDRESS_TITLE} from "@/common/constants";
import { ADDRESS_VERSION } from "@/common/constants";
import { EncodeFunc } from "./crypto";

export class GM implements CryptoService {
  generateKeyPair(): KeyPair {
    const { privateKey, publicKey: uncompressedPublicKey } = generateKeyPairHex();
    return { privateKey: Buffer.from(privateKey, "hex"), publicKey: Buffer.from(uncompressedPublicKey, "hex") };
  }

  compressPublicKey(publicKey: Buffer | string): Buffer {
    if (typeof publicKey === "string") {
      publicKey = Buffer.from(publicKey, "hex");
    }
    if (publicKey.length != 65) {
      log.error("Invalid uncompressed public key length, expected size is 65, but actual size is %d", publicKey.length);
      throw new Error(`Invalid uncompressed public key length, expected size is 65, but actual size is ${publicKey.length}`);
    }
    const compressedPublicKey = compressPublicKeyHex(publicKey.toString("hex"));
    return Buffer.from(compressedPublicKey, "hex");
  }

  publicKeyToAddress(publicKey: Buffer | string): string {
    if (typeof publicKey === "string") {
      publicKey = Buffer.from(publicKey, "hex");
    }

    if (publicKey.length > 64) {
      publicKey = publicKey.subarray(publicKey.length-64);
    }

    const bs = this.hash(publicKey);
    const base58: Base58Interface = new Base58Impl();
    const address = base58.checkEncode(bs.subarray(bs.length-ADDRESS_BYTES_LENGTH), ADDRESS_VERSION);
    return `${ADDRESS_TITLE}_${address}`;
  }

  hash(data: Buffer): Buffer {
    const hash =  sm3(data); // 杂凑
    return Buffer.from(hash, "hex");
  }

  encodeHash(encodeFunc: EncodeFunc): Buffer {
    return encodeFunc(Buffer.from("01", 'hex'));
  }

  sign(data: Buffer, privateKey: string): string {
    const buffer = Buffer.from(privateKey, "hex");
    if (buffer.length != 32) {
      throw new Error(`Invalid private key length, expected size is 32, but actual size is ${buffer.length}`);
    }
    return doSignature(data, privateKey);
  }

  verify(data: Buffer, signature: string, uncompressedPublicKey: string): boolean {
    const buffer = Buffer.from(uncompressedPublicKey, "hex");
    if (buffer.length != 65) {
      throw new Error(`Invalid uncompressed public key length, expected size is 65, but actual size is ${buffer.length}`);
    }
    return doVerifySignature(data, signature, uncompressedPublicKey);
  }
}
