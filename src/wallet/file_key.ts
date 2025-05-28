import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
  scryptSync
} from "node:crypto";
import { type Curve, Curves, HEX_PREFIX } from "@/common/constants";
import { newCrypto } from "@/crypto";
import { Result, err, ok } from "neverthrow";

const AES_128_CTR = "aes-128-ctr";
const KDF_SCRYPT = "scrypt";
const SCRYPT_N = 1 << 12; // 1<<18 = 262144，CPU/内存成本因子，控制计算和内存的使用量。
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

function generateFileKey(
  privateKey: string,
  passphrase: string,
  curve: Curve
): Result<FileKey, Error> {
  const crypto = newCrypto(curve);
  const address = crypto.publicKeyToAddress(
    crypto.getPublicKeyFromPrivateKey(privateKey)
  );
  const uuid = randomUUID();
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

function generateCipher(
  privateKey: string,
  passphrase: string,
  curve: Curve
): Result<Cipher, Error> {
  // generate salt
  const salt = randomBytes(32);
  const key = scryptKey(passphrase, salt, SCRYPT_N);
  const aesKey = key.subarray(0, AES_BLOCK_SIZE);
  const hashKey = key.subarray(AES_BLOCK_SIZE, AES_BLOCK_SIZE * 2); // compact amc

  const ivBytes = randomBytes(AES_BLOCK_SIZE);
  const cipher = aes128Ctr(
    aesKey,
    ivBytes,
    Buffer.from(
      privateKey.startsWith(HEX_PREFIX)
        ? privateKey.slice(HEX_PREFIX.length)
        : privateKey,
      "hex"
    )
  );
  const mac = newCrypto(curve).hash(Buffer.concat([hashKey, cipher]));

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

function scryptKey(password: string, salt: Buffer, n: number): Buffer {
  const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LEN, {
    N: n,
    p: SCRYPT_P,
    r: SCRYPT_R
  });

  return derivedKey;
}

function aes128Ctr(key: Buffer, iv: Buffer, secret: Buffer): Buffer {
  const cipher = createCipheriv(AES_128_CTR, key, iv);
  return Buffer.concat([cipher.update(secret), cipher.final()]);
}

function aes128CtrDecrypt(secret: Buffer, iv: Buffer): Buffer {
  const decipher = createDecipheriv(AES_128_CTR, secret, iv);
  return Buffer.concat([decipher.update(secret), decipher.final()]);
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
  generateFileKey
};

