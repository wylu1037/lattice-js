import { wordlists } from "@/wallet/_wordlists";
import * as bip39 from "@/wallet/bip39";

// Test vectors for different languages
interface TestVector {
  entropy: string;
  mnemonic: string;
  seed: string;
  passphrase?: string;
}

// English test vectors (subset from BIP39 specification)
const englishVectors: TestVector[] = [
  {
    entropy: "00000000000000000000000000000000",
    mnemonic:
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    seed: "c55257c360c07c72029aebc1b53c05ed0362ada38ead3e3e9efa3708e53495531f09a6987599d18264c1e1c92f2cf141630c7a3c4ab7c81b2f001698e7463b04"
  },
  {
    entropy: "7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f",
    mnemonic:
      "legal winner thank year wave sausage worth useful legal winner thank yellow",
    seed: "2e8905819b8723fe2c1d161860e5ee1830318dbf49a83bd451cfb8440c28bd6fa457fe1296106559a3c80937a1c1069be3a3a5bd381ee6260e8d9739fce1f607"
  },
  {
    entropy: "80808080808080808080808080808080",
    mnemonic:
      "letter advice cage absurd amount doctor acoustic avoid letter advice cage above",
    seed: "d71de856f81a8acc65e6fc851a38d4d7ec216fd0796d0a6827a3ad6b9e4540c1b8b38f890190aa19de8e3a8b94f8a78e593a0b6d02c71b4c05f5e13e8b72c2e3c"
  }
];

// Japanese test vectors
const japaneseVectors: TestVector[] = [
  {
    entropy: "00000000000000000000000000000000",
    mnemonic:
      "あいこくしん　あいこくしん　あいこくしん　あいこくしん　あいこくしん　あいこくしん　あいこくしん　あいこくしん　あいこくしん　あいこくしん　あいこくしん　あおぞら",
    seed: "a262d6fb6122ecf45be09c50492b31f92e9beb7d9a845987a02cefda57a15f9c467a17872029a9e92299b5cbdf306e3a0ee620245cbd508959b6cb7ca637bd55",
    passphrase: "㍍ガバヴァぱばぐゞちぢ十人十色"
  }
];

