import { HEX_PREFIX } from "@/common/constants";
import { isHexString } from "@ethersproject/bytes";

/**
 * Strip the hex prefix from a hex string
 * @param hex - The hex string to strip the prefix from
 * @returns The hex string without the prefix
 */
export function stripHexPrefix(hex: string): string {
  if (!isHexString(hex)) {
    throw new Error("Invalid hex string");
  }
  return hex.startsWith(HEX_PREFIX) ? hex.slice(HEX_PREFIX.length) : hex;
}

/**
 * Ensure the hex string has 0x prefix
 * @param hex - The original hex string
 * @returns The hex string with 0x prefix
 */
export function addHexPrefix(hex: string): string {
  return hex.startsWith(HEX_PREFIX) ? hex : HEX_PREFIX + hex;
}
