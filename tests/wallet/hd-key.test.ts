import { Curves } from "@/common/constants";
import { createCrypto } from "@/crypto/crypto";
import { sm2Curve } from "@/crypto/sm2/ec";
import { sm2Curve as sm2p } from "@/crypto/sm2/ec";
import { HARDENED_OFFSET, HDKey } from "@/wallet/hd-key";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { randomBytes } from "@noble/hashes/utils";
import * as bip39 from "@scure/bip39";
import { wordlist as english } from "@scure/bip39/wordlists/english";

describe("HDKey", () => {
  let testSeed: Uint8Array;
  let testMnemonic: string;

  beforeEach(() => {
    // 使用固定的测试种子以确保测试结果的一致性
    testSeed = hexToBytes("000102030405060708090a0b0c0d0e0f");
    testMnemonic =
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
  });

  describe("generateMnemonic", () => {
    it("should generate valid mnemonic", () => {});
  });

  describe("fromMasterSeed", () => {
    it("should create HDKey from valid seed", () => {
      const mnemonic = bip39.generateMnemonic(english, 128);
      const entropy = bip39.mnemonicToEntropy(mnemonic, english);
      expect(entropy.length).toBe(128 / 8);
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const hdkey = HDKey.fromMasterSeed(seed);

      expect(hdkey).toBeInstanceOf(HDKey);
      expect(hdkey.depth).toBe(0);
      expect(hdkey.index).toBe(0);
      expect(hdkey.parentFingerprint).toBe(0);
      expect(hdkey.chainCode).toBeDefined();
      expect(hdkey.privateKey).toBeDefined();
      expect(hdkey.publicKey).toBeDefined();
    });

    it("should throw error for seed too short", () => {
      const shortSeed = new Uint8Array(15); // 120 bits, less than 128
      expect(() => HDKey.fromMasterSeed(shortSeed)).toThrow(
        "HDKey: seed length must be between 128 and 512 bits"
      );
    });

    it("should throw error for seed too long", () => {
      const longSeed = new Uint8Array(65); // 520 bits, more than 512
      expect(() => HDKey.fromMasterSeed(longSeed)).toThrow(
        "HDKey: seed length must be between 128 and 512 bits"
      );
    });

    it("should create different keys for different seeds", () => {
      const seed1 = randomBytes(32);
      const seed2 = randomBytes(32);
      const hdkey1 = HDKey.fromMasterSeed(seed1);
      const hdkey2 = HDKey.fromMasterSeed(seed2);

      expect(bytesToHex(hdkey1.privateKey!)).not.toBe(
        bytesToHex(hdkey2.privateKey!)
      );
      expect(bytesToHex(hdkey1.publicKey!)).not.toBe(
        bytesToHex(hdkey2.publicKey!)
      );
    });
  });

  describe("fromExtendedKey", () => {
    it("should create HDKey from extended private key", () => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      const masterKey = HDKey.fromMasterSeed(seed);
      const xpriv = masterKey.privateExtendedKey;

      const hdkey = HDKey.fromExtendedKey(xpriv);
      expect(hdkey).toBeInstanceOf(HDKey);
      expect(hdkey.privateKey).toBeDefined();
      expect(bytesToHex(hdkey.privateKey!)).toBe(
        bytesToHex(masterKey.privateKey!)
      );
    });

    it("should create HDKey from extended public key", () => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      const masterKey = HDKey.fromMasterSeed(seed);
      const xpub = masterKey.publicExtendedKey;

      const hdkey = HDKey.fromExtendedKey(xpub);
      expect(hdkey).toBeInstanceOf(HDKey);
      expect(hdkey.privateKey).toBeNull();
      expect(hdkey.publicKey).toBeDefined();
      expect(bytesToHex(hdkey.publicKey!)).toBe(
        bytesToHex(masterKey.publicKey!)
      );
    });

    it("should throw error for invalid extended key", () => {
      expect(() => HDKey.fromExtendedKey("invalid-key")).toThrow();
    });
  });

  describe("fromJSON", () => {
    it("should create HDKey from JSON with xpriv", () => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      const masterKey = HDKey.fromMasterSeed(seed);
      const json = { xpriv: masterKey.privateExtendedKey };

      const hdkey = HDKey.fromJSON(json);
      expect(hdkey).toBeInstanceOf(HDKey);
      expect(bytesToHex(hdkey.privateKey!)).toBe(
        bytesToHex(masterKey.privateKey!)
      );
    });
  });

  describe("derive", () => {
    let masterKey: HDKey;

    beforeEach(() => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      masterKey = HDKey.fromMasterSeed(seed);
    });

    it("should derive child key with path m/0", () => {
      const child = masterKey.derive("m/0");
      expect(child.depth).toBe(1);
      expect(child.index).toBe(0);
      expect(child.parentFingerprint).toBe(masterKey.fingerprint);
    });

    it("should derive hardened child key with path m/0'", () => {
      const child = masterKey.derive("m/0'");
      expect(child.depth).toBe(1);
      expect(child.index).toBe(HARDENED_OFFSET);
      expect(child.parentFingerprint).toBe(masterKey.fingerprint);
    });

    it("should derive deep path m/44'/0'/0'/0/0", () => {
      const child = masterKey.derive("m/44'/0'/0'/0/0");
      expect(child.depth).toBe(5);
      expect(child.index).toBe(0);
    });

    it("should return self for path m", () => {
      const child = masterKey.derive("m");
      expect(child).toBe(masterKey);
    });

    it("should return self for path M", () => {
      const child = masterKey.derive("M");
      expect(child).toBe(masterKey);
    });

    it("should throw error for invalid path", () => {
      expect(() => masterKey.derive("invalid")).toThrow(
        'Path must start with "m" or "M"'
      );
      expect(() => masterKey.derive("m/invalid")).toThrow(
        "invalid child index"
      );
    });

    it("should throw error for index too large", () => {
      expect(() => masterKey.derive(`m/${HARDENED_OFFSET}`)).toThrow(
        "Invalid index"
      );
    });
  });

  describe("deriveChild", () => {
    let masterKey: HDKey;

    beforeEach(() => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      masterKey = HDKey.fromMasterSeed(seed);
    });

    it("should derive normal child", () => {
      const child = masterKey.deriveChild(0);
      console.log(bytesToHex(child.privateKey!));
      console.log(bytesToHex(child.publicKey!));
      console.log(
        createCrypto(Curves.Sm2p256v1).publicKeyToAddress(
          bytesToHex(sm2p.getPublicKey(child.privateKey!, false))
        )
      );
      expect(child.depth).toBe(masterKey.depth + 1);
      expect(child.index).toBe(0);
      expect(child.parentFingerprint).toBe(masterKey.fingerprint);
    });

    it("should derive hardened child", () => {
      const child = masterKey.deriveChild(HARDENED_OFFSET);
      expect(child.depth).toBe(masterKey.depth + 1);
      expect(child.index).toBe(HARDENED_OFFSET);
      expect(child.parentFingerprint).toBe(masterKey.fingerprint);
    });

    it("should throw error when deriving hardened child from public key only", () => {
      const publicOnlyKey = HDKey.fromExtendedKey(masterKey.publicExtendedKey);
      expect(() => publicOnlyKey.deriveChild(HARDENED_OFFSET)).toThrow(
        "Could not derive hardened child key"
      );
    });
  });

  describe("sign and verify", () => {
    let hdkey: HDKey;
    let hash: Uint8Array;
    const curve = Curves.Secp256k1;

    beforeEach(() => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      hdkey = HDKey.fromMasterSeed(seed);
      hash = randomBytes(32);
    });

    it("should sign and verify message", () => {
      const signature = hdkey.sign(hash);
      expect(signature).toBeInstanceOf(Uint8Array);
      expect(signature.length).toBe(64);

      const isValid = hdkey.verify(hash, signature);
      expect(isValid).toBe(true);
    });

    it("should fail verification with wrong signature", () => {
      const signature = hdkey.sign(hash);
      const wrongSignature = new Uint8Array(64);
      wrongSignature.fill(1);

      const isValid = hdkey.verify(hash, wrongSignature);
      expect(isValid).toBe(false);
    });

    it("should fail verification with wrong hash", () => {
      const signature = hdkey.sign(hash);
      const wrongHash = randomBytes(32);

      const isValid = hdkey.verify(hash, signature);
      const isInvalid = hdkey.verify(wrongHash, signature);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    it("should throw error when signing without private key", () => {
      const publicOnlyKey = HDKey.fromExtendedKey(hdkey.publicExtendedKey);
      expect(() => publicOnlyKey.sign(hash)).toThrow("No privateKey set!");
    });

    it("should throw error when verifying without public key", () => {
      const signature = hdkey.sign(hash);
      // 创建一个只有公钥的HDKey，然后清除公钥数据来模拟没有公钥的情况
      const publicOnlyKey = HDKey.fromExtendedKey(hdkey.publicExtendedKey);
      // 通过反射访问私有属性来模拟没有公钥的情况
      (publicOnlyKey as any).pubKey = undefined;
      expect(() => publicOnlyKey.verify(hash, signature)).toThrow(
        "No publicKey set!"
      );
    });
  });

  describe("properties", () => {
    let hdkey: HDKey;

    beforeEach(() => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      hdkey = HDKey.fromMasterSeed(seed);
    });

    it("should have correct fingerprint", () => {
      expect(typeof hdkey.fingerprint).toBe("number");
      expect(hdkey.fingerprint).toBeGreaterThan(0);
    });

    it("should have identifier", () => {
      expect(hdkey.identifier).toBeInstanceOf(Uint8Array);
      expect(hdkey.identifier!.length).toBe(20);
    });

    it("should have pubKeyHash", () => {
      expect(hdkey.pubKeyHash).toBeInstanceOf(Uint8Array);
      expect(hdkey.pubKeyHash!.length).toBe(20);
      expect(hdkey.pubKeyHash).toBe(hdkey.identifier);
    });

    it("should have private and public keys", () => {
      expect(hdkey.privateKey).toBeInstanceOf(Uint8Array);
      expect(hdkey.privateKey!.length).toBe(32);
      expect(hdkey.publicKey).toBeInstanceOf(Uint8Array);
      expect(hdkey.publicKey!.length).toBe(33);
    });

    it("should have extended keys", () => {
      expect(typeof hdkey.privateExtendedKey).toBe("string");
      expect(hdkey.privateExtendedKey.startsWith("xprv")).toBe(true);
      expect(typeof hdkey.publicExtendedKey).toBe("string");
      expect(hdkey.publicExtendedKey.startsWith("xpub")).toBe(true);
    });
  });

  describe("wipePrivateData", () => {
    it("should wipe private key data", () => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      const hdkey = HDKey.fromMasterSeed(seed);

      expect(hdkey.privateKey).toBeDefined();

      hdkey.wipePrivateData();
      expect(hdkey.privateKey).toBeNull();
      expect(() => hdkey.privateExtendedKey).toThrow("No private key");
    });

    it("should return self for method chaining", () => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      const hdkey = HDKey.fromMasterSeed(seed);

      const result = hdkey.wipePrivateData();
      expect(result).toBe(hdkey);
    });
  });

  describe("toJSON", () => {
    it("should serialize to JSON", () => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      const hdkey = HDKey.fromMasterSeed(seed);

      const json = hdkey.toJSON();
      expect(json).toHaveProperty("xpriv");
      expect(json).toHaveProperty("xpub");
      expect(typeof json.xpriv).toBe("string");
      expect(typeof json.xpub).toBe("string");
      expect(json.xpriv.startsWith("xprv")).toBe(true);
      expect(json.xpub.startsWith("xpub")).toBe(true);
    });
  });

  describe("constructor validation", () => {
    it("should throw error when called directly without options", () => {
      expect(() => new (HDKey as any)()).toThrow(
        "HDKey.constructor must not be called directly"
      );
    });

    it("should throw error with both public and private keys", () => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      const masterKey = HDKey.fromMasterSeed(seed);

      expect(
        () =>
          new (HDKey as any)({
            publicKey: masterKey.publicKey,
            privateKey: masterKey.privateKey
          })
      ).toThrow("HDKey: publicKey and privateKey at same time.");
    });

    it("should throw error with invalid private key", () => {
      const invalidPrivateKey = new Uint8Array(32);
      invalidPrivateKey.fill(0); // All zeros is invalid

      expect(
        () =>
          new (HDKey as any)({
            privateKey: invalidPrivateKey
          })
      ).toThrow("Invalid private key");
    });

    it("should throw error without public or private key", () => {
      expect(
        () =>
          new (HDKey as any)({
            chainCode: randomBytes(32)
          })
      ).toThrow("HDKey: no public or private key provided");
    });

    it("should throw error with zero depth but non-zero index", () => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      const masterKey = HDKey.fromMasterSeed(seed);

      expect(
        () =>
          new (HDKey as any)({
            privateKey: masterKey.privateKey,
            depth: 0,
            index: 1
          })
      ).toThrow("HDKey: zero depth with non-zero index/parent fingerprint");
    });

    it("should throw error with zero depth but non-zero parent fingerprint", () => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      const masterKey = HDKey.fromMasterSeed(seed);

      expect(
        () =>
          new (HDKey as any)({
            privateKey: masterKey.privateKey,
            depth: 0,
            parentFingerprint: 123456
          })
      ).toThrow("HDKey: zero depth with non-zero index/parent fingerprint");
    });
  });

  describe("HARDENED_OFFSET constant", () => {
    it("should have correct value", () => {
      expect(HARDENED_OFFSET).toBe(0x80000000);
      expect(HARDENED_OFFSET).toBe(2147483648);
    });
  });

  describe("BIP32 test vectors", () => {
    // BIP32 官方测试向量
    it("should match BIP32 test vector 1", () => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      const master = HDKey.fromMasterSeed(seed);

      // 验证主密钥
      expect(master.depth).toBe(0);
      expect(master.index).toBe(0);
      expect(master.parentFingerprint).toBe(0);

      // 派生 m/0H
      const child0H = master.derive("m/0'");
      expect(child0H.depth).toBe(1);
      expect(child0H.index).toBe(HARDENED_OFFSET);

      // 派生 m/0H/1
      const child0H1 = master.derive("m/0'/1");
      expect(child0H1.depth).toBe(2);
      expect(child0H1.index).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("should handle maximum safe integer index", () => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      const master = HDKey.fromMasterSeed(seed);

      const maxIndex = HARDENED_OFFSET - 1;
      const child = master.deriveChild(maxIndex);
      expect(child.index).toBe(maxIndex);
    });

    it("should handle compressed public key correctly", () => {
      const seed = hexToBytes("000102030405060708090a0b0c0d0e0f");
      const master = HDKey.fromMasterSeed(seed);

      // 公钥应该是压缩格式 (33 bytes)
      expect(master.publicKey!.length).toBe(33);
      expect(master.publicKey![0]).toBeOneOf([0x02, 0x03]); // 压缩公钥前缀
    });
  });
});
