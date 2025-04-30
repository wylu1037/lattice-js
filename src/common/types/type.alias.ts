import { z } from "zod";

export const HashSchema = z.string().regex(/^0x[0-9a-fA-F]{64}$/, "Invalid hash");
export type Hash = z.infer<typeof HashSchema>;

export const AddressSchema = z.union([
  z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Invalid eth address"),
  z.string().regex(/^zltc_[0-9a-fA-F]{33}$/, "Invalid zltc address"),
]);
export type Address = z.infer<typeof AddressSchema>;

export const UInt64Schema = z.bigint()
.refine(val => val >= 0n, "Must be positive or zero")
.refine(val => val <= 18446744073709551615n, "Value too large for uint64");
export type UInt64 = z.infer<typeof UInt64Schema>;

export const CurveSchema = z.enum(["Secp256k1", "Sm2p256v1"]);
export type Curve = z.infer<typeof CurveSchema>;