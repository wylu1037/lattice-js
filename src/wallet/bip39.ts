import { pbkdf2, pbkdf2Async } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha2";
import { sha512 } from "@noble/hashes/sha2";
import { randomBytes } from "@noble/hashes/utils";
import { _default as _DEFAULT_WORDLIST, wordlists } from "./_wordlists";

let DEFAULT_WORDLIST: string[] | undefined = _DEFAULT_WORDLIST;

const INVALID_MNEMONIC = "Invalid mnemonic";
const INVALID_ENTROPY = "Invalid entropy";
const INVALID_CHECKSUM = "Invalid mnemonic checksum";
const WORDLIST_REQUIRED =
  "A wordlist is required but a default could not be found.\n" +
  "Please pass a 2048 word array explicitly.";

function normalize(str?: string): string {
  return (str || "").normalize("NFKD");
}

function lpad(str: string, padString: string, length: number): string {
  let newStr = str;
  while (newStr.length < length) {
    newStr = padString + newStr;
  }
  return newStr;
}

function binaryToByte(bin: string): number {
  return parseInt(bin, 2);
}

function bytesToBinary(bytes: number[]): string {
  return bytes.map((x: number): string => lpad(x.toString(2), "0", 8)).join("");
}

function deriveChecksumBits(entropyBuffer: Buffer): string {
  const ENT = entropyBuffer.length * 8;
  const CS = ENT / 32;
  const hash = sha256(Uint8Array.from(entropyBuffer));
  return bytesToBinary(Array.from(hash)).slice(0, CS);
}

function salt(password?: string): string {
  return `mnemonic${password || ""}`;
}

export function mnemonicToSeedSync(
  mnemonic: string,
  password?: string
): Buffer {
  const mnemonicBuffer = Uint8Array.from(
    Buffer.from(normalize(mnemonic), "utf8")
  );
  const saltBuffer = Uint8Array.from(
    Buffer.from(salt(normalize(password)), "utf8")
  );
  const res = pbkdf2(sha512, mnemonicBuffer, saltBuffer, {
    c: 2048,
    dkLen: 64
  });
  return Buffer.from(res);
}

export function mnemonicToSeed(
  mnemonic: string,
  password?: string
): Promise<Buffer> {
  const mnemonicBuffer = Uint8Array.from(
    Buffer.from(normalize(mnemonic), "utf8")
  );
  const saltBuffer = Uint8Array.from(
    Buffer.from(salt(normalize(password)), "utf8")
  );
  return pbkdf2Async(sha512, mnemonicBuffer, saltBuffer, {
    c: 2048,
    dkLen: 64
  }).then((res: Uint8Array): Buffer => Buffer.from(res));
}

export function mnemonicToEntropy(
  mnemonic: string,
  wordlist?: string[]
): string {
  const finalWordlist = wordlist || DEFAULT_WORDLIST;
  if (!finalWordlist) {
    throw new Error(WORDLIST_REQUIRED);
  }

  const words = normalize(mnemonic).split(" ");
  if (words.length % 3 !== 0) {
    throw new Error(INVALID_MNEMONIC);
  }

  // convert word indices to 11 bit binary strings
  const bits = words
    .map((word: string): string => {
      const index = finalWordlist.indexOf(word);
      if (index === -1) {
        throw new Error(INVALID_MNEMONIC);
      }

      return lpad(index.toString(2), "0", 11);
    })
    .join("");

  // split the binary string into ENT/CS
  const dividerIndex = Math.floor(bits.length / 33) * 32;
  const entropyBits = bits.slice(0, dividerIndex);
  const checksumBits = bits.slice(dividerIndex);

  // calculate the checksum and compare
  const entropyBytes = entropyBits.match(/(.{1,8})/g)?.map(binaryToByte) || [];
  if (entropyBytes.length < 16) {
    throw new Error(INVALID_ENTROPY);
  }
  if (entropyBytes.length > 32) {
    throw new Error(INVALID_ENTROPY);
  }
  if (entropyBytes.length % 4 !== 0) {
    throw new Error(INVALID_ENTROPY);
  }

  const entropy = Buffer.from(entropyBytes);
  const newChecksum = deriveChecksumBits(entropy);
  if (newChecksum !== checksumBits) {
    throw new Error(INVALID_CHECKSUM);
  }

  return entropy.toString("hex");
}

export function entropyToMnemonic(
  entropy: Buffer | string,
  wordlist?: string[]
): string {
  const finalEntropy = Buffer.isBuffer(entropy)
    ? entropy
    : Buffer.from(entropy, "hex");
  const finalWordlist = wordlist || DEFAULT_WORDLIST;
  if (!finalWordlist) {
    throw new Error(WORDLIST_REQUIRED);
  }

  // 128 <= ENT <= 256
  if (finalEntropy.length < 16) {
    throw new TypeError(INVALID_ENTROPY);
  }
  if (finalEntropy.length > 32) {
    throw new TypeError(INVALID_ENTROPY);
  }
  if (finalEntropy.length % 4 !== 0) {
    throw new TypeError(INVALID_ENTROPY);
  }

  const entropyBits = bytesToBinary(Array.from(finalEntropy));
  const checksumBits = deriveChecksumBits(finalEntropy);

  const bits = entropyBits + checksumBits;
  const chunks = bits.match(/(.{1,11})/g);
  if (!chunks) {
    throw new Error(INVALID_MNEMONIC);
  }
  const words = chunks.map((binary: string): string => {
    const index = binaryToByte(binary);
    return finalWordlist[index];
  });

  return finalWordlist[0] === "\u3042\u3044\u3053\u304f\u3057\u3093" // Japanese wordlist
    ? words.join("\u3000")
    : words.join(" ");
}

export function generateMnemonic(
  strength?: number,
  rng?: (size: number) => Buffer,
  wordlist?: string[]
): string {
  const finalStrength = strength || 128;
  if (finalStrength % 32 !== 0) {
    throw new TypeError(INVALID_ENTROPY);
  }
  const finalRng =
    rng || ((size: number): Buffer => Buffer.from(randomBytes(size)));
  return entropyToMnemonic(finalRng(finalStrength / 8), wordlist);
}

export function validateMnemonic(
  mnemonic: string,
  wordlist?: string[]
): boolean {
  try {
    mnemonicToEntropy(mnemonic, wordlist);
  } catch (e) {
    return false;
  }

  return true;
}

export function setDefaultWordlist(language: string): void {
  const result = wordlists[language];
  if (result) {
    DEFAULT_WORDLIST = result;
  } else {
    throw new Error(`Could not find wordlist for language "${language}"`);
  }
}

export function getDefaultWordlist(): string {
  if (!DEFAULT_WORDLIST) {
    throw new Error("No Default Wordlist set");
  }
  return Object.keys(wordlists).filter((lang: string): boolean => {
    if (lang === "JA" || lang === "EN") {
      return false;
    }
    return wordlists[lang].every(
      (word: string, index: number): boolean =>
        word === DEFAULT_WORDLIST?.[index]
    );
  })[0];
}

export { wordlists } from "./_wordlists";