/**
 *  About bytes32 strings...
 *
 *  @_docloc: api/utils:Bytes32 Strings
 */

import type { BytesLike } from "@ethersproject/bytes";
import { toUtf8Bytes, toUtf8String } from "@ethersproject/strings";
import { getBytes, zeroPadBytes } from "./index";

/**
 *  Encodes %%text%% as a Bytes32 string.
 */
export function encodeBytes32String(text: string): string {
  /**
   * Get the bytes
   */
  const bytes = toUtf8Bytes(text);

  if (bytes.length > 31) {
    /**
     * Check we have room for null-termination
     */
    throw new Error("bytes32 string must be less than 32 bytes");
  }

  /**
   * Zero-pad (implicitly null-terminates)
   */
  return zeroPadBytes(bytes, 32);
}

/**
 *  Encodes the Bytes32-encoded %%bytes%% into a string.
 */
export function decodeBytes32String(_bytes: BytesLike): string {
  const data = getBytes(_bytes, "bytes");

  if (data.length !== 32) {
    /**
     * Must be 32 bytes with a null-termination
     */
    throw new Error("invalid bytes32 - not 32 bytes long");
  }
  if (data[31] !== 0) {
    throw new Error("invalid bytes32 string - no null terminator");
  }

  /**
   * Find the null termination
   */
  let length = 31;
  while (data[length - 1] === 0) {
    length--;
  }

  /**
   * Determine the string value
   */
  return toUtf8String(data.slice(0, length));
}

/**
 * Encodes a Buffer into an array of Bytes32 strings.
 */
export function encodeBytes32Array(bytes: Buffer): string[] {
  const result: string[] = [];
  for (let i = 0; i < bytes.length; i += 32) {
    const chunk = Buffer.alloc(32);
    bytes.copy(chunk, 0, i, Math.min(i + 32, bytes.length));
    result.push(zeroPadBytes(chunk, 32));
  }
  return result;
}

export function decodeBytes32Array(bytes: string[]): Buffer[] {
  const result: Buffer[] = [];
  for (const b of bytes) {
    const decoded = decodeBytes32String(b);
    const chunk = Buffer.from(decoded, "hex");
    result.push(chunk);
  }
  return result;
}

/**
 * Convert an array of hex strings to a buffer with trimmed zeros.
 * For example: ["0x1234567890abcdef", "0xabcdef1234567890"] -> Buffer([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
 * @param hexStrings - An array of hex strings.
 * @returns A buffer containing the concatenated hex strings.
 */
export function hexStringsToBufferWithTrimmedZeros(
  hexStrings: string[]
): Buffer {
  if (!hexStrings || hexStrings.length === 0) {
    return Buffer.alloc(0);
  }

  const buffers: Buffer[] = hexStrings.map((hexString) => {
    const cleanHexString = hexString.startsWith("0x")
      ? hexString.slice(2)
      : hexString;
    // Assuming each string is a valid hex representation of 32 bytes,
    // so cleanHexString.length should be 64.
    // No explicit validation here as per problem description focusing on the conversion and trimming.
    return Buffer.from(cleanHexString, "hex");
  });

  const combinedBuffer = Buffer.concat(buffers);

  if (combinedBuffer.length === 0) {
    return combinedBuffer;
  }

  let end = combinedBuffer.length;
  while (end > 0 && combinedBuffer[end - 1] === 0) {
    end--;
  }

  return combinedBuffer.subarray(0, end);
}