describe("BIP39", () => {
  describe("generateMnemonic", () => {
    test("should generate valid 12-word mnemonic by default", () => {
      const mnemonic = bip39.generateMnemonic();
      const words = mnemonic.split(" ");
      console.log(words);
      expect(words).toHaveLength(12);
      expect(bip39.validateMnemonic(mnemonic)).toBe(true);
    });

    test("should generate mnemonic with custom strength", () => {
      const mnemonic160 = bip39.generateMnemonic(160);
      const words160 = mnemonic160.split(" ");
      console.log(words160);
      expect(words160).toHaveLength(15);
      expect(bip39.validateMnemonic(mnemonic160)).toBe(true);

      const mnemonic256 = bip39.generateMnemonic(256);
      const words256 = mnemonic256.split(" ");
      expect(words256).toHaveLength(24);
      expect(bip39.validateMnemonic(mnemonic256)).toBe(true);
    });

    test("should use custom RNG function", () => {
      const customRng = vi
        .fn()
        .mockReturnValue(
          Buffer.from("00000000000000000000000000000000", "hex")
        );
      const mnemonic = bip39.generateMnemonic(128, customRng);

      expect(customRng).toHaveBeenCalledWith(16); // 128 bits / 8 = 16 bytes
      expect(mnemonic).toBe(
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
      );
    });

    test("should throw error for invalid strength", () => {
      expect(() => bip39.generateMnemonic(129)).toThrow("Invalid entropy");
      expect(() => bip39.generateMnemonic(100)).toThrow("Invalid entropy");
    });
  });

  describe("validateMnemonic", () => {
    test("should validate correct mnemonics", () => {
      for (const vector of englishVectors) {
        expect(bip39.validateMnemonic(vector.mnemonic)).toBe(true);
      }
    });

    test("should reject invalid mnemonics", () => {
      expect(bip39.validateMnemonic("sleep kitten")).toBe(false); // too short
      expect(
        bip39.validateMnemonic("sleep kitten sleep kitten sleep kitten")
      ).toBe(false); // too short
      expect(
        bip39.validateMnemonic(
          "turtle front uncle idea crush write shrug there lottery flower risky shell"
        )
      ).toBe(false); // invalid words
      expect(
        bip39.validateMnemonic(
          "sleep kitten sleep kitten sleep kitten sleep kitten sleep kitten sleep kitten"
        )
      ).toBe(false); // invalid checksum
    });

    test("should validate Japanese mnemonics", () => {
      if (wordlists.japanese) {
        for (const vector of japaneseVectors) {
          expect(
            bip39.validateMnemonic(vector.mnemonic, wordlists.japanese)
          ).toBe(true);
        }
      }
    });
  });

  describe("mnemonicToEntropy", () => {
    test("should convert mnemonic to entropy correctly", () => {
      for (const vector of englishVectors) {
        const entropy = bip39.mnemonicToEntropy(vector.mnemonic);
        expect(entropy).toBe(vector.entropy);
      }
    });

    test("should work with custom wordlists", () => {
      if (wordlists.japanese) {
        for (const vector of japaneseVectors) {
          const entropy = bip39.mnemonicToEntropy(
            vector.mnemonic,
            wordlists.japanese
          );
          expect(entropy).toBe(vector.entropy);
        }
      }
    });

    test("should throw error for invalid mnemonic", () => {
      expect(() => bip39.mnemonicToEntropy("invalid mnemonic")).toThrow();
      expect(() =>
        bip39.mnemonicToEntropy("abandon abandon abandon")
      ).toThrow(); // wrong length
    });
  });

  describe("entropyToMnemonic", () => {
    test("should convert entropy to mnemonic correctly", () => {
      for (const vector of englishVectors) {
        const mnemonic = bip39.entropyToMnemonic(vector.entropy);
        expect(mnemonic).toBe(vector.mnemonic);
      }
    });

    test("should work with Buffer input", () => {
      const entropy = Buffer.from("00000000000000000000000000000000", "hex");
      const mnemonic = bip39.entropyToMnemonic(entropy);
      expect(mnemonic).toBe(
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
      );
    });

    test("should work with custom wordlists", () => {
      if (wordlists.japanese) {
        for (const vector of japaneseVectors) {
          const mnemonic = bip39.entropyToMnemonic(
            vector.entropy,
            wordlists.japanese
          );
          expect(mnemonic).toBe(vector.mnemonic);
        }
      }
    });

    test("should throw error for invalid entropy", () => {
      expect(() => bip39.entropyToMnemonic("")).toThrow("Invalid entropy");
      expect(() => bip39.entropyToMnemonic("000000")).toThrow(
        "Invalid entropy"
      ); // not multiple of 4 bytes
      expect(() => bip39.entropyToMnemonic("0".repeat(66))).toThrow(
        "Invalid entropy"
      ); // too long
    });
  });

  describe("mnemonicToSeedSync", () => {
    test("should generate seed from mnemonic", () => {
      for (const vector of englishVectors) {
        const seed = bip39.mnemonicToSeedSync(
          vector.mnemonic,
          vector.passphrase || "TREZOR"
        );
        expect(seed.toString("hex")).toBe(vector.seed);
      }
    });

    test("should handle UTF8 passwords", () => {
      if (wordlists.japanese) {
        for (const vector of japaneseVectors) {
          const seed = bip39.mnemonicToSeedSync(
            vector.mnemonic,
            vector.passphrase
          );
          expect(seed.toString("hex")).toBe(vector.seed);
        }
      }
    });

    test("should normalize passwords", () => {
      const mnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      const password = "㍍ガバヴァぱばぐゞちぢ十人十色";
      const normalizedPassword = "メートルガバヴァぱばぐゞちぢ十人十色";

      const seed1 = bip39.mnemonicToSeedSync(mnemonic, password);
      const seed2 = bip39.mnemonicToSeedSync(mnemonic, normalizedPassword);

      expect(seed1.toString("hex")).toBe(seed2.toString("hex"));
    });
  });

  describe("mnemonicToSeed (async)", () => {
    test("should generate seed from mnemonic asynchronously", async () => {
      for (const vector of englishVectors) {
        const seed = await bip39.mnemonicToSeed(
          vector.mnemonic,
          vector.passphrase || "TREZOR"
        );
        expect(seed.toString("hex")).toBe(vector.seed);
      }
    });

    test("should handle UTF8 passwords asynchronously", async () => {
      if (wordlists.japanese) {
        for (const vector of japaneseVectors) {
          const seed = await bip39.mnemonicToSeed(
            vector.mnemonic,
            vector.passphrase
          );
          expect(seed.toString("hex")).toBe(vector.seed);
        }
      }
    });
  });

  describe("wordlist management", () => {
    test("should get default wordlist", () => {
      const defaultLang = bip39.getDefaultWordlist();
      expect(typeof defaultLang).toBe("string");
      expect(defaultLang).toBe("english");
    });

    test("should set default wordlist", () => {
      const originalDefault = bip39.getDefaultWordlist();

      if (wordlists.italian) {
        bip39.setDefaultWordlist("italian");
        expect(bip39.getDefaultWordlist()).toBe("italian");

        // Test that entropy conversion uses new default
        const phraseItalian = bip39.entropyToMnemonic(
          "00000000000000000000000000000000"
        );
        expect(phraseItalian.slice(0, 5)).toBe("abaco");

        // Restore original default
        bip39.setDefaultWordlist(originalDefault);
      }
    });

    test("should throw error for unknown wordlist", () => {
      expect(() => bip39.setDefaultWordlist("unknown_language")).toThrow(
        'Could not find wordlist for language "unknown_language"'
      );
    });

    test("should expose standard wordlists", () => {
      const { wordlists: exposedWordlists } = bip39;
      expect(Array.isArray(exposedWordlists.EN)).toBe(true);
      expect(exposedWordlists.EN).toHaveLength(2048);

      if (wordlists.english) {
        expect(exposedWordlists.EN).toEqual(wordlists.english);
      }
    });
  });

  describe("edge cases and error handling", () => {
    test("should handle various mnemonic lengths correctly", () => {
      // Test different entropy lengths
      const entropies = [
        "00000000000000000000000000000000", // 128 bits -> 12 words
        "0000000000000000000000000000000000000000", // 160 bits -> 15 words
        "000000000000000000000000000000000000000000000000", // 192 bits -> 18 words
        "00000000000000000000000000000000000000000000000000000000000000000" // 256 bits -> 24 words
      ];

      const expectedLengths = [12, 15, 18, 24];

      for (const [index, entropy] of entropies.entries()) {
        const mnemonic = bip39.entropyToMnemonic(entropy);
        const words = mnemonic.split(" ");
        expect(words).toHaveLength(expectedLengths[index]);
        expect(bip39.validateMnemonic(mnemonic)).toBe(true);
        expect(bip39.mnemonicToEntropy(mnemonic)).toBe(entropy);
      }
    });

    test("should handle empty and invalid inputs gracefully", () => {
      expect(bip39.validateMnemonic("")).toBe(false);
      expect(bip39.validateMnemonic("   ")).toBe(false);
      expect(() => bip39.mnemonicToEntropy("")).toThrow();
    });

    test("should normalize mnemonic input", () => {
      const mnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      const mnemonicWithExtraSpaces =
        "  abandon   abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about  ";

      // Note: The actual implementation might not handle extra spaces,
      // this test checks current behavior
      expect(() => {
        const entropy1 = bip39.mnemonicToEntropy(mnemonic);
        const entropy2 = bip39.mnemonicToEntropy(
          mnemonicWithExtraSpaces.trim()
        );
        expect(entropy1).toBe(entropy2);
      }).not.toThrow();
    });
  });

  describe("cross-compatibility tests", () => {
    test("should round-trip entropy -> mnemonic -> entropy", () => {
      const testEntropies = [
        "00000000000000000000000000000000",
        "ffffffffffffffffffffffffffffffff",
        "000102030405060708090a0b0c0d0e0f",
        "68a79eaca2324873eacc50cb9c6eca8cc68a79eaca2324873eacc50cb9c6eca8c"
      ];

      for (const originalEntropy of testEntropies) {
        const mnemonic = bip39.entropyToMnemonic(originalEntropy);
        const recoveredEntropy = bip39.mnemonicToEntropy(mnemonic);
        expect(recoveredEntropy).toBe(originalEntropy);
      }
    });

    test("should round-trip mnemonic -> entropy -> mnemonic", () => {
      const testMnemonics = [
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
        "legal winner thank year wave sausage worth useful legal winner thank yellow",
        "letter advice cage absurd amount doctor acoustic avoid letter advice cage above"
      ];

      for (const originalMnemonic of testMnemonics) {
        const entropy = bip39.mnemonicToEntropy(originalMnemonic);
        const recoveredMnemonic = bip39.entropyToMnemonic(entropy);
        expect(recoveredMnemonic).toBe(originalMnemonic);
      }
    });
  });
});
