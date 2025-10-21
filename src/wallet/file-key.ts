import { type Curve, Curves, HEX_PREFIX } from "@/common/constants";
import { createCrypto } from "@/crypto";
import { hexlify } from "@ethersproject/bytes";
import { scrypt } from "@noble/hashes/scrypt";
import { randomBytes } from "@noble/hashes/utils";
import * as CryptoJS from "crypto-js";
import { Result, err, ok } from "neverthrow";
import { v4 as uuidv4 } from "uuid";

const AES_128_CTR = "aes-128-ctr";
const KDF_SCRYPT = "scrypt";
const SCRYPT_N = 1 << 18; // 1<<18 = 262144，CPU/内存成本因子，控制计算和内存的使用量。
const SCRYPT_P = 1; // 1，并行度因子，控制 scrypt 函数的并行度。
const SCRYPT_R = 8; // 8，块大小因子，影响内部工作状态和内存占用。
const SCRYPT_KEY_LEN = 32; // 32，生成的密钥长度，单位byte
const AES_BLOCK_SIZE = 16; // 16，AES 块大小，单位byte

class FileKey {
  constructor(
    public readonly uuid: string,
    public readonly address: string,
    public readonly cipher: Cipher,
    public readonly isGm: boolean
  ) {}

  static fromJson(json: string): Result<FileKey, Error> {
    try {
      const data = JSON.parse(json);
      return ok(
        new FileKey(
          data.uuid,
          data.address,
          new Cipher(
            new Aes(data.cipher.aes.cipher, data.cipher.aes.iv),
            new Kdf(
              data.cipher.kdf.kdf,
              new KdfParams(
                data.cipher.kdf.kdfParams.DkLen,
                data.cipher.kdf.kdfParams.n,
                data.cipher.kdf.kdfParams.p,
                data.cipher.kdf.kdfParams.r,
                data.cipher.kdf.kdfParams.salt
              )
            ),
            data.cipher.cipherText,
            data.cipher.mac
          ),
          data.isGM
        )
      );
    } catch (error) {
      return err(new Error("Invalid file key"));
    }
  }
}

class Cipher {
  constructor(
    public readonly aes: Aes,
    public readonly kdf: Kdf,
    public readonly cipherText: string,
    public readonly mac: string
  ) {}
}

class Aes {
  constructor(
    public readonly cipher: string,
    public readonly iv: string
  ) {}
}

class Kdf {
  constructor(
    public readonly kdf: string, // 密钥派生函数，scrypt, PBKDF2, bcrypt, HKDF
    public readonly kdfParams: KdfParams
  ) {}
}

class KdfParams {
  constructor(
    public readonly DkLen: number, // 生成的密钥长度，单位byte
    public readonly n: number, // CPU/内存成本因子，控制计算和内存的使用量。
    public readonly p: number, // 并行度因子，控制 scrypt 函数的并行度。
    public readonly r: number, // 块大小因子，影响内部工作状态和内存占用。
    public readonly salt: string // 盐值，在密钥派生过程中加入随机性。
  ) {}
}

/**
 * Generate file key
 * @param privateKey - The private key
 * @param passphrase - The passphrase
 * @param curve - The curve
 * @returns The file key
 */
function generateFileKey(
  privateKey: string,
  passphrase: string,
  curve: Curve
): Result<FileKey, Error> {
  const crypto = createCrypto(curve);
  const address = crypto.publicKeyToAddress(
    crypto.getPublicKeyFromPrivateKey(privateKey)
  );
  const uuid = uuidv4();
  const generateCipherResult = generateCipher(privateKey, passphrase, curve);
  if (generateCipherResult.isErr()) {
    return err(generateCipherResult.error);
  }
  return ok(
    new FileKey(
      uuid,
      address,
      generateCipherResult.value,
      curve === Curves.Sm2p256v1
    )
  );
}

/**
 * Decrypt file key
 * @param fileKey - The file key
 * @param passphrase - The passphrase
 * @returns The private key
 */
