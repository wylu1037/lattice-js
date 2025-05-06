import {ADDRESS_BYTES_LENGTH, ADDRESS_TITLE, HEX_PREFIX, SM2P256V1_SIGNATURE_LENGTH, SM2P256V1_SIGNATURE_REMARK} from "@/common/constants";
import { ADDRESS_VERSION } from "@/common/constants";
import sm3 from "@/crypto/sm3";
import {log} from "@/logger";
import {Base58Impl, type Base58Interface} from "@/utils/base58";
import type {CryptoService} from "./crypto";
import type { EncodeFunc } from "./crypto";
import {compressPublicKeyHex, doSignature, doVerifySignature, generateKeyPairHex, getHash, getPublicKeyFromPrivateKey } from "./sm2";
import type {KeyPair} from "./types";

export class GM implements CryptoService {
  generateKeyPair(): KeyPair {
    const { privateKey, publicKey: uncompressedPublicKey } = generateKeyPairHex();
    return { privateKey: Buffer.from(privateKey, "hex"), publicKey: Buffer.from(uncompressedPublicKey, "hex") };
  }

  compressPublicKey(publicKey: Buffer | string): Buffer {
    let publicKeyBuffer: Buffer;
    if (typeof publicKey === "string") {
      publicKeyBuffer = Buffer.from(publicKey, "hex");
    } else {
      publicKeyBuffer = publicKey;
    }
    if (publicKeyBuffer.length !== 65) {
      log.error("Invalid uncompressed public key length, expected size is 65, but actual size is %d", publicKeyBuffer.length);
      throw new Error(`Invalid uncompressed public key length, expected size is 65, but actual size is ${publicKeyBuffer.length}`);
    }
    const compressedPublicKey = compressPublicKeyHex(publicKey.toString("hex"));
    return Buffer.from(compressedPublicKey, "hex");
  }

  publicKeyToAddress(publicKey: Buffer | string): string {
    let publicKeyBuffer: Buffer;
    if (typeof publicKey === "string") {
      publicKeyBuffer = Buffer.from(publicKey, "hex");
    } else {
      publicKeyBuffer = publicKey;
    }

    if (publicKeyBuffer.length > 64) {
      publicKeyBuffer = publicKeyBuffer.subarray(publicKeyBuffer.length-64);
    }

    const bs = this.hash(publicKeyBuffer);
    const base58: Base58Interface = new Base58Impl();
    const address = base58.checkEncode(bs.subarray(bs.length-ADDRESS_BYTES_LENGTH), ADDRESS_VERSION);
    return `${ADDRESS_TITLE}_${address}`;
  }

  hash(data: Buffer): Buffer {
    const hash = sm3(data); // 杂凑
    return Buffer.from(hash, "hex");
  }

  encodeHash(encodeFunc: EncodeFunc): Buffer {
    const hash = encodeFunc();
    return this.hash(hash);
  }

  sign(data: Buffer, privateKey: string): string {
    const buffer = Buffer.from(privateKey, "hex");
    if (buffer.length !== 32) {
      throw new Error(`Invalid private key length, expected size is 32, but actual size is ${buffer.length}`);
    }
    const signature = doSignature(data, privateKey, {
      hash: true,
    });
    const signatureBuffer = Buffer.alloc(SM2P256V1_SIGNATURE_LENGTH);
    signatureBuffer.write(signature, 0, 64, "hex"); // r、s
    signatureBuffer.write(SM2P256V1_SIGNATURE_REMARK, 64, 1, "hex"); // remark

    // calculate e point
    const publicKey = getPublicKeyFromPrivateKey(privateKey);
    const hashHex = getHash(data, publicKey);

    signatureBuffer.write(hashHex, 65, 32, "hex");
    if (signatureBuffer.length !== SM2P256V1_SIGNATURE_LENGTH) {
      throw new Error(`Invalid signature length, expected size is ${SM2P256V1_SIGNATURE_LENGTH}, but actual size is ${signatureBuffer.length}`);
    }
    return signatureBuffer.toString("hex");
  }

  verify(data: Buffer, signature: string, uncompressedPublicKey: string): boolean {
    const buffer = Buffer.from(uncompressedPublicKey, "hex");
    if (buffer.length !== 65) {
      throw new Error(`Invalid uncompressed public key length, expected size is 65, but actual size is ${buffer.length}`);
    }
    let tempSignature = signature;
    if (signature.startsWith(HEX_PREFIX)) {
      tempSignature = signature.slice(HEX_PREFIX.length);
    }
    if (tempSignature.length > 128) {
      tempSignature = tempSignature.slice(0, 128);
    }
    return doVerifySignature(data, tempSignature, uncompressedPublicKey, {
      hash: true,
    });
  }
}
