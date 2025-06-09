import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import * as bip39 from "@scure/bip39";
import { wordlist as english } from "@scure/bip39/wordlists/english";
import { wordlist as japanese } from "@scure/bip39/wordlists/japanese";
import { wordlist as simplifiedChinese } from "@scure/bip39/wordlists/simplified-chinese";

describe("BIP39", () => {
  describe("generateMnemonic", () => {
    it("should generate 12-word mnemonic by default", () => {
      const mnemonic = bip39.generateMnemonic(english);
      const words = mnemonic.split(" ");

      expect(words).toHaveLength(12);
      expect(bip39.validateMnemonic(mnemonic, english)).toBe(true);
    });

    it("should generate mnemonic with different strengths", () => {
      // 128 bits = 12 words
      const mnemonic12 = bip39.generateMnemonic(english, 128);
      expect(mnemonic12.split(" ")).toHaveLength(12);

      // 160 bits = 15 words
      const mnemonic15 = bip39.generateMnemonic(english, 160);
      expect(mnemonic15.split(" ")).toHaveLength(15);

      // 192 bits = 18 words
      const mnemonic18 = bip39.generateMnemonic(english, 192);
      expect(mnemonic18.split(" ")).toHaveLength(18);

      // 224 bits = 21 words
      const mnemonic21 = bip39.generateMnemonic(english, 224);
      expect(mnemonic21.split(" ")).toHaveLength(21);

      // 256 bits = 24 words
      const mnemonic24 = bip39.generateMnemonic(english, 256);
      expect(mnemonic24.split(" ")).toHaveLength(24);
    });

    it("should generate different mnemonics each time", () => {
      const mnemonic1 = bip39.generateMnemonic(english);
      const mnemonic2 = bip39.generateMnemonic(english);

      expect(mnemonic1).not.toBe(mnemonic2);
    });

    it("should throw error for invalid strength", () => {
      expect(() => bip39.generateMnemonic(english, 120)).toThrow();
      expect(() => bip39.generateMnemonic(english, 260)).toThrow();
    });
  });

  describe("validateMnemonic", () => {
    it("should validate correct mnemonic", () => {
      const mnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      expect(bip39.validateMnemonic(mnemonic, english)).toBe(true);
    });

    it("should reject invalid mnemonic", () => {
      const invalidMnemonic =
        "invalid mnemonic phrase that should not validate";
      expect(bip39.validateMnemonic(invalidMnemonic, english)).toBe(false);
    });

    it("should reject mnemonic with wrong word count", () => {
      const shortMnemonic = "abandon abandon abandon";
      expect(bip39.validateMnemonic(shortMnemonic, english)).toBe(false);

      const longMnemonic = "abandon ".repeat(25).trim();
      expect(bip39.validateMnemonic(longMnemonic, english)).toBe(false);
    });

    it("should reject mnemonic with invalid checksum", () => {
      const invalidChecksum =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";
      expect(bip39.validateMnemonic(invalidChecksum, english)).toBe(false);
    });

    it("should validate mnemonic with different wordlists", () => {
      const englishMnemonic = bip39.generateMnemonic(english);
      const japaneseMnemonic = bip39.generateMnemonic(japanese);
      const chineseMnemonic = bip39.generateMnemonic(simplifiedChinese);

      expect(bip39.validateMnemonic(englishMnemonic, english)).toBe(true);
      expect(bip39.validateMnemonic(japaneseMnemonic, japanese)).toBe(true);
      expect(bip39.validateMnemonic(chineseMnemonic, simplifiedChinese)).toBe(
        true
      );

      // Cross-validation should fail
      expect(bip39.validateMnemonic(englishMnemonic, japanese)).toBe(false);
    });
  });

  describe("mnemonicToEntropy", () => {
    it("should convert mnemonic to entropy", () => {
      const mnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      const entropy = bip39.mnemonicToEntropy(mnemonic, english);

      expect(entropy).toBeInstanceOf(Uint8Array);
      expect(entropy.length).toBe(16); // 128 bits = 16 bytes
      expect(bytesToHex(entropy)).toBe("00000000000000000000000000000000");
    });

    it("should handle different mnemonic lengths", () => {
      const mnemonic12 = bip39.generateMnemonic(english, 128);
      const mnemonic15 = bip39.generateMnemonic(english, 160);
      const mnemonic18 = bip39.generateMnemonic(english, 192);
      const mnemonic21 = bip39.generateMnemonic(english, 224);
      const mnemonic24 = bip39.generateMnemonic(english, 256);

      expect(bip39.mnemonicToEntropy(mnemonic12, english).length).toBe(16); // 128 bits
      expect(bip39.mnemonicToEntropy(mnemonic15, english).length).toBe(20); // 160 bits
      expect(bip39.mnemonicToEntropy(mnemonic18, english).length).toBe(24); // 192 bits
      expect(bip39.mnemonicToEntropy(mnemonic21, english).length).toBe(28); // 224 bits
      expect(bip39.mnemonicToEntropy(mnemonic24, english).length).toBe(32); // 256 bits
    });

    it("should throw error for invalid mnemonic", () => {
      const invalidMnemonic = "invalid mnemonic phrase";
      expect(() => bip39.mnemonicToEntropy(invalidMnemonic, english)).toThrow();
    });
  });

  describe("entropyToMnemonic", () => {
    it("should convert entropy to mnemonic", () => {
      const entropy = new Uint8Array(16); // 128 bits of zeros
      const mnemonic = bip39.entropyToMnemonic(entropy, english);

      expect(mnemonic).toBe(
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
      );
      expect(bip39.validateMnemonic(mnemonic, english)).toBe(true);
    });

    it("should handle different entropy lengths", () => {
      const entropy16 = new Uint8Array(16); // 128 bits
      const entropy20 = new Uint8Array(20); // 160 bits
      const entropy24 = new Uint8Array(24); // 192 bits
      const entropy28 = new Uint8Array(28); // 224 bits
      const entropy32 = new Uint8Array(32); // 256 bits

      const mnemonic16 = bip39.entropyToMnemonic(entropy16, english);
      const mnemonic20 = bip39.entropyToMnemonic(entropy20, english);
      const mnemonic24 = bip39.entropyToMnemonic(entropy24, english);
      const mnemonic28 = bip39.entropyToMnemonic(entropy28, english);
      const mnemonic32 = bip39.entropyToMnemonic(entropy32, english);

      expect(mnemonic16.split(" ")).toHaveLength(12);
      expect(mnemonic20.split(" ")).toHaveLength(15);
      expect(mnemonic24.split(" ")).toHaveLength(18);
      expect(mnemonic28.split(" ")).toHaveLength(21);
      expect(mnemonic32.split(" ")).toHaveLength(24);
    });

    it("should be reversible with mnemonicToEntropy", () => {
      const originalEntropy = hexToBytes("0123456789abcdef0123456789abcdef");
      const mnemonic = bip39.entropyToMnemonic(originalEntropy, english);
      const recoveredEntropy = bip39.mnemonicToEntropy(mnemonic, english);

      expect(bytesToHex(recoveredEntropy)).toBe(bytesToHex(originalEntropy));
    });

    it("should throw error for invalid entropy length", () => {
      const invalidEntropy = new Uint8Array(15); // Invalid length
      expect(() => bip39.entropyToMnemonic(invalidEntropy, english)).toThrow();
    });
  });

  describe("mnemonicToSeed", () => {
    it("should convert mnemonic to seed without passphrase", async () => {
      const mnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      const seed = await bip39.mnemonicToSeed(mnemonic);

      expect(seed).toBeInstanceOf(Uint8Array);
      expect(seed.length).toBe(64); // 512 bits = 64 bytes

      // Known test vector
      const expectedSeed =
        "5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4";
      expect(bytesToHex(seed)).toBe(expectedSeed);
    });

    it("should convert mnemonic to seed with passphrase", async () => {
      const mnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      const passphrase = "TREZOR";
      const seed = await bip39.mnemonicToSeed(mnemonic, passphrase);

      expect(seed).toBeInstanceOf(Uint8Array);
      expect(seed.length).toBe(64);

      // Different passphrase should produce different seed
      const seedWithoutPassphrase = await bip39.mnemonicToSeed(mnemonic);
      expect(bytesToHex(seed)).not.toBe(bytesToHex(seedWithoutPassphrase));
    });

    it("should produce different seeds for different passphrases", async () => {
      const mnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      const seed1 = await bip39.mnemonicToSeed(mnemonic, "passphrase1");
      const seed2 = await bip39.mnemonicToSeed(mnemonic, "passphrase2");

      expect(bytesToHex(seed1)).not.toBe(bytesToHex(seed2));
    });
  });

  describe("mnemonicToSeedSync", () => {
    it("should convert mnemonic to seed synchronously", () => {
      const mnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      const seed = bip39.mnemonicToSeedSync(mnemonic);

      expect(seed).toBeInstanceOf(Uint8Array);
      expect(seed.length).toBe(64);

      // Should match async version
      const expectedSeed =
        "5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4";
      expect(bytesToHex(seed)).toBe(expectedSeed);
    });

    it("should match async version", async () => {
      const mnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      const passphrase = "test";

      const syncSeed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
      const asyncSeed = await bip39.mnemonicToSeed(mnemonic, passphrase);

      expect(bytesToHex(syncSeed)).toBe(bytesToHex(asyncSeed));
    });
  });

  describe("wordlists", () => {
    it("should have correct wordlist lengths", () => {
      expect(english).toHaveLength(2048);
      expect(japanese).toHaveLength(2048);
      expect(simplifiedChinese).toHaveLength(2048);
    });

    it("should have unique words in each wordlist", () => {
      const englishSet = new Set(english);
      const japaneseSet = new Set(japanese);
      const chineseSet = new Set(simplifiedChinese);

      expect(englishSet.size).toBe(2048);
      expect(japaneseSet.size).toBe(2048);
      expect(chineseSet.size).toBe(2048);
    });

    it("should work with different wordlists", () => {
      const englishMnemonic = bip39.generateMnemonic(english);
      const japaneseMnemonic = bip39.generateMnemonic(japanese);
      const chineseMnemonic = bip39.generateMnemonic(simplifiedChinese);

      expect(bip39.validateMnemonic(englishMnemonic, english)).toBe(true);
      expect(bip39.validateMnemonic(japaneseMnemonic, japanese)).toBe(true);
      expect(bip39.validateMnemonic(chineseMnemonic, simplifiedChinese)).toBe(
        true
      );
    });
  });

  describe("BIP39 test vectors", () => {
    const testVectors = [
      {
        entropy: "00000000000000000000000000000000",
        mnemonic:
          "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
        seed: "5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4",
        passphrase: ""
      },
      {
        entropy: "7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f",
        mnemonic:
          "legal winner thank year wave sausage worth useful legal winner thank yellow",
        seed: "878386efb78845b3355bd15ea4d39ef97d179cb712b77d5c12b6be415fffeffe5f377ba02bf3f8544ab800b955e51fbff09828f682052a20faa6addbbddfb096",
        passphrase: ""
      },
      {
        entropy: "80808080808080808080808080808080",
        mnemonic:
          "letter advice cage absurd amount doctor acoustic avoid letter advice cage above",
        seed: "77d6be9708c8218738934f84bbbb78a2e048ca007746cb764f0673e4b1812d176bbb173e1a291f31cf633f1d0bad7d3cf071c30e98cd0688b5bcce65ecaceb36",
        passphrase: ""
      }
    ];

    testVectors.forEach((vector, index) => {
      it(`should match BIP39 test vector ${index + 1}`, async () => {
        const entropy = hexToBytes(vector.entropy);

        // Test entropy to mnemonic
        const mnemonic = bip39.entropyToMnemonic(entropy, english);
        expect(mnemonic).toBe(vector.mnemonic);

        // Test mnemonic validation
        expect(bip39.validateMnemonic(mnemonic, english)).toBe(true);

        // Test mnemonic to entropy
        const recoveredEntropy = bip39.mnemonicToEntropy(mnemonic, english);
        expect(bytesToHex(recoveredEntropy)).toBe(vector.entropy);

        // Test mnemonic to seed
        const seed = await bip39.mnemonicToSeed(mnemonic, vector.passphrase);
        expect(bytesToHex(seed)).toBe(vector.seed);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty passphrase", async () => {
      const mnemonic = bip39.generateMnemonic(english);
      const seed1 = await bip39.mnemonicToSeed(mnemonic, "");
      const seed2 = await bip39.mnemonicToSeed(mnemonic);

      expect(bytesToHex(seed1)).toBe(bytesToHex(seed2));
    });

    it("should handle unicode passphrase", async () => {
      const mnemonic = bip39.generateMnemonic(english);
      const unicodePassphrase = "测试密码🔐";

      const seed = await bip39.mnemonicToSeed(mnemonic, unicodePassphrase);
      expect(seed).toBeInstanceOf(Uint8Array);
      expect(seed.length).toBe(64);
    });

    it("should be case sensitive for passphrases", async () => {
      const mnemonic = bip39.generateMnemonic(english);
      const seed1 = await bip39.mnemonicToSeed(mnemonic, "Password");
      const seed2 = await bip39.mnemonicToSeed(mnemonic, "password");

      expect(bytesToHex(seed1)).not.toBe(bytesToHex(seed2));
    });

    it("should normalize mnemonic spaces", () => {
      const mnemonic =
        "abandon  abandon   abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      const normalizedMnemonic = mnemonic.replace(/\s+/g, " ").trim();

      expect(bip39.validateMnemonic(normalizedMnemonic, english)).toBe(true);
    });
  });

  describe("security considerations", () => {
    it("should generate cryptographically secure entropy", () => {
      const mnemonics = new Set();

      // Generate multiple mnemonics and ensure they're unique
      for (let i = 0; i < 100; i++) {
        const mnemonic = bip39.generateMnemonic(english);
        expect(mnemonics.has(mnemonic)).toBe(false);
        mnemonics.add(mnemonic);
      }
    });

    it("should produce deterministic results for same inputs", async () => {
      const mnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      const passphrase = "test";

      const seed1 = await bip39.mnemonicToSeed(mnemonic, passphrase);
      const seed2 = await bip39.mnemonicToSeed(mnemonic, passphrase);

      expect(bytesToHex(seed1)).toBe(bytesToHex(seed2));
    });

    it("should validate checksum correctly", () => {
      // Generate a valid mnemonic
      const validMnemonic = bip39.generateMnemonic(english);
      expect(bip39.validateMnemonic(validMnemonic, english)).toBe(true);

      // Modify last word to create invalid checksum
      const words = validMnemonic.split(" ");
      words[words.length - 1] = "abandon"; // Replace with different word
      const invalidMnemonic = words.join(" ");

      expect(bip39.validateMnemonic(invalidMnemonic, english)).toBe(false);
    });
  });
});