function decryptFileKey(
  fileKey: FileKey | string,
  passphrase: string
): Result<string, Error> {
  const result =
    typeof fileKey === "string" ? FileKey.fromJson(fileKey) : ok(fileKey);
  if (result.isErr()) {
    return err(result.error);
  }
  const fk = result.value;

  const salt = Buffer.from(fk.cipher.kdf.kdfParams.salt, "hex");
  const key = scryptKey(passphrase, salt, SCRYPT_N);
  const aesKey = key.subarray(0, AES_BLOCK_SIZE);
  const hashKey = key.subarray(AES_BLOCK_SIZE, AES_BLOCK_SIZE * 2); // compact amc
  const cipher = Buffer.from(fk.cipher.cipherText, "hex");

  const curve = fk.isGm ? Curves.Sm2p256v1 : Curves.Secp256k1;
  const actualMac = createCrypto(curve).hash(Buffer.concat([hashKey, cipher]));
  const expectedMac = Buffer.from(fk.cipher.mac, "hex");

  if (actualMac.toString("hex") !== expectedMac.toString("hex")) {
    return err(new Error("根据密码无法解析出私钥，请检查密码"));
  }

  const iv = Buffer.from(fk.cipher.aes.iv, "hex");
  const privateKey = aesCtrDecrypt(aesKey, iv, cipher);
  return ok(hexlify(privateKey));
}

/**
 * Generate cipher
 * @param privateKey - The private key
 * @param passphrase - The passphrase
 * @param curve - The curve
 * @returns The cipher
 */
function generateCipher(
  privateKey: string,
  passphrase: string,
  curve: Curve
): Result<Cipher, Error> {
  // generate salt
  const salt = Buffer.from(randomBytes(32));
  const key = scryptKey(passphrase, salt, SCRYPT_N);
  const aesKey = key.subarray(0, AES_BLOCK_SIZE);
  const hashKey = key.subarray(AES_BLOCK_SIZE, AES_BLOCK_SIZE * 2); // compact amc

  const ivBytes = Buffer.from(randomBytes(AES_BLOCK_SIZE));
  const cipher = aesCtrEncrypt(
    aesKey,
    ivBytes,
    Buffer.from(
      privateKey.startsWith(HEX_PREFIX)
        ? privateKey.slice(HEX_PREFIX.length)
        : privateKey,
      "hex"
    )
  );
  const mac = createCrypto(curve).hash(Buffer.concat([hashKey, cipher]));

  return ok(
    new Cipher(
      new Aes(AES_128_CTR, ivBytes.toString("hex")),
      new Kdf(
        KDF_SCRYPT,
        new KdfParams(32, SCRYPT_N, SCRYPT_P, SCRYPT_R, salt.toString("hex"))
      ),
      cipher.toString("hex"),
      mac.toString("hex")
    )
  );
}

/**
 * Scrypt key
 * @param password - The password
 * @param salt - The salt
 * @param n - The n
 * @returns The derived key
 */
function scryptKey(password: string, salt: Buffer, n: number): Buffer {
  const derivedKey = scrypt(password, salt, {
    N: n,
    r: SCRYPT_R,
    p: SCRYPT_P,
    dkLen: SCRYPT_KEY_LEN
  });

  return Buffer.from(derivedKey);
}

/**
 * AES-CTR encrypt
 * @param key - The key
 * @param iv - The iv
 * @param message - The message
 * @returns The encrypted buffer
 */
function aesCtrEncrypt(key: Buffer, iv: Buffer, message: Buffer): Buffer {
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Hex.parse(message.toString("hex")),
    CryptoJS.enc.Hex.parse(key.toString("hex")),
    {
      iv: CryptoJS.enc.Hex.parse(iv.toString("hex")),
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.NoPadding // no padding
    }
  );
  return Buffer.from(encrypted.ciphertext.toString(CryptoJS.enc.Hex), "hex");
}

/**
 * AES-CTR decrypt
 * @param key - The key
 * @param iv - The iv
 * @param cipher - The cipher
 * @returns The decrypted buffer
 */
function aesCtrDecrypt(key: Buffer, iv: Buffer, cipher: Buffer): Buffer {
  const decrypted = CryptoJS.AES.decrypt(
    CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(cipher.toString("hex"))
    }),
    CryptoJS.enc.Hex.parse(key.toString("hex")),
    {
      iv: CryptoJS.enc.Hex.parse(iv.toString("hex")),
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.NoPadding // no padding
    }
  );
  return Buffer.from(decrypted.toString(CryptoJS.enc.Hex), "hex");
}

export {
  // Constants
  AES_128_CTR,
  KDF_SCRYPT,
  SCRYPT_N,
  SCRYPT_P,
  SCRYPT_R,
  SCRYPT_KEY_LEN,
  // Classes
  FileKey,
  Cipher,
  Aes,
  Kdf,
  KdfParams,
  // Functions
  generateCipher,
  generateFileKey,
  decryptFileKey
};